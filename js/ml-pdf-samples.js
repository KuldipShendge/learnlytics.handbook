/* In-page reader: unchanged Drive PDFs are served as static assets to avoid function response limits. */
(() => {
  'use strict';

  const assets = new URL('vendor/pdfjs/', document.currentScript.src);
  const sampleAssets = new URL('../pdfs/chapter-samples/', document.currentScript.src);
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
  const scroller = dialog.querySelector('.ml-pdf-scroll');
  const pages = dialog.querySelector('.ml-pdf-pages');
  const status = dialog.querySelector('.ml-pdf-status');
  const retry = dialog.querySelector('.ml-pdf-retry');
  const description = document.getElementById('mlPdfPreviewDescription');
  const zoomOut = document.getElementById('mlPdfZoomOut');
  const zoomIn = document.getElementById('mlPdfZoomIn');
  const zoomValue = document.getElementById('mlPdfZoomValue');
  let library;
  let active = null;

  function loadLibrary() {
    if (!library) {
      library = import(new URL('pdf.min.mjs', assets).href).then(pdfjs => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', assets).href;
        return pdfjs;
      }).catch(error => {
        library = null;
        throw error;
      });
    }
    return library;
  }

  function dispose(session) {
    if (!session) return;
    session.cancelled = true;
    session.observer?.disconnect();
    session.resize?.disconnect();
    clearTimeout(session.resizeTimer);
    session.tasks.forEach(task => task.cancel());
    session.loading?.destroy().catch(() => {});
    session.records.forEach(record => {
      const canvas = record.sheet.querySelector('canvas');
      if (canvas) canvas.width = canvas.height = 0;
    });
  }

  function current(session) {
    return active === session && !session.cancelled && dialog.open;
  }

  function release(record) {
    record.generation++;
    record.task?.cancel();
    const canvas = record.sheet.querySelector('canvas');
    if (canvas) canvas.width = canvas.height = 0;
    record.sheet.replaceChildren();
    record.state = 'idle';
  }

  function enqueue(session, record) {
    if (!current(session) || !record.near || record.state !== 'idle') return;
    record.state = 'queued';
    session.queue.push(record);
    pump(session);
  }

  async function pump(session) {
    if (session.busy) return;
    session.busy = true;
    while (current(session) && session.queue.length) {
      const record = session.queue.shift();
      if (!record.near || record.state !== 'queued') continue;
      record.state = 'rendering';
      const generation = record.generation;
      const usable = () => current(session) && record.near && record.generation === generation;
      let pdfPage;
      let renderTask;
      try {
        pdfPage = await session.document.getPage(record.number);
        if (!usable()) continue;
        const natural = pdfPage.getViewport({ scale: 1 });
        const width = record.sheet.clientWidth;
        const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
        const viewport = pdfPage.getViewport({ scale: width / natural.width });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width * ratio);
        canvas.height = Math.ceil(viewport.height * ratio);
        canvas.setAttribute('aria-hidden', 'true');
        renderTask = pdfPage.render({
          canvasContext: canvas.getContext('2d'),
          viewport,
          transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0]
        });
        record.task = renderTask;
        session.tasks.add(renderTask);
        await renderTask.promise;
        if (!usable()) continue;
        const text = await pdfPage.getTextContent();
        if (!usable()) continue;
        const accessibleText = document.createElement('p');
        accessibleText.className = 'ml-pdf-accessible-text';
        accessibleText.textContent = text.items.map(item => item.str || '').join(' ');
        record.sheet.replaceChildren(canvas, accessibleText);
        record.state = 'ready';
      } catch (error) {
        if (usable() && error.name !== 'RenderingCancelledException') {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'ml-pdf-page-retry';
          button.textContent = 'This page could not load. Try again.';
          button.addEventListener('click', () => {
            release(record);
            enqueue(session, record);
          });
          record.sheet.replaceChildren(button);
          record.state = 'error';
        }
      } finally {
        if (renderTask) session.tasks.delete(renderTask);
        record.task = null;
        pdfPage?.cleanup();
        if (record.state === 'rendering') record.state = 'idle';
      }
    }
    session.busy = false;
  }

  function updatePageLabel() {
    if (!active?.document || !active.records.length) return;
    const top = scroller.getBoundingClientRect().top;
    const record = active.records.find(item => item.slot.getBoundingClientRect().bottom > top + 30);
    if (record) description.textContent = `Page ${record.number} of ${active.document.numPages} · Scroll to read the sample`;
  }

  async function loadSample(session) {
    status.hidden = false;
    status.textContent = 'Loading your Chapter 1 sample…';
    retry.hidden = true;
    pages.replaceChildren();
    scroller.scrollTop = 0;
    scroller.setAttribute('aria-busy', 'true');
    if (window.location.protocol === 'file:') {
      scroller.removeAttribute('aria-busy');
      status.textContent = 'PDF previews cannot load when this page is opened directly from a local file. Please open it through a local preview server or the hosted website.';
      return;
    }
    try {
      const pdfjs = await loadLibrary();
      if (!current(session)) return;
      session.loading = pdfjs.getDocument({
        url: new URL(session.sample.file, sampleAssets).href,
        disableRange: true,
        cMapUrl: new URL('cmaps/', assets).href,
        cMapPacked: true,
        standardFontDataUrl: new URL('standard_fonts/', assets).href,
        wasmUrl: new URL('wasm/', assets).href,
        isEvalSupported: false
      });
      session.document = await session.loading.promise;
      const first = await session.document.getPage(1);
      if (!current(session)) return;
      const natural = first.getViewport({ scale: 1 });
      const fragment = document.createDocumentFragment();
      for (let number = 1; number <= session.document.numPages; number++) {
        const slot = document.createElement('section');
        slot.className = 'ml-pdf-page';
        slot.setAttribute('aria-label', `PDF page ${number}`);
        const label = document.createElement('p');
        label.className = 'ml-pdf-page-label';
        label.textContent = `Page ${number} of ${session.document.numPages}`;
        const sheet = document.createElement('div');
        sheet.className = 'ml-pdf-sheet';
        sheet.style.aspectRatio = `${natural.width} / ${natural.height}`;
        slot.append(label, sheet);
        fragment.append(slot);
        session.records.push({ number, slot, sheet, near: false, state: 'idle', task: null, generation: 0 });
      }
      status.hidden = true;
      pages.append(fragment);
      scroller.removeAttribute('aria-busy');
      // Open on the chapter content shown in the preview. Front matter remains above.
      const initial = session.records[Math.min(session.sample.firstPage, session.document.numPages) - 1];
      scroller.scrollTop = initial.slot.offsetTop - session.records[0].slot.offsetTop;
      const byElement = new Map(session.records.map(record => [record.slot, record]));
      session.observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const record = byElement.get(entry.target);
          record.near = entry.isIntersecting;
          if (record.near) enqueue(session, record);
          else release(record);
        }
      }, { root: scroller, rootMargin: '450px 0px' });
      session.records.forEach(record => session.observer.observe(record.slot));
      let previousWidth = pages.clientWidth;
      session.resize = new ResizeObserver(() => {
        if (pages.clientWidth === previousWidth) return;
        previousWidth = pages.clientWidth;
        clearTimeout(session.resizeTimer);
        session.resizeTimer = setTimeout(() => {
          if (!current(session)) return;
          session.records.filter(record => record.near).forEach(record => {
            release(record);
            enqueue(session, record);
          });
        }, 150);
      });
      session.resize.observe(pages);
      updatePageLabel();
    } catch (error) {
      if (!current(session)) return;
      scroller.removeAttribute('aria-busy');
      status.textContent = 'This sample could not load right now. Please try again, or return to your course.';
      console.error('PDF sample loading failed:', error);
      status.hidden = false;
      retry.hidden = false;
    }
  }

  function openSample(key, trigger) {
    const sample = samples[key];
    if (!sample) return;
    const oldOverflow = active ? active.oldOverflow : document.body.style.overflow;
    dispose(active);
    active = { key, sample, trigger, oldOverflow, cancelled: false, records: [], tasks: new Set(), queue: [], busy: false, zoom: 1 };
    pages.style.width = '';
    pages.style.maxWidth = '';
    zoomValue.value = '100%';
    zoomOut.disabled = true;
    zoomIn.disabled = false;
    const subject = trigger.closest('.ml-pdf-subject')?.querySelector('h3')?.textContent.trim() || sample.subject;
    document.getElementById('mlPdfPreviewTitle').textContent = `${subject} — ${sample.kind}`;
    document.getElementById('mlPdfPreviewMeta').textContent = `${sample.part} · Chapter 1 sample`;
    description.textContent = 'Scroll through the sample below.';
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.ml-pdf-close').focus({ preventScroll: true });
    loadSample(active);
  }

  document.querySelectorAll('[data-ml-pdf]').forEach(button => {
    button.addEventListener('click', () => openSample(button.dataset.mlPdf, button));
  });
  dialog.querySelector('.ml-pdf-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.ml-pdf-back').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), [tabindex="0"]')]
      .filter(element => element.getClientRects().length && !element.hidden);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  // Close only an actual backdrop click, not a drag that started inside the reader.
  let backdropPointer = false;
  dialog.addEventListener('pointerdown', event => { backdropPointer = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && backdropPointer) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    const session = active;
    active = null;
    dispose(session);
    pages.replaceChildren();
    document.body.style.overflow = session?.oldOverflow || '';
    session?.trigger?.focus({ preventScroll: true });
  });
  retry.addEventListener('click', () => {
    if (active) {
      const key = Object.keys(samples).find(item => samples[item] === active.sample);
      openSample(key, active.trigger);
    }
  });
  scroller.addEventListener('scroll', updatePageLabel, { passive: true });
  function changeZoom(delta) {
    if (!active?.document) return;
    const previous = active.zoom;
    active.zoom = Math.min(2, Math.max(1, previous + delta));
    pages.style.maxWidth = `${720 * active.zoom}px`;
    pages.style.width = `${active.zoom * 100}%`;
    scroller.scrollTop *= active.zoom / previous;
    zoomValue.value = `${Math.round(active.zoom * 100)}%`;
    zoomOut.disabled = active.zoom === 1;
    zoomIn.disabled = active.zoom === 2;
  }
  zoomOut.addEventListener('click', () => changeZoom(-.25));
  zoomIn.addEventListener('click', () => changeZoom(.25));
  document.getElementById('mlPdfBuy').addEventListener('click', () => {
    dialog.close();
    if (document.querySelector('#course-ds-genai-ml.active')) window.openCombinedKitCheckout();
    else if (document.querySelector('#course-data-science.active')) window.openDsCheckout();
    else window.openMlCheckout();
  });
})();
