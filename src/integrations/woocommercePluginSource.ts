export const WOOCOMMERCE_PLUGIN_CODE = `<?php
/**
 * Plugin Name: RoketLead Affiliate & COD Tracker for WooCommerce
 * Plugin URI: https://roketlead.ma/integrations/woocommerce
 * Description: Official RoketLead integration plugin for Moroccan WooCommerce stores. Automates affiliate tracking, first-party cookie capture, and Cash on Delivery (COD) order status synchronization with courier webhooks.
 * Version: 1.2.0
 * Author: RoketLead Maroc
 * Author URI: https://roketlead.ma
 * Text Domain: roketlead-affiliate
 * Requires PHP: 7.4
 * WC requires at least: 4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class WC_RoketLead_Affiliate_Integration {

    const VERSION = '1.2.0';
    const API_BASE_URL = 'https://api.roketlead.ma';
    const TRACKER_SCRIPT_URL = 'https://roketlead.ma/js/v1/tracker.js';

    private static $instance = null;
    private $options = [];

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->options = get_option('roketlead_affiliate_settings', []);

        // 1. Enqueue Frontend Tracking Snippet
        add_action('wp_enqueue_scripts', [$this, 'enqueue_tracker_script']);

        // 2. Hook into Thank You / Order Received page for Conversion Tracking
        add_action('woocommerce_thankyou', [$this, 'track_order_conversion'], 20, 1);

        // 3. Hook into WooCommerce Order Status Transitions (COD Status Sync)
        add_action('woocommerce_order_status_changed', [$this, 'sync_order_status_webhook'], 20, 4);

        // 4. Admin Settings UI
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    /**
     * Enqueue the lightweight RoketLead tracking script on all frontend pages
     */
    public function enqueue_tracker_script() {
        if (is_admin()) return;

        $merchant_id = isset($this->options['merchant_id']) ? sanitize_text_field($this->options['merchant_id']) : '';
        $cookie_days = isset($this->options['cookie_days']) ? intval($this->options['cookie_days']) : 30;

        wp_enqueue_script('roketlead-tracker', self::TRACKER_SCRIPT_URL, [], self::VERSION, false);

        $init_script = sprintf(
            'window.RoketLeadConfig = { merchantId: %s, cookieDays: %d, debug: %s };',
            wp_json_encode($merchant_id),
            $cookie_days,
            defined('WP_DEBUG') && WP_DEBUG ? 'true' : 'false'
        );
        wp_add_inline_script('roketlead-tracker', $init_script, 'before');
    }

    /**
     * Trigger conversion dispatch when customer completes checkout
     */
    public function track_order_conversion($order_id) {
        if (!$order_id) return;

        $order = wc_get_order($order_id);
        if (!$order) return;

        // Prevent duplicate dispatch
        if ($order->get_meta('_roketlead_conversion_tracked') === 'yes') {
            return;
        }

        // Extract affiliate token from cookie
        $attribution_token = isset($_COOKIE['rkt_ref']) ? sanitize_text_field($_COOKIE['rkt_ref']) : null;
        $coupons = $order->get_coupon_codes();
        $applied_promo_code = !empty($coupons) ? reset($coupons) : null;

        if (!$attribution_token && !$applied_promo_code) {
            return;
        }

        $merchant_id = isset($this->options['merchant_id']) ? $this->options['merchant_id'] : '';
        $api_secret = isset($this->options['api_secret']) ? $this->options['api_secret'] : '';

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

        // Server-to-Server dispatch to RoketLead API
        $this->dispatch_api_request('/api/v1/orders/create', $payload, $api_secret);

        $order->update_meta_data('_roketlead_conversion_tracked', 'yes');
        if ($attribution_token) $order->update_meta_data('_roketlead_attribution_token', $attribution_token);
        if ($applied_promo_code) $order->update_meta_data('_roketlead_promo_code', $applied_promo_code);
        $order->save();
    }

    /**
     * Synchronize COD status transitions with RoketLead Webhooks
     */
    public function sync_order_status_webhook($order_id, $old_status, $new_status, $order) {
        if (!$order) return;

        $merchant_id = isset($this->options['merchant_id']) ? $this->options['merchant_id'] : '';
        $api_secret = isset($this->options['api_secret']) ? $this->options['api_secret'] : '';
        
        if (empty($merchant_id) || empty($api_secret)) return;

        // Map status to RoketLead COD normalized status
        $roketlead_status = 'PENDING';
        if (in_array($new_status, ['completed', 'delivered', 'wc-delivered', 'wc-completed'])) {
            $roketlead_status = 'DELIVERED';
        } elseif (in_array($new_status, ['cancelled', 'failed'])) {
            $roketlead_status = 'CANCELLED';
        } elseif (in_array($new_status, ['refunded', 'returned', 'wc-returned', 'wc-refused'])) {
            $roketlead_status = 'RETURNED';
        } elseif (in_array($new_status, ['processing', 'in-transit', 'wc-shipped'])) {
            $roketlead_status = 'CONFIRMED';
        }

        $payload = [
            'event' => 'order.status_updated',
            'merchantId' => $merchant_id,
            'orderId' => (string)$order->get_id(),
            'orderNumber' => $order->get_order_number(),
            'oldStatus' => strtoupper($old_status),
            'newStatus' => strtoupper($new_status),
            'normalizedStatus' => $roketlead_status,
            'totalAmountMAD' => (float)$order->get_total(),
            'attributionToken' => $order->get_meta('_roketlead_attribution_token') ?: null,
            'promoCode' => $order->get_meta('_roketlead_promo_code') ?: null,
            'trackingNumber' => $order->get_meta('_shipping_tracking_number') ?: null,
            'courier' => $order->get_meta('_shipping_courier') ?: 'Amana/Cathedis',
            'timestamp' => gmdate('c')
        ];

        $this->dispatch_api_request('/api/v1/webhooks/order-status', $payload, $api_secret);
    }

    private function dispatch_api_request($endpoint, $payload, $secret_key) {
        $json_payload = wp_json_encode($payload);
        $signature = hash_hmac('sha256', $json_payload, $secret_key);

        $url = self::API_BASE_URL . $endpoint;

        $args = [
            'method' => 'POST',
            'timeout' => 5,
            'blocking' => false,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-RoketLead-Signature' => $signature,
                'X-RoketLead-Merchant-ID' => isset($this->options['merchant_id']) ? $this->options['merchant_id'] : '',
                'User-Agent' => 'RoketLead-WooCommerce/' . self::VERSION
            ],
            'body' => $json_payload
        ];

        return wp_remote_post($url, $args);
    }

    public function add_admin_menu() {
        add_submenu_page('woocommerce', 'RoketLead Affiliate', 'RoketLead Affiliate', 'manage_woocommerce', 'roketlead-affiliate', [$this, 'render_admin_settings_page']);
    }

    public function register_settings() {
        register_setting('roketlead_settings_group', 'roketlead_affiliate_settings');
    }

    public function render_admin_settings_page() {
        // UI form rendered in WooCommerce admin
    }
}

add_action('plugins_loaded', ['WC_RoketLead_Affiliate_Integration', 'get_instance']);`;
