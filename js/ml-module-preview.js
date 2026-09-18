/* Enhance module summaries into accessible, in-page previews. */
(() => {
  const section = document.querySelector('#course-ai-automation .ml-preparation-system');
  if (!section || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'ml-module-dialog';
  dialog.setAttribute('aria-labelledby', 'mlModulePreviewTitle');
  dialog.innerHTML = '<header class="ml-module-dialog-heading"><div><p class="ml-module-dialog-meta"></p><h2 id="mlModulePreviewTitle"></h2></div><button type="button" class="ml-module-dialog-close" aria-label="Close module details" autofocus>&times;</button></header><div class="ml-module-dialog-content" tabindex="0" role="document" aria-label="Module resources"></div><footer class="ml-module-dialog-action"><button type="button">Get the Complete Kit <span aria-hidden="true">&rarr;</span></button></footer>';
  section.append(dialog);
  const content = dialog.querySelector('.ml-module-dialog-content');
  let active;
  let previousOverflow;
  section.querySelectorAll('.ml-module-summary').forEach(summary => {
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.addEventListener('click', event => {
      event.preventDefault();
      if (dialog.open) return;
      const card = summary.closest('.ml-module-card');
      card.open = false;
      active = { card, summary };
      dialog.querySelector('h2').textContent = summary.querySelector('.ml-module-title').textContent;
      dialog.querySelector('.ml-module-dialog-meta').textContent = summary.querySelector('.ml-module-kicker').textContent;
      content.append(card.querySelector('.ml-module-parts'), card.querySelector('.ml-module-total'));
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      content.scrollTop = 0;
    });
  });
  dialog.querySelector('.ml-module-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!active) return;
    active.card.append(...content.children);
    document.body.style.overflow = previousOverflow;
    active.summary.focus({ preventScroll: true });
    active = null;
  });
  dialog.querySelector('.ml-module-dialog-action button').addEventListener('click', () => {
    dialog.close();
    window.openMlCheckout();
  });
})();
