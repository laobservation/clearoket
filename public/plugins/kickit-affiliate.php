<?php
/**
 * Plugin Name: Kickit Affiliate & COD Tracker for WooCommerce
 * Plugin URI: https://kickit.ma/integrations/woocommerce
 * Description: Official Kickit integration plugin for Moroccan WooCommerce stores. Automates affiliate tracking, first-party cookie capture, and Cash on Delivery (COD) order status synchronization with courier webhooks.
 * Version: 1.2.0
 * Author: Kickit Maroc
 * Author URI: https://kickit.ma
 * Text Domain: kickit-affiliate
 * Domain Path: /languages
 * Requires at least: 5.6
 * Requires PHP: 7.4
 * WC requires at least: 4.0
 * WC tested up to: 8.5
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class WC_Kickit_Affiliate_Integration {

    const VERSION = '1.2.0';
    const API_BASE_URL = 'https://api.kickit.ma';
    const TRACKER_SCRIPT_URL = 'https://kickit.ma/js/v1/tracker.js';

    private static $instance = null;
    private $options = [];

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->options = get_option('kickit_affiliate_settings', []);

        // 1. Enqueue Frontend Tracking Snippet
        add_action('wp_enqueue_scripts', [$this, 'enqueue_tracker_script']);

        // 2. Hook into Thank You / Order Received page for Conversion Tracking
        add_action('woocommerce_thankyou', [$this, 'track_order_conversion'], 20, 1);

        // 3. Hook into WooCommerce Order Status Transitions (COD Status Sync)
        add_action('woocommerce_order_status_changed', [$this, 'sync_order_status_webhook'], 20, 4);

        // 4. Admin Settings UI
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);

        // 5. Add custom action links in Plugins list
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_action_links']);
    }

    /**
     * Enqueue the lightweight Kickit tracking script on all frontend pages
     */
    public function enqueue_tracker_script() {
        if (is_admin()) return;

        $merchant_id = isset($this->options['merchant_id']) ? sanitize_text_field($this->options['merchant_id']) : '';
        $cookie_days = isset($this->options['cookie_days']) ? intval($this->options['cookie_days']) : 30;

        wp_enqueue_script('kickit-tracker', self::TRACKER_SCRIPT_URL, [], self::VERSION, false);

        // Inline init configuration
        $init_script = sprintf(
            'window.KickitConfig = { merchantId: %s, cookieDays: %d, debug: %s };',
            wp_json_encode($merchant_id),
            $cookie_days,
            defined('WP_DEBUG') && WP_DEBUG ? 'true' : 'false'
        );
        wp_add_inline_script('kickit-tracker', $init_script, 'before');
    }

    /**
     * Trigger conversion dispatch when customer completes checkout
     */
    public function track_order_conversion($order_id) {
        if (!$order_id) return;

        $order = wc_get_order($order_id);
        if (!$order) return;

        // Prevent duplicate dispatch
        $already_tracked = $order->get_meta('_kickit_conversion_tracked');
        if ($already_tracked === 'yes') {
            return;
        }

        // Extract affiliate token from cookie or URL
        $attribution_token = isset($_COOKIE['kck_ref']) ? sanitize_text_field($_COOKIE['kck_ref']) : null;
        
        // Extract applied coupons
        $coupons = $order->get_coupon_codes();
        $applied_promo_code = !empty($coupons) ? reset($coupons) : null;

        // Skip if neither affiliate token nor coupon is present
        if (!$attribution_token && !$applied_promo_code) {
            return;
        }

        $merchant_id = isset($this->options['merchant_id']) ? $this->options['merchant_id'] : '';
        $api_secret = isset($this->options['api_secret']) ? $this->options['api_secret'] : '';

        // Prepare order items
        $items = [];
        foreach ($order->get_items() as $item_id => $item) {
            $product = $item->get_product();
            $items[] = [
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'totalMAD' => (float)$item->get_total(),
                'sku' => $product ? $product->get_sku() : ''
            ];
        }

        $payload = [
            'merchantId' => $merchant_id,
            'orderId' => (string)$order->get_id(),
            'orderNumber' => $order->get_order_number(),
            'totalAmountMAD' => (float)$order->get_total(),
            'currency' => $order->get_currency() ?: 'MAD',
            'paymentMethod' => $order->get_payment_method(),
            'isCOD' => $order->get_payment_method() === 'cod',
            'attributionToken' => $attribution_token,
            'promoCode' => $applied_promo_code,
            'customer' => [
                'firstName' => $order->get_billing_first_name(),
                'lastName' => $order->get_billing_last_name(),
                'city' => $order->get_billing_city() ?: $order->get_shipping_city() ?: 'Morocco',
                'phone' => $order->get_billing_phone(),
                'email' => $order->get_billing_email()
            ],
            'shipping' => [
                'city' => $order->get_shipping_city() ?: $order->get_billing_city(),
                'address' => $order->get_shipping_address_1()
            ],
            'items' => $items,
            'status' => 'PENDING',
            'timestamp' => gmdate('c')
        ];

        // Send Server-to-Server dispatch to Kickit API
        $this->dispatch_api_request('/api/v1/orders/create', $payload, $api_secret);

        // Mark as tracked
        $order->update_meta_data('_kickit_conversion_tracked', 'yes');
        if ($attribution_token) {
            $order->update_meta_data('_kickit_attribution_token', $attribution_token);
        }
        if ($applied_promo_code) {
            $order->update_meta_data('_kickit_promo_code', $applied_promo_code);
        }
        $order->save();
    }

    /**
     * Synchronize COD status transitions with Kickit Webhooks
     * Automatically triggers when order is marked as completed/delivered or returned/cancelled
     */
    public function sync_order_status_webhook($order_id, $old_status, $new_status, $order) {
        if (!$order) return;

        $merchant_id = isset($this->options['merchant_id']) ? $this->options['merchant_id'] : '';
        $api_secret = isset($this->options['api_secret']) ? $this->options['api_secret'] : '';
        
        if (empty($merchant_id) || empty($api_secret)) {
            return;
        }

        // Map WooCommerce statuses to Kickit COD normalized status
        $kickit_status = 'PENDING';
        if (in_array($new_status, ['completed', 'delivered', 'wc-delivered', 'wc-completed'])) {
            $kickit_status = 'DELIVERED';
        } elseif (in_array($new_status, ['cancelled', 'failed'])) {
            $kickit_status = 'CANCELLED';
        } elseif (in_array($new_status, ['refunded', 'returned', 'wc-returned', 'wc-refused'])) {
            $kickit_status = 'RETURNED';
        } elseif (in_array($new_status, ['processing', 'in-transit', 'wc-shipped'])) {
            $kickit_status = 'CONFIRMED';
        }

        $payload = [
            'event' => 'order.status_updated',
            'merchantId' => $merchant_id,
            'orderId' => (string)$order->get_id(),
            'orderNumber' => $order->get_order_number(),
            'oldStatus' => strtoupper($old_status),
            'newStatus' => strtoupper($new_status),
            'normalizedStatus' => $kickit_status,
            'totalAmountMAD' => (float)$order->get_total(),
            'attributionToken' => $order->get_meta('_kickit_attribution_token') ?: null,
            'promoCode' => $order->get_meta('_kickit_promo_code') ?: null,
            'trackingNumber' => $order->get_meta('_shipping_tracking_number') ?: $order->get_meta('tracking_number') ?: null,
            'courier' => $order->get_meta('_shipping_courier') ?: 'Amana/Cathedis',
            'timestamp' => gmdate('c')
        ];

        // Non-blocking Webhook dispatch
        $this->dispatch_api_request('/api/v1/webhooks/order-status', $payload, $api_secret);
    }

    /**
     * Dispatch HTTP POST with HMAC-SHA256 Signature
     */
    private function dispatch_api_request($endpoint, $payload, $secret_key) {
        $json_payload = wp_json_encode($payload);
        $signature = hash_hmac('sha256', $json_payload, $secret_key);

        $url = self::API_BASE_URL . $endpoint;

        $args = [
            'method' => 'POST',
            'timeout' => 5,
            'redirection' => 2,
            'httpversion' => '1.1',
            'blocking' => false, // Non-blocking asynchronous dispatch
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Kickit-Signature' => $signature,
                'X-Kickit-Merchant-ID' => isset($this->options['merchant_id']) ? $this->options['merchant_id'] : '',
                'User-Agent' => 'Kickit-WooCommerce/' . self::VERSION . ' (WordPress ' . get_bloginfo('version') . ')'
            ],
            'body' => $json_payload
        ];

        return wp_remote_post($url, $args);
    }

    /**
     * Admin Settings Menu under WooCommerce
     */
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            __('Kickit Affiliate & COD Settings', 'kickit-affiliate'),
            __('Kickit Affiliate', 'kickit-affiliate'),
            'manage_woocommerce',
            'kickit-affiliate',
            [$this, 'render_admin_settings_page']
        );
    }

    public function register_settings() {
        register_setting('kickit_settings_group', 'kickit_affiliate_settings', [
            'sanitize_callback' => [$this, 'sanitize_settings']
        ]);
    }

    public function sanitize_settings($input) {
        $clean = [];
        $clean['merchant_id'] = sanitize_text_field($input['merchant_id'] ?? '');
        $clean['api_secret'] = sanitize_text_field($input['api_secret'] ?? '');
        $clean['cookie_days'] = intval($input['cookie_days'] ?? 30);
        return $clean;
    }

    public function add_action_links($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=kickit-affiliate') . '">' . __('Settings', 'kickit-affiliate') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Render Plugin Settings UI
     */
    public function render_admin_settings_page() {
        $merchant_id = esc_attr($this->options['merchant_id'] ?? '');
        $api_secret = esc_attr($this->options['api_secret'] ?? '');
        $cookie_days = esc_attr($this->options['cookie_days'] ?? '30');
        ?>
        <div class="wrap">
            <h1><span style="color:#2563eb;font-weight:900;">kickit.</span> <?php _e('Moroccan Affiliate & COD Integration', 'kickit-affiliate'); ?></h1>
            <p><?php _e('Connect your Moroccan WooCommerce store directly to the Kickit performance marketing network.', 'kickit-affiliate'); ?></p>

            <form method="post" action="options.php" style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-radius:12px;max-width:700px;margin-top:20px;">
                <?php settings_fields('kickit_settings_group'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="merchant_id"><?php _e('Merchant ID (Slug)', 'kickit-affiliate'); ?></label></th>
                        <td>
                            <input type="text" id="merchant_id" name="kickit_affiliate_settings[merchant_id]" value="<?php echo $merchant_id; ?>" class="regular-text" placeholder="e.g. merch-01 or atlas-botanicals" required />
                            <p class="description"><?php _e('Found in your Kickit Brand Dashboard under API Settings.', 'kickit-affiliate'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="api_secret"><?php _e('API Integration Secret Key', 'kickit-affiliate'); ?></label></th>
                        <td>
                            <input type="password" id="api_secret" name="kickit_affiliate_settings[api_secret]" value="<?php echo $api_secret; ?>" class="regular-text" placeholder="sec_live_..." required />
                            <p class="description"><?php _e('Used to generate HMAC-SHA256 signatures for COD delivery notifications.', 'kickit-affiliate'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="cookie_days"><?php _e('Attribution Cookie Window', 'kickit-affiliate'); ?></label></th>
                        <td>
                            <input type="number" id="cookie_days" name="kickit_affiliate_settings[cookie_days]" value="<?php echo $cookie_days; ?>" min="1" max="90" class="small-text" /> <?php _e('Days', 'kickit-affiliate'); ?>
                            <p class="description"><?php _e('Default is 30 days for Moroccan e-commerce campaigns.', 'kickit-affiliate'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(__('Save & Sync Connection', 'kickit-affiliate'), 'primary'); ?>
            </form>
        </div>
        <?php
    }
}

// Initialize the plugin
add_action('plugins_loaded', ['WC_Kickit_Affiliate_Integration', 'get_instance']);
