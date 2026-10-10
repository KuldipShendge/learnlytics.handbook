/* Weekend checkout: open the hosted Razorpay payment page for the selected kit/market. */
(() => {
  'use strict';
  const paymentPages = {
    'data-analyst': { india: 'https://rzp.io/rzp/S2y4eZ3', international: 'https://rzp.io/rzp/ro1v8df' },
    'ai-automation': { india: 'https://rzp.io/rzp/6j2zp8fF', international: 'https://rzp.io/rzp/KKrZwPm' },
    'data-science': { india: 'https://rzp.io/rzp/fain7HM', international: 'https://rzp.io/rzp/jJvaGhJy' },
    'ds-genai-ml': { india: 'https://rzp.io/rzp/qLYK5iB', international: 'https://rzp.io/rzp/ZoRK2ea' }
  };
  const markets = Object.fromEntries(Object.keys(paymentPages).map(id => [id, 'india']));
  let opening = false;
  window.configureKitPayments = (country, asia, africa, europe) => {
    markets['data-analyst'] = asia.has(country) || africa.has(country) ? 'india' : 'international';
    markets['ai-automation'] = country === 'US' || europe.has(country) ? 'international' : 'india';
    markets['data-science'] = markets['ds-genai-ml'] = country === 'IN' ? 'india' : 'international';
  };
  window.openKitPayment = async courseId => {
    if (!Object.hasOwn(paymentPages, courseId) || opening) return;
    opening = true;
    const root = document.getElementById('course-' + courseId);
    const wrap = root?.querySelector('.dakit-hero-cta-wrap');
    let status = root?.querySelector('.kit-payment-status');
    if (!status && wrap) {
      status = document.createElement('p');
      status.className = 'kit-payment-status'; status.setAttribute('role', 'status');
      status.tabIndex = -1; wrap.append(status);
    }
    if (status) status.textContent = 'Opening secure payment page in a new tab…';
    let paymentTab;
    try {
      // Open during the click, before region detection can consume user activation.
      paymentTab = window.open('about:blank', '_blank');
      if (paymentTab) paymentTab.opener = null;
      await window.checkoutRegionReady;
      const paymentUrl = paymentPages[courseId][markets[courseId]];
      if (paymentTab && !paymentTab.closed) {
        paymentTab.location.replace(paymentUrl);
        if (status) status.textContent = '';
      } else if (status) {
        status.textContent = paymentTab ? 'The payment tab was closed. ' : 'Your browser blocked the new tab. ';
        const link = document.createElement('a');
        link.href = paymentUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open secure payment page';
        status.append(link);
        status.focus(); status.scrollIntoView({block: 'center', behavior: 'smooth'});
      }
    } catch (error) {
      if (paymentTab && !paymentTab.closed) paymentTab.close();
      if (status) {
        status.textContent = 'The payment page could not open. Please try again.';
        status.focus(); status.scrollIntoView({block: 'center', behavior: 'smooth'});
      }
    } finally { opening = false; }
  };
})();
