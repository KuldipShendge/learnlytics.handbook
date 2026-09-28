/* One hidden native Razorpay button per selected kit/market. No payment links. */
(() => {
  'use strict';
  const buttons = {
    'data-analyst': { india: 'pl_ThVHCCQ2yen4NY', international: 'pl_ThXweHqkLlL64U' },
    'ai-automation': { india: 'pl_ThY1yderWIYPj0', international: 'pl_ThY3jfk29pD143' },
    'data-science': { india: 'pl_ThY5ZHwc4wAyAL', international: 'pl_ThYC9dN6TDPgpj' },
    'ds-genai-ml': { india: 'pl_ThYEBdhXwq6ycx', international: 'pl_ThYGVEIFLYXbbq' }
  };
  const markets = Object.fromEntries(Object.keys(buttons).map(id => [id, 'india']));
  const loads = new Map();
  let opening = false;
  window.configureKitPayments = (country, asia, africa, europe) => {
    markets['data-analyst'] = asia.has(country) || africa.has(country) ? 'india' : 'international';
    markets['ai-automation'] = country === 'US' || europe.has(country) ? 'international' : 'india';
    markets['data-science'] = markets['ds-genai-ml'] = country === 'IN' ? 'india' : 'international';
  };
  function loadButton(buttonId) {
    if (loads.has(buttonId)) return loads.get(buttonId);
    const promise = new Promise((resolve, reject) => {
      const form = document.createElement('form');
      form.className = 'kit-payment-host';
      form.hidden = true;
      form.setAttribute('aria-hidden', 'true');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.dataset.payment_button_id = buttonId;
      script.async = true;
      let timer;
      const observer = new MutationObserver(() => {
        const button = form.querySelector('.razorpay-payment-button .PaymentButton');
        if (button) { clearTimeout(timer); observer.disconnect(); resolve(button); }
      });
      const fail = () => {
        clearTimeout(timer); observer.disconnect(); form.remove(); loads.delete(buttonId);
        reject(new Error('Razorpay could not load. Please try again.'));
      };
      observer.observe(form, {childList: true, subtree: true});
      timer = setTimeout(fail, 15000);
      script.onerror = fail;
      document.body.append(form);
      form.append(script);
    });
    loads.set(buttonId, promise);
    return promise;
  }
  window.openKitPayment = async courseId => {
    if (!buttons[courseId] || opening) return;
    opening = true;
    const root = document.getElementById('course-' + courseId);
    const wrap = root?.querySelector('.dakit-hero-cta-wrap');
    let status = root?.querySelector('.kit-payment-status');
    if (!status && wrap) {
      status = document.createElement('p');
      status.className = 'kit-payment-status'; status.setAttribute('role', 'status');
      status.tabIndex = -1; wrap.append(status);
    }
    if (status) status.textContent = 'Opening secure checkout…';
    try {
      await window.checkoutRegionReady;
      const button = await loadButton(buttons[courseId][markets[courseId]]);
      if (status) status.textContent = '';
      button.click();
    } catch (error) {
      if (status) {
        status.textContent = 'Checkout could not load. Please check your connection and try again.';
        status.focus(); status.scrollIntoView({block: 'center', behavior: 'smooth'});
      }
    } finally { opening = false; }
  };
})();
