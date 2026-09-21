/* Read public Drive samples inside the course page, without proxying PDF bytes. */
(() => {
  'use strict';

  const samples = {
  "ds-python-handbook": {
    "file": "ds-python-handbook-v2.pdf",
    "subject": "Python For Data Science",
    "kind": "Comprehensive Handbook",
    "part": "Module 2 · Part 2 — Advanced Python for Data Science",
    "firstPage": 5,
    "driveUrl": "https://drive.google.com/file/d/1lBFFR4lB1eZo8k1A0w2v9ahq3nmxuGgN/view"
  },
  "ds-python-solutions": {
    "file": "ds-python-solutions-v2.pdf",
    "subject": "Python For Data Science",
    "kind": "Solution Manual",
    "part": "Module 2 · Part 2 — Advanced Python for Data Science",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1d7a2ump-RuAFO8Q1FTR1M9ZQijgoC_rg/view"
  },
  "ds-genai-handbook": {
    "file": "ds-genai-handbook-v2.pdf",
    "subject": "Generative AI & LLM Integration",
    "kind": "Comprehensive Handbook",
    "part": "Module 8 · Part 1 — Building with LLMs",
    "firstPage": 5,
    "driveUrl": "https://drive.google.com/file/d/1vjbNAxnqpeivtYvEXqr4dEbFuqICtyVL/view"
  },
  "ds-genai-solutions": {
    "file": "ds-genai-solutions-v2.pdf",
    "subject": "Generative AI & LLM Integration",
    "kind": "Solution Manual",
    "part": "Module 8 · Part 1 — Building with LLMs",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1D3zxmC1gGEx4Edo5kBLLHeaQwUEPXqTI/view"
  },
  "ds-evaluation-handbook": {
    "file": "ds-evaluation-handbook-v2.pdf",
    "subject": "Model Evaluation, Selection & Tuning",
    "kind": "Comprehensive Handbook",
    "part": "Module 5 · Part 1 — Evaluation Metrics",
    "firstPage": 5,
    "driveUrl": "https://drive.google.com/file/d/1d_ueAUcbAlL-uo3RNGharPyF8-P5faAz/view"
  },
  "ds-evaluation-solutions": {
    "file": "ds-evaluation-solutions-v2.pdf",
    "subject": "Model Evaluation, Selection & Tuning",
    "kind": "Solution Manual",
    "part": "Module 5 · Part 1 — Evaluation Metrics",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1aeVURbSL9KU47ibCwVKN29CsA1YKOwH1/view"
  },
  "combo-regression-handbook": {
    "file": "combo-regression-handbook-v2.pdf",
    "subject": "Classical Machine Learning",
    "kind": "Comprehensive Handbook",
    "part": "Module 4 · Part 1 — Supervised Learning — Regression",
    "firstPage": 5,
    "driveUrl": "https://drive.google.com/file/d/1pvuh4iJtK61Lpnoy6iccZe_U2owBkvyU/view"
  },
  "combo-regression-solutions": {
    "file": "combo-regression-solutions-v2.pdf",
    "subject": "Classical Machine Learning",
    "kind": "Solution Manual",
    "part": "Module 4 · Part 1 — Supervised Learning — Regression",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1qJ2zW8_SRUvRy6g3lRt0WXMGibjXThVL/view"
  },
  "combo-mlops-handbook": {
    "file": "combo-mlops-handbook-v2.pdf",
    "subject": "MLOps & Model Deployment",
    "kind": "Comprehensive Handbook",
    "part": "Module 7 · Part 2 — Production Operations",
    "firstPage": 5,
    "driveUrl": "https://drive.google.com/file/d/1YFlcVgpNM-PelR2EGjCWBr1FrpvUI7wv/view"
  },
  "combo-mlops-solutions": {
    "file": "combo-mlops-solutions-v2.pdf",
    "subject": "MLOps & Model Deployment",
    "kind": "Solution Manual",
    "part": "Module 7 · Part 2 — Production Operations",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1_iP0rXc-_uQXORBy1FU96YpsbvwdB5zq/view"
  },
  "combo-genai-handbook": {
    "file": "combo-genai-handbook-v2.pdf",
    "subject": "Generative AI & LLM Integration",
    "kind": "Comprehensive Handbook",
    "part": "Module 8 · Part 2 — AI-Augmented DS + ML Workflow",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1H5DZpmKsb674pi0jW7aUKqIfEKpaTNxh/view"
  },
  "combo-genai-solutions": {
    "file": "combo-genai-solutions-v2.pdf",
    "subject": "Generative AI & LLM Integration",
    "kind": "Solution Manual",
    "part": "Module 8 · Part 2 — AI-Augmented DS + ML Workflow",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1adzvq052uK5m8sTGDvmlR4-isr555lqm/view"
  },
  "math-handbook": {
    "file": "math-handbook-v2.pdf",
    "subject": "Mathematics & Statistics For ML",
    "kind": "Comprehensive Handbook",
    "part": "Module 1 · Part 2",
    "firstPage": 6,
    "driveUrl": "https://drive.google.com/file/d/1t2HALsWlwOB0z8dXQI31zR6Izaqsy5Mk/view"
  },
  "math-solutions": {
    "file": "math-solutions-v2.pdf",
    "subject": "Mathematics & Statistics For ML",
    "kind": "Solution Manual",
    "part": "Module 1 · Part 2",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1pCBurAW5Z2LB17YO0RryahjdD58xayLG/view"
  },
  "eda-handbook": {
    "file": "eda-handbook-v2.pdf",
    "subject": "EDA & Feature Engineering",
    "kind": "Comprehensive Handbook",
    "part": "Module 3 · Part 1",
    "firstPage": 6,
    "driveUrl": "https://drive.google.com/file/d/1akhotgg4eNlRAszDDpOCyHtl2cVVgXSg/view"
  },
  "eda-solutions": {
    "file": "eda-solutions-v2.pdf",
    "subject": "EDA & Feature Engineering",
    "kind": "Solution Manual",
    "part": "Module 3 · Part 1",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1QLY_C_G8XNgq9a36AjC6pIp165AlWuUN/view"
  },
  "mlops-handbook": {
    "file": "mlops-handbook-v2.pdf",
    "subject": "MLOps & Model Deployment",
    "kind": "Comprehensive Handbook",
    "part": "Module 7 · Part 1",
    "firstPage": 6,
    "driveUrl": "https://drive.google.com/file/d/1oMuVpJH-zjMnANDxk04ePrHVPyLVEox5/view"
  },
  "mlops-solutions": {
    "file": "mlops-solutions-v2.pdf",
    "subject": "MLOps & Model Deployment",
    "kind": "Solution Manual",
    "part": "Module 7 · Part 1",
    "firstPage": 4,
    "driveUrl": "https://drive.google.com/file/d/1mkpV5eCMem3UdcfyMeTrXIuORLdbBHp4/view"
  }
};
  const dialog = document.getElementById('mlPdfPreview');
  if (!dialog) return;
  const viewer = dialog.querySelector('.ml-pdf-drive-viewer');
  const status = dialog.querySelector('.ml-pdf-status');
  const driveLink = document.getElementById('mlPdfDriveLink');
  let active = null;

  function dispose(session) {
    if (!session) return;
    clearTimeout(session.timer);
    session.frame?.remove();
  }

  function loadSample(session) {
    dispose(session);
    status.hidden = false;
    status.textContent = 'Loading your Chapter 1 sample…';
    viewer.setAttribute('aria-busy', 'true');
    const frame = document.createElement('iframe');
    session.frame = frame;
    frame.className = 'ml-pdf-drive-frame';
    frame.title = `${session.sample.subject} — ${session.sample.kind} — Chapter 1 PDF sample`;
    frame.allowFullscreen = true;
    const current = () => active === session && session.frame === frame && dialog.open;
    frame.addEventListener('load', () => {
      if (!current()) return;
      clearTimeout(session.timer);
      // Cross-origin navigation cannot confirm whether Google's PDF rendered.
      status.hidden = true;
      viewer.removeAttribute('aria-busy');
    });
    const showHelp = () => {
      if (!current()) return;
      clearTimeout(session.timer);
      viewer.removeAttribute('aria-busy');
      status.hidden = false;
      status.textContent = 'Preview taking too long? Try Reload preview. If needed, use Open separately below.';
    };
    frame.addEventListener('error', showHelp);
    session.timer = setTimeout(showHelp, 15000);
    frame.src = session.sample.driveUrl.replace(/\/view$/, '/preview');
    viewer.replaceChildren(frame);
  }

  function openSample(key, trigger) {
    if (!Object.hasOwn(samples, key)) return;
    const sample = samples[key];
    const oldOverflow = active ? active.oldOverflow : document.body.style.overflow;
    dispose(active);
    active = { key, sample, trigger, oldOverflow, frame: null, timer: null };
    const subject = trigger.closest('.ml-pdf-subject')?.querySelector('h3')?.textContent.trim() || sample.subject;
    document.getElementById('mlPdfPreviewTitle').textContent = `${subject} — ${sample.kind}`;
    document.getElementById('mlPdfPreviewMeta').textContent = `${sample.part} · Chapter 1 sample`;
    document.getElementById('mlPdfPreviewDescription').textContent = `Chapter 1 starts on PDF page ${sample.firstPage}. Scroll and zoom in the reader below.`;
    driveLink.href = sample.driveUrl;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.ml-pdf-close').focus({ preventScroll: true });
    loadSample(active);
  }

  document.querySelectorAll('[data-ml-pdf]').forEach(trigger => {
    // Also handle older cached anchor markup in-page during a rollout.
    trigger.addEventListener('click', event => {
      event.preventDefault();
      openSample(trigger.dataset.mlPdf, trigger);
    });
  });
  dialog.querySelector('.ml-pdf-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.ml-pdf-back').addEventListener('click', () => dialog.close());
  let backdropPointer = false;
  dialog.addEventListener('pointerdown', event => { backdropPointer = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog || !backdropPointer) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    const session = active;
    active = null;
    dispose(session);
    viewer.removeAttribute('aria-busy');
    driveLink.removeAttribute('href');
    document.body.style.overflow = session?.oldOverflow || '';
    session?.trigger?.focus({ preventScroll: true });
  });
  dialog.querySelector('.ml-pdf-retry').addEventListener('click', () => {
    if (active) loadSample(active);
  });
  document.getElementById('mlPdfBuy').addEventListener('click', () => {
    dialog.close();
    if (document.querySelector('#course-ds-genai-ml.active')) window.openCombinedKitCheckout();
    else if (document.querySelector('#course-data-science.active')) window.openDsCheckout();
    else window.openMlCheckout();
  });
})();
