(() => {
  'use strict';
  const page = document.getElementById('course-aptitude-kit');
  if (!page) return;
  // Dedicated Aptitude registration deployment; saves to the owner's Google Sheet.
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH8Sq36fWddJVM240-FwC2RKEYh3OhQB1sKWgbozOM54f4oWXktqOOywG8ZUYMFxMZ/exec';
  const register = page.querySelector('#ak-register-dialog');
  const preview = page.querySelector('#ak-pdf-dialog');
  let previousOverflow;
  function openDialog(dialog) {
    if (dialog.open) return;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  window.openAptitudeRegistration = () => openDialog(register);
  page.querySelectorAll('[data-ak-register]').forEach(button => button.addEventListener('click', window.openAptitudeRegistration));
  [register, preview].forEach(dialog => {
    dialog.querySelectorAll('[data-ak-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      if (dialog === preview) page.querySelector('#ak-pdf-frame').removeAttribute('src');
    });
  });
  page.querySelectorAll('[data-ak-pdf]').forEach(button => button.addEventListener('click', () => {
    page.querySelector('#ak-pdf-title').textContent = button.dataset.akPdfTitle;
    page.querySelector('#ak-pdf-frame').src = button.dataset.akPdf + '#view=FitH';
    page.querySelector('#ak-pdf-link').href = button.dataset.akPdf;
    openDialog(preview);
  }));
  const form = page.querySelector('#ak-form');
  const status = page.querySelector('#ak-status');
  const phone = form.elements.whatsapp;
  const validatePhone = () => {
    const value = phone.value.trim();
    const digits = value.replace(/\D/g, '');
    phone.setCustomValidity(/^[+\d\s().-]+$/.test(value) && digits.length >= 10 && digits.length <= 15 ? '' : 'Enter a valid WhatsApp number with 10–15 digits, including your country code.');
  };
  phone.addEventListener('input', validatePhone);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.hidden) return;
    validatePhone();
    if (!form.reportValidity()) return;
    const button = form.querySelector('[type=submit]');
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = 'Saving your details…';
    status.textContent = '';
    status.dataset.success = 'false';
    const fields = new FormData(form);
    const data = {name:String(fields.get('name')).trim(), whatsapp:phone.value.trim(), email:String(fields.get('email')).trim(), consent:fields.get('consent') === 'on', website:fields.get('website')};
    try {
      const response = await fetch(APPS_SCRIPT_URL || '/api/aptitude-early-access', {
        method:'POST',
        ...(APPS_SCRIPT_URL ? {body:new URLSearchParams(data)} : {headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),
        signal:AbortSignal.timeout(20000)
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('save_failed');
      form.reset();
      phone.setCustomValidity('');
      form.hidden = true;
      page.querySelector('#ak-register-title').textContent = 'Thank you for registering!';
      page.querySelector('#ak-register-description').textContent = 'Your registration has been saved. We’ll inform you about the Aptitude Kit launch and early-bird discount by email and WhatsApp before 31 October 2026.';
      page.querySelector('#ak-register-success').hidden = false;
      register.scrollTop = 0;
      if (register.open) page.querySelector('#ak-register-title').focus({preventScroll:true});
    } catch {
      status.textContent = 'We couldn’t confirm your registration. Please try again shortly. Your details are still here.';
    } finally {
      button.disabled = false;
      button.textContent = 'REGISTER EARLY TO GET DISCOUNT';
    }
  });
  const sticky = page.querySelector('#ak-sticky-cta');
  let heroVisible = true;
  const updateSticky = () => sticky.classList.toggle('visible', page.classList.contains('active') && !heroVisible);
  new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; updateSticky(); }, {threshold:0.1}).observe(page.querySelector('.dakit-hero'));
  const title = document.title;
  const description = document.querySelector('meta[name=description]');
  const canonical = document.querySelector('link[rel=canonical]');
  const originalDescription = description?.content;
  const originalCanonical = canonical?.href;
  const updateMetadata = () => {
    const active = page.classList.contains('active');
    document.title = active ? 'Aptitude Kit — Placement & Technical Assessment 2026 | Learnlytics' : title;
    if (description) description.content = active ? '6 modules, 43 subjects and 129 resources. Prepare for placements and technical assessments with 1200+ practice questions. Register early for a launch discount.' : originalDescription;
    if (canonical) canonical.href = active ? 'https://learnlyticshandbook.shop/aptitude-kit' : originalCanonical;
    if (!active) [register,preview].forEach(dialog => { if (dialog.open) dialog.close(); });
    updateSticky();
  };
  new MutationObserver(updateMetadata).observe(page, {attributes:true,attributeFilter:['class']});
  updateMetadata();
})();
