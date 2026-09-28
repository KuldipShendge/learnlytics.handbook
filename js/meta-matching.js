/* Matching uses only volunteered, opted-in first-party form data. Never scrape checkout frames. */
(() => {
  'use strict';
  const pixelId = '1441817607724869';
  let lastMatch = '';
  window.submitMetaMatching = ({email = '', phone = '', consent = false} = {}) => {
    if (!consent || typeof window.fbq !== 'function') return false;
    const data = {};
    const em = email.trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) && em !== 'email@email.com') data.em = em;
    // Country code must be provided; do not guess one for international visitors.
    const ph = phone.replace(/\D/g, '').replace(/^00/, '');
    if (/^(\+|00)/.test(phone.trim()) && ph.length >= 10 && ph.length <= 15 && ph !== '1234567890') data.ph = ph;
    if (!Object.keys(data).length) return false;
    const signature = JSON.stringify(data);
    if (signature === lastMatch) return false;
    try {
      window.fbq('init', pixelId, data);
      window.fbq('trackSingle', pixelId, 'Lead');
      lastMatch = signature;
      return true;
    } catch (_) { return false; }
  };
})();
