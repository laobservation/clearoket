export const TRACKER_JS_CODE = `/**
 * Roketlead Client-Side Tracking Pixel (roketlead.com/js/pixel.js)
 * High-performance, lightweight (1.8 KB) vanilla attribution engine for Moroccan e-commerce stores
 * 
 * Features:
 * - Automatically captures attribution parameters (?ref=, ?rkt=, ?aff=, ?c=) from rkt.ma shortlinks
 * - 30-Day First-Party Cookie + LocalStorage fallback
 * - Exposes RoketleadPixel.trackPurchase({ orderId, amount, currency })
 * - Posts purchase payload securely to roketlead.com/api/v1/pixel/purchase with API Key verification
 * - Client-side deduplication prevents duplicate conversions on page reloads
 */
(function (window, document) {
  'use strict';

  var ROKETLEAD_API_ENDPOINT = 'https://roketlead.com/api/v1/pixel/purchase';
  var COOKIE_NAME = 'rkt_ref';
  var COOKIE_EXP_NAME = 'rkt_exp';
  var STORAGE_KEY = 'roketlead_attribution_data';
  var DEDUP_KEY = 'roketlead_processed_orders';
  var DEFAULT_WINDOW_DAYS = 30;

  var RoketleadPixel = {
    version: '2.0.0',
    apiKey: null,
    config: {
      cookieDays: DEFAULT_WINDOW_DAYS,
      apiUrl: ROKETLEAD_API_ENDPOINT,
      debug: false
    },

    /**
     * Helper to read query parameter from current URL
     */
    getQueryParam: function (param) {
      var searchParams = new URLSearchParams(window.location.search);
      return searchParams.get(param);
    },

    /**
     * Write First-Party Cookie
     */
    setCookie: function (name, value, days) {
      var expires = '';
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      }
      var domain = window.location.hostname.replace(/^www\\./, '');
      var domainAttr = domain.indexOf('.') !== -1 && domain !== 'localhost' ? '; domain=.' + domain : '';
      document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + domainAttr + '; SameSite=Lax; Secure';
    },

    /**
     * Read First-Party Cookie
     */
    getCookie: function (name) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
      return null;
    },

    /**
     * Persist attribution data
     */
    saveAttribution: function (promoterToken, metadata) {
      if (!promoterToken) return;

      var expDays = this.config.cookieDays || DEFAULT_WINDOW_DAYS;
      var expiresAt = new Date().getTime() + expDays * 24 * 60 * 60 * 1000;

      var payload = {
        promoterToken: promoterToken,
        referrer: document.referrer || '',
        landingPage: window.location.href,
        timestamp: new Date().toISOString(),
        expiresAt: expiresAt,
        metadata: metadata || {}
      };

      // 1. First-Party Cookie
      this.setCookie(COOKIE_NAME, promoterToken, expDays);
      this.setCookie(COOKIE_EXP_NAME, String(expiresAt), expDays);

      // 2. LocalStorage fallback
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}

      if (this.config.debug) {
        console.log('[Roketlead Pixel] Captured promoter attribution:', promoterToken, payload);
      }
    },

    /**
     * Retrieve active attribution token
     */
    getAttribution: function () {
      var cookieVal = this.getCookie(COOKIE_NAME);
      if (cookieVal) return { token: cookieVal, source: 'cookie' };

      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed.expiresAt && new Date().getTime() < parsed.expiresAt) {
            return { token: parsed.promoterToken, source: 'localStorage', data: parsed };
          }
        }
      } catch (e) {}

      return null;
    },

    /**
     * Anti-duplication check for Thank-You page refreshes
     */
    isOrderProcessed: function (orderId) {
      try {
        var processed = JSON.parse(localStorage.getItem(DEDUP_KEY) || '[]');
        return processed.indexOf(String(orderId)) !== -1;
      } catch (e) {
        return false;
      }
    },

    markOrderProcessed: function (orderId) {
      try {
        var processed = JSON.parse(localStorage.getItem(DEDUP_KEY) || '[]');
        if (processed.indexOf(String(orderId)) === -1) {
          processed.push(String(orderId));
          if (processed.length > 50) processed.shift();
          localStorage.setItem(DEDUP_KEY, JSON.stringify(processed));
        }
      } catch (e) {}
    },

    /**
     * Primary Thank-You Page Purchase Tracking Function
     * Example: RoketleadPixel.trackPurchase({ orderId: '1001', amount: 350, currency: 'MAD' });
     */
    trackPurchase: function (purchaseData) {
      var self = this;
      if (!purchaseData || !purchaseData.orderId) {
        console.error('[Roketlead Pixel] trackPurchase requires orderId');
        return Promise.reject(new Error('Missing orderId'));
      }

      if (this.isOrderProcessed(purchaseData.orderId)) {
        if (this.config.debug) console.warn('[Roketlead Pixel] Duplicate order purchase skipped:', purchaseData.orderId);
        return Promise.resolve({ success: true, duplicate: true, orderId: purchaseData.orderId });
      }

      var attribution = this.getAttribution();
      var promoCode = purchaseData.promoCode || this.getQueryParam('coupon') || null;

      var payload = {
        apiKey: this.apiKey || window.ROKETLEAD_API_KEY || null,
        orderId: String(purchaseData.orderId),
        amount: parseFloat(purchaseData.amount || purchaseData.total || 0),
        currency: purchaseData.currency || 'MAD',
        promoterToken: attribution ? attribution.token : null,
        promoCode: promoCode,
        customerCity: purchaseData.city || purchaseData.customerCity || 'Morocco',
        customerPhone: purchaseData.phone || purchaseData.customerPhone || null,
        courier: purchaseData.courier || 'Pending Dispatch',
        pageUrl: window.location.href,
        referrer: document.referrer || '',
        timestamp: new Date().toISOString()
      };

      this.markOrderProcessed(purchaseData.orderId);

      var endpoint = this.config.apiUrl;

      // Prefer navigator.sendBeacon when available for guaranteed transmission on page unloads
      if (navigator.sendBeacon && typeof Blob !== 'undefined') {
        try {
          var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          var beaconSuccess = navigator.sendBeacon(endpoint, blob);
          if (beaconSuccess) {
            return Promise.resolve({ success: true, method: 'beacon', payload: payload });
          }
        } catch (e) {}
      }

      // Fallback to fetch API
      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Roketlead-Pixel-Version': '2.0.0'
        },
        body: JSON.stringify(payload),
        keepalive: true
      })
      .then(function (res) { return res.json(); })
      .then(function (data) { 
        if (self.config.debug) console.log('[Roketlead Pixel] Purchase tracked successfully:', data);
        return data; 
      })
      .catch(function (err) {
        console.error('[Roketlead Pixel] Failed to track purchase:', err);
        return { error: true, message: err.message };
      });
    },

    /**
     * Initialize Pixel and capture incoming link parameters
     */
    init: function (apiKey, options) {
      if (apiKey) this.apiKey = apiKey;
      if (options) {
        if (options.cookieDays) this.config.cookieDays = options.cookieDays;
        if (options.apiUrl) this.config.apiUrl = options.apiUrl;
        if (options.debug) this.config.debug = options.debug;
      }

      // Capture promoter shortlink clicks from rkt.ma or roketlead.com/r/
      var refParam = this.getQueryParam('ref') || 
                     this.getQueryParam('rkt') || 
                     this.getQueryParam('c') || 
                     this.getQueryParam('aff') || 
                     this.getQueryParam('affiliate');

      if (refParam) {
        this.saveAttribution(refParam, {
          utmSource: this.getQueryParam('utm_source'),
          utmMedium: this.getQueryParam('utm_medium'),
          utmCampaign: this.getQueryParam('utm_campaign')
        });
      }

      var couponParam = this.getQueryParam('coupon') || this.getQueryParam('discount');
      if (couponParam) {
        try { sessionStorage.setItem('rkt_promo_code', couponParam); } catch (e) {}
      }
    }
  };

  // Expose to window
  window.RoketleadPixel = RoketleadPixel;
  window.RoketLead = RoketleadPixel; // Backward compatibility alias

  // Auto-init with global key if defined
  if (window.ROKETLEAD_API_KEY) {
    RoketleadPixel.init(window.ROKETLEAD_API_KEY);
  } else {
    RoketleadPixel.init();
  }
})(window, document);`;

export const THANK_YOU_PAGE_SNIPPET = `<!-- 1. Include Roketlead Pixel Script in the <head> -->
<script src="https://roketlead.com/js/pixel.js"></script>
<script>
  RoketleadPixel.init("YOUR_STORE_PIXEL_API_KEY");
</script>

<!-- 2. On Your Order Confirmation / Thank-You Page -->
<script>
  document.addEventListener("DOMContentLoaded", function() {
    RoketleadPixel.trackPurchase({
      orderId: "1001",       // Dynamic order ID
      amount: 350,           // Order amount in MAD
      currency: "MAD",       // Currency
      city: "Casablanca"     // Optional Moroccan city
    }).then(function(res) {
      console.log("Roketlead attribution confirmed:", res);
    });
  });
</script>`;

