/**
 * Kickit.ma Client-Side Tracking Engine (v1.2.0)
 * Ultra-lightweight Vanilla JS Attribution Script for Moroccan E-Commerce & COD Stores
 * 
 * Features:
 * - Auto-detects URL parameters (?ref=, ?aff=, ?kck=, ?kck_id=) & kck.ma short links
 * - Dual persistence: First-Party Cookie (SameSite=Lax) + localStorage fallback
 * - Configurable attribution window (Default: 30 days)
 * - Exposes window.Kickit.trackOrder() for custom checkouts (YouCan, WooCommerce, Shopify, Custom)
 * - Client-side deduplication prevents duplicate conversions
 */
(function (window, document) {
  'use strict';

  var KICKIT_API_HOST = 'https://api.kickit.ma';
  var COOKIE_NAME = 'kck_ref';
  var COOKIE_EXP_NAME = 'kck_exp';
  var STORAGE_KEY = 'kickit_attribution_data';
  var DEDUP_KEY = 'kickit_processed_orders';
  var DEFAULT_WINDOW_DAYS = 30;

  var Kickit = {
    version: '1.2.0',
    config: {
      cookieDays: DEFAULT_WINDOW_DAYS,
      apiUrl: KICKIT_API_HOST + '/api/v1/orders/create',
      merchantId: null,
      debug: false
    },

    /**
     * Parse query parameter from current URL
     */
    getQueryParam: function (param) {
      var searchParams = new URLSearchParams(window.location.search);
      return searchParams.get(param);
    },

    /**
     * Set a First-Party Cookie
     */
    setCookie: function (name, value, days) {
      var expires = '';
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      }
      var domain = window.location.hostname.replace(/^www\./, '');
      // In localhost or root domains, omit leading dot for maximum compatibility
      var domainAttr = domain.indexOf('.') !== -1 && domain !== 'localhost' ? '; domain=.' + domain : '';
      document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + domainAttr + '; SameSite=Lax; Secure';
    },

    /**
     * Get a First-Party Cookie
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
     * Store attribution data across Cookie and localStorage
     */
    saveAttribution: function (token, metadata) {
      if (!token) return;

      var expDays = this.config.cookieDays || DEFAULT_WINDOW_DAYS;
      var expiresAt = new Date().getTime() + expDays * 24 * 60 * 60 * 1000;

      var payload = {
        token: token,
        referrer: document.referrer || '',
        landingPage: window.location.href,
        timestamp: new Date().toISOString(),
        expiresAt: expiresAt,
        metadata: metadata || {}
      };

      // 1. First-Party Cookie
      this.setCookie(COOKIE_NAME, token, expDays);
      this.setCookie(COOKIE_EXP_NAME, String(expiresAt), expDays);

      // 2. LocalStorage backup
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        // Handle private browsing quota exceptions
      }

      if (this.config.debug) {
        console.log('[Kickit] Attribution captured for token:', token, payload);
      }
    },

    /**
     * Retrieve active attribution token
     */
    getAttribution: function () {
      // 1. Try Cookie
      var cookieVal = this.getCookie(COOKIE_NAME);
      if (cookieVal) {
        return { token: cookieVal, source: 'cookie' };
      }

      // 2. Try localStorage fallback with expiration check
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed.expiresAt && new Date().getTime() < parsed.expiresAt) {
            return { token: parsed.token, source: 'localStorage', data: parsed };
          }
        }
      } catch (e) {}

      return null;
    },

    /**
     * Check if an order has already been dispatched from this browser
     */
    isOrderProcessed: function (orderId) {
      try {
        var processed = JSON.parse(localStorage.getItem(DEDUP_KEY) || '[]');
        return processed.indexOf(String(orderId)) !== -1;
      } catch (e) {
        return false;
      }
    },

    /**
     * Mark an order as processed in local deduplication registry
     */
    markOrderProcessed: function (orderId) {
      try {
        var processed = JSON.parse(localStorage.getItem(DEDUP_KEY) || '[]');
        if (processed.indexOf(String(orderId)) === -1) {
          processed.push(String(orderId));
          // Keep maximum last 50 orders in cache
          if (processed.length > 50) processed.shift();
          localStorage.setItem(DEDUP_KEY, JSON.stringify(processed));
        }
      } catch (e) {}
    },

    /**
     * Track an order conversion (COD or Pre-paid)
     * @param {Object} order - { orderId, totalAmount, currency, promoCode, customerCity, customerPhone, items }
     */
    trackOrder: function (order) {
      var self = this;
      if (!order || !order.orderId) {
        console.warn('[Kickit] trackOrder missing required orderId');
        return Promise.reject(new Error('Missing orderId'));
      }

      // Deduplication check
      if (this.isOrderProcessed(order.orderId)) {
        if (this.config.debug) console.warn('[Kickit] Order already tracked:', order.orderId);
        return Promise.resolve({ duplicate: true, orderId: order.orderId });
      }

      var attribution = this.getAttribution();
      var promoCode = order.promoCode || this.getQueryParam('coupon') || null;

      // Only track if either affiliate attribution token or promo code exists
      if (!attribution && !promoCode) {
        if (this.config.debug) console.log('[Kickit] No affiliate token or promo code detected for order:', order.orderId);
        return Promise.resolve({ attributed: false });
      }

      var payload = {
        merchantId: this.config.merchantId,
        orderId: String(order.orderId),
        totalAmountMAD: parseFloat(order.totalAmount || order.amount || 0),
        currency: order.currency || 'MAD',
        attributionToken: attribution ? attribution.token : null,
        promoCode: promoCode,
        customerCity: order.customerCity || order.city || 'Morocco',
        customerPhone: order.customerPhone || null,
        courier: order.courier || 'Pending Dispatch',
        items: order.items || [],
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      };

      // Mark order as processed locally
      this.markOrderProcessed(order.orderId);

      // Secure Transmission using Fetch with KeepAlive or sendBeacon fallback
      var endpoint = this.config.apiUrl;

      if (navigator.sendBeacon && typeof Blob !== 'undefined') {
        try {
          var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          var beaconSuccess = navigator.sendBeacon(endpoint, blob);
          if (beaconSuccess) {
            if (self.config.debug) console.log('[Kickit] Order tracked via Beacon:', payload);
            return Promise.resolve({ success: true, method: 'beacon', payload: payload });
          }
        } catch (e) {
          // Fallback to fetch
        }
      }

      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Kickit-Client-SDK': 'JS-Tracker-1.2.0'
        },
        body: JSON.stringify(payload),
        keepalive: true
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (self.config.debug) console.log('[Kickit] Conversion recorded successfully:', data);
        return data;
      })
      .catch(function (err) {
        if (self.config.debug) console.error('[Kickit] Failed to record conversion:', err);
        throw err;
      });
    },

    /**
     * Initialization & URL scanning
     */
    init: function (options) {
      if (options) {
        if (options.merchantId) this.config.merchantId = options.merchantId;
        if (options.cookieDays) this.config.cookieDays = options.cookieDays;
        if (options.apiUrl) this.config.apiUrl = options.apiUrl;
        if (options.debug) this.config.debug = options.debug;
      }

      // Check standard affiliate query parameters
      var refParam = this.getQueryParam('ref') || 
                     this.getQueryParam('aff') || 
                     this.getQueryParam('kck') || 
                     this.getQueryParam('kck_id') || 
                     this.getQueryParam('affiliate');

      if (refParam) {
        this.saveAttribution(refParam, {
          utmSource: this.getQueryParam('utm_source'),
          utmMedium: this.getQueryParam('utm_medium'),
          utmCampaign: this.getQueryParam('utm_campaign')
        });
      }

      // Check promo coupon in URL (e.g., ?coupon=AMINE10)
      var couponParam = this.getQueryParam('coupon') || this.getQueryParam('discount');
      if (couponParam) {
        try {
          sessionStorage.setItem('kck_promo_code', couponParam);
        } catch (e) {}
      }

      if (this.config.debug) {
        console.log('[Kickit] Tracker v' + this.version + ' initialized. Active token:', this.getAttribution());
      }
    }
  };

  // Expose globally
  window.Kickit = Kickit;

  // Auto-initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { Kickit.init(); });
  } else {
    Kickit.init();
  }
})(window, document);
