// -- SLIDER ------------------------------

const totalCourses = 3; 

let current = 0, locked = false;

const track = document.getElementById('track');

const detailView = document.getElementById('detail-view');

const homeFooter = document.getElementById('homeFooter');

function buildDots() {

  const dotsEl = document.getElementById('dots');

  if (!dotsEl) return;

  dotsEl.innerHTML = '';

  for(let i=0; i<totalCourses; i++) {

    const d = document.createElement('div');

    d.className = 'dot' + (i === 0 ? ' active' : '');

    d.onclick = () => goTo(i);

    dotsEl.appendChild(d);

  }

}

function goTo(n) {

  if (!track || !detailView) return;

  if (locked) return;

  if (detailView.classList.contains('open')) return;

  locked = true;

  current = Math.max(0, Math.min(totalCourses - 1, n));

  track.style.transform = `translateY(-${current * 100}%)`;

  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));

  const scrollHint = document.getElementById('scrollHint');

  if(scrollHint) scrollHint.style.opacity = current === totalCourses - 1 ? '0' : '1';

  setTimeout(() => locked = false, 800);

}

let wheelThrottled = false;
window.addEventListener('wheel', e => {

  if (wheelThrottled) return;
  if (!track || !detailView) return;

  if (detailView.classList.contains('open') || document.getElementById('coursesMenuSection')?.style.display === 'block') return;

  wheelThrottled = true;
  setTimeout(() => { wheelThrottled = false; }, 100);
  goTo(current + (e.deltaY > 0 ? 1 : -1));

}, { passive: true });

let touchStartY = 0;

window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY, { passive: true });

window.addEventListener('touchend', e => {

  if (!track || !detailView) return;

  if (detailView.classList.contains('open') || document.getElementById('coursesMenuSection')?.style.display === 'block') return;

  const dy = touchStartY - e.changedTouches[0].clientY;

  if (Math.abs(dy) > 40) goTo(current + (dy > 0 ? 1 : -1));

}, { passive: true });

buildDots();

// -- FULL WEBSITE MENU & DETAIL VIEWS --

function openCoursesMenu() {
  showDashboard();
}

function closeCoursesMenu() {
  showDashboard();
}

// -- HANDBOOK DROPDOWN LOGIC --

function toggleHandbookDropdown(e) {

  e.stopPropagation();

  var dd = document.getElementById('handbookDropdown');

  if (!dd) return;

  dd.classList.toggle('open');

}

function closeHandbookDropdown() {

  var dd = document.getElementById('handbookDropdown');

  if (dd) dd.classList.remove('open');

}

// Close dropdown when clicking outside

document.addEventListener('click', function(e) {

  var wrap = document.querySelector('.handbook-dropdown-wrap');

  if (wrap && !wrap.contains(e.target)) {

    closeHandbookDropdown();

  }

});

function goToFreeSQL() {

  openDetail('data-analyst');

  // Scroll to the free SQL handbook button after the detail view opens

  setTimeout(function() {

    var btn = document.querySelector('#course-data-analyst .form-submit-full');

    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });

  }, 500);

}

function goToFreeML() {

  openDetail('data-science');

  // Scroll to the free ML handbook button after the detail view opens

  setTimeout(function() {

    var btn = document.querySelector('#course-data-science .form-submit-full');

    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });

  }, 500);

}

function openDetail(courseId) {
  if (courseId === 'data-analyst-questions') {
    loadLazyIframe('sqlQuestionsIframe');
  } else if (courseId === 'data-science-questions') {
    loadLazyIframe('mlQuestionsIframe');
  }

  // Hide other sections
  hideAllSections();

  // Show the target section
  const target = document.getElementById('course-' + courseId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
  }

  // Update sidebar active states
  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  if (courseId === 'help') {
    const helpNavItem = Array.from(document.querySelectorAll('.dashboard-nav-item'))
      .find(item => item.textContent.includes('Help & FAQ') || item.textContent.includes('Help &amp; FAQ'));
    if (helpNavItem) helpNavItem.classList.add('active');
  } else if (courseId === 'data-analyst-complete') {
    const daCompleteNavItem = Array.from(document.querySelectorAll('.dashboard-nav-item'))
      .find(item => item.textContent.includes('Complete Kit') || item.textContent.includes('Complete Bundle'));
    if (daCompleteNavItem) daCompleteNavItem.classList.add('active');
  } else if (courseId === 'data-analyst') {
    const daNavItem = Array.from(document.querySelectorAll('.dashboard-nav-item'))
      .find(item => item.textContent.trim().startsWith('Data & BI Analyst Kit') || item.textContent.trim().startsWith('Data &amp; BI Analyst Kit'));
    if (daNavItem) daNavItem.classList.add('active');
  } else if (courseId === 'ai-automation') {
    const aiNavItem = Array.from(document.querySelectorAll('.dashboard-nav-item'))
      .find(item => item.textContent.includes('Crack Machine Learning Interviews'));
    if (aiNavItem) aiNavItem.classList.add('active');
  } else {
    const courseNavItem = Array.from(document.querySelectorAll('.dashboard-nav-item'))
      .find(item => item.textContent.includes('Course Bundles') || item.textContent.includes('Course Handbook Bundle'));
    if (courseNavItem) courseNavItem.classList.add('active');
  }

  // Update topbar header text to breadcrumbs
  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft) {
    if (!topbarLeft.dataset.originalHtml) {
      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;
    }

    if (courseId === 'help') {
      topbarLeft.innerHTML = `
        <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">
          <span onclick="showDashboard()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>
          <span style="color:var(--muted);margin:0 8px;">&gt;</span>
          <span style="color:var(--navy);font-weight:700;">Help &amp; FAQ</span>
        </div>
      `;
    } else if (courseId === 'data-analyst' || courseId === 'data-analyst-complete' || courseId === 'data-science' || courseId === 'ai-automation') {
      let title = 'Data &amp; BI Analyst Interview Kit';
      if (courseId === 'data-analyst-complete') {
        title = 'Data &amp; BI Analyst Complete Kit';
      } else if (courseId === 'data-science') {
        title = 'Data Scientist &amp; Gen AI Engineer Bundle';
      } else if (courseId === 'ai-automation') {
        title = 'Crack Machine Learning Interviews';
      }

      topbarLeft.innerHTML = `
        <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">
          <span onclick="showDashboard()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>
          <span style="color:var(--muted);margin:0 8px;">&gt;</span>
          <span onclick="openCoursesMenu()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Course Bundles</span>
          <span style="color:var(--muted);margin:0 8px;">&gt;</span>
          <span style="color:var(--navy);font-weight:700;">${title}</span>
        </div>
      `;
    } else {
      const parentId = courseId === 'data-analyst-questions' ? 'data-analyst' : 'data-science';
      const parentTitle = courseId === 'data-analyst-questions' ? 'Data &amp; BI Analyst Kit' : 'Data Scientist &amp; Gen AI Engineer Bundle';

      topbarLeft.innerHTML = `
        <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">
          <span onclick="showDashboard()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>
          <span style="color:var(--muted);margin:0 8px;">&gt;</span>
          <span onclick="openDetail('${parentId}')" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">${parentTitle}</span>
          <span style="color:var(--muted);margin:0 8px;">&gt;</span>
          <span style="color:var(--navy);font-weight:700;">Interview Questions</span>
        </div>
      `;
    }
  }

  var sh = document.getElementById('sideHighlights'); if (sh) sh.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function closeDetail() {

  document.body.classList.remove('standalone-da-page');

  if (!detailView) return;

  detailView.classList.remove('open');

  if (homeFooter) homeFooter.style.display = 'flex';

  document.body.style.overflow = 'auto';

  // NEW: Remove the hash from the URL when going back home

  window.history.replaceState(null, null, window.location.pathname);

  var sh = document.getElementById('sideHighlights'); if (sh) sh.style.display = '';

}

function scrollDashboardTop() {

  showDashboard();

}

var allSectionIds = ['coursesMenuSection', 'freeHandbooksSection', 'reviewsSection', 'course-data-analyst-complete', 'course-data-analyst', 'course-data-science', 'course-data-science-questions', 'course-ai-automation', 'course-data-engineering', 'course-download', 'course-help'];

function hideAllSections() {
  allSectionIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  });
}

function showDashboard() {
  document.body.classList.remove('standalone-da-page');

  if (typeof closeDetail === 'function') {
    closeDetail();
  }

  hideAllSections();

  var cms = document.getElementById('coursesMenuSection');
  if (cms) {
    cms.style.display = 'block';
  }

  // Update sidebar active state
  document.querySelectorAll('.dashboard-nav-item').forEach(function(item) { item.classList.remove('active'); });
  var firstNav = document.querySelector('.dashboard-nav-item');
  if (firstNav) firstNav.classList.add('active');

  // Set topbar header text
  var topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft) {
    topbarLeft.innerHTML = `
      <h1>Welcome to Learn<span class="brand-lytics">lytics</span></h1>
      <p>Your one-stop hub for high-quality handbooks to <strong>learn, practice &amp; grow.</strong></p>
    `;
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

var sectionConfig = {
  free:    { id: 'freeHandbooksSection',     title: 'Free Resources',         subtitle: 'Download high-quality handbooks and resources completely free.' },
  reviews: { id: 'reviewsSection',           title: 'Student Reviews',        subtitle: 'Hear from learners who upgraded their careers.' }
};

function showSection(section) {
  if (typeof closeDetail === 'function') {
    closeDetail();
  }

  var config = sectionConfig[section];
  if (!config) return;
  var target = document.getElementById(config.id);
  if (!target) return;

  hideAllSections();
  target.style.display = 'block';

  // Update sidebar active
  document.querySelectorAll('.dashboard-nav-item').forEach(function(item) { item.classList.remove('active'); });
  var activeButton = Array.from(document.querySelectorAll('.dashboard-nav-item'))
    .find(function(item) { var oc = item.getAttribute('onclick'); return oc && oc.includes("'" + section + "'"); });
  if (activeButton) activeButton.classList.add('active');

  // Update topbar header text
  var topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft) {
    topbarLeft.innerHTML = `
      <h1>${config.title}</h1>
      <p>${config.subtitle}</p>
    `;
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Legacy alias

function showDashboardSection(section) { showSection(section); }

function openPythonHandbook() {
  loadLazyIframe('pythonSyllabusIframe');

  // Hide main dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  // Hide all sections first

  hideAllSections();

        if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  // Show Python details section

  const pythonSection = document.getElementById('pythonDetailSection');

  if (pythonSection) {

    pythonSection.style.display = 'block';

  }

  // Update header text to breadcrumbs

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft) {

    if (!topbarLeft.dataset.originalHtml) {

      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;

    }

    topbarLeft.innerHTML = `

      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">

        <span onclick="closePythonHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>

        <span style="color:var(--muted);margin:0 8px;">&gt;</span>

        <span style="color:var(--navy);font-weight:700;">Python for Data Professionals</span>

      </div>

    `;

  }

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function closePythonHandbook() {

  // Restore dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = '';

  if (dashGrid) dashGrid.style.display = '';

  if (dashBottom) dashBottom.style.display = '';

  // Hide Python details section

  const pythonSection = document.getElementById('pythonDetailSection');

  if (pythonSection) {

    pythonSection.style.display = 'none';

  }

  // Restore original header content

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft && topbarLeft.dataset.originalHtml) {

    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;

  }

  // Set Dashboard nav active

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))

    .find(item => item.textContent.includes('Dashboard'));

  if (dashBtn) dashBtn.classList.add('active');

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function openPythonDsHandbook() {
  loadLazyIframe('pythonDsSyllabusIframe');
  // Hide main dashboard homepage elements
  const statsGrid = document.querySelector('.stats-grid');
  const dashGrid = document.querySelector('.dashboard-grid');
  const dashBottom = document.querySelector('.dashboard-bottom');
  if (statsGrid) statsGrid.style.display = 'none';
  if (dashGrid) dashGrid.style.display = 'none';
  if (dashBottom) dashBottom.style.display = 'none';
  
  // Hide all sections first
  hideAllSections();
  if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  
  // Show Python DS details section
  const pythonDsSection = document.getElementById('pythonDsDetailSection');
  if (pythonDsSection) {
    pythonDsSection.style.display = 'block';
  }
  
  // Update header text to breadcrumbs
  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft) {
    if (!topbarLeft.dataset.originalHtml) {
      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;
    }
    topbarLeft.innerHTML = `
      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">
        <span onclick="closePythonDsHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>
        <span style="color:var(--muted);margin:0 8px;">&gt;</span>
        <span style="color:var(--navy);font-weight:700;">Python For Data Science Handbook</span>
      </div>
    `;
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closePythonDsHandbook() {
  // Restore dashboard homepage elements
  const statsGrid = document.querySelector('.stats-grid');
  const dashGrid = document.querySelector('.dashboard-grid');
  const dashBottom = document.querySelector('.dashboard-bottom');
  if (statsGrid) statsGrid.style.display = '';
  if (dashGrid) dashGrid.style.display = '';
  if (dashBottom) dashBottom.style.display = '';
  
  // Hide Python DS details section
  const pythonDsSection = document.getElementById('pythonDsDetailSection');
  if (pythonDsSection) {
    pythonDsSection.style.display = 'none';
  }
  
  // Restore original header content
  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft && topbarLeft.dataset.originalHtml) {
    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;
  }
  
  // Set Dashboard nav active
  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));
  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))
    .find(item => item.textContent.includes('Dashboard'));
  if (dashBtn) dashBtn.classList.add('active');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMathHandbook() {
  loadLazyIframe('mathSyllabusIframe');

  // Hide main dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  // Hide all sections first

  hideAllSections();

        if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  // Show Math details section

  const mathSection = document.getElementById('mathDetailSection');

  if (mathSection) {

    mathSection.style.display = 'block';

  }

  // Update header text to breadcrumbs

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft) {

    if (!topbarLeft.dataset.originalHtml) {

      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;

    }

    topbarLeft.innerHTML = `

      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">

        <span onclick="closeMathHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>

        <span style="color:var(--muted);margin:0 8px;">&gt;</span>

        <span style="color:var(--navy);font-weight:700;">Mathematics &amp; Statistics Handbook</span>

      </div>

    `;

  }

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function closeMathHandbook() {

  // Restore dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = '';

  if (dashGrid) dashGrid.style.display = '';

  if (dashBottom) dashBottom.style.display = '';

  // Hide Math details section

  const mathSection = document.getElementById('mathDetailSection');

  if (mathSection) {

    mathSection.style.display = 'none';

  }

  // Restore original header content

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft && topbarLeft.dataset.originalHtml) {

    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;

  }

  // Set Dashboard nav active

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))

    .find(item => item.textContent.includes('Dashboard'));

  if (dashBtn) dashBtn.classList.add('active');

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function openMathDsHandbook() {
  loadLazyIframe('mathDsSyllabusIframe');
  // Hide main dashboard homepage elements
  const statsGrid = document.querySelector('.stats-grid');
  const dashGrid = document.querySelector('.dashboard-grid');
  const dashBottom = document.querySelector('.dashboard-bottom');
  if (statsGrid) statsGrid.style.display = 'none';
  if (dashGrid) dashGrid.style.display = 'none';
  if (dashBottom) dashBottom.style.display = 'none';
  
  // Hide all sections first
  hideAllSections();
    if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  
  // Show Math DS details section
  const mathDsSection = document.getElementById('mathDsDetailSection');
  if (mathDsSection) {
    mathDsSection.style.display = 'block';
  }
  
  // Update header text to breadcrumbs
  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft) {
    if (!topbarLeft.dataset.originalHtml) {
      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;
    }
    topbarLeft.innerHTML = `
      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">
        <span onclick="closeMathDsHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>
        <span style="color:var(--muted);margin:0 8px;">&gt;</span>
        <span style="color:var(--navy);font-weight:700;">Mathematics &amp; Statistics For Data Science Handbook</span>
      </div>
    `;
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeMathDsHandbook() {
  // Restore dashboard homepage elements
  const statsGrid = document.querySelector('.stats-grid');
  const dashGrid = document.querySelector('.dashboard-grid');
  const dashBottom = document.querySelector('.dashboard-bottom');
  if (statsGrid) statsGrid.style.display = '';
  if (dashGrid) dashGrid.style.display = '';
  if (dashBottom) dashBottom.style.display = '';
  
  // Hide Math DS details section
  const mathDsSection = document.getElementById('mathDsDetailSection');
  if (mathDsSection) {
    mathDsSection.style.display = 'none';
  }
  
  // Restore original header content
  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft && topbarLeft.dataset.originalHtml) {
    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;
  }
  
  // Set Dashboard nav active
  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));
  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))
    .find(item => item.textContent.includes('Dashboard'));
  if (dashBtn) dashBtn.classList.add('active');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSqlHandbook() {
  loadLazyIframe('sqlSyllabusIframe');

  // Hide main dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  // Hide all sections first

  hideAllSections();

        if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  // Show SQL details section

  const sqlSection = document.getElementById('sqlDetailSection');

  if (sqlSection) {

    sqlSection.style.display = 'block';

  }

  // Update header text to breadcrumbs

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft) {

    if (!topbarLeft.dataset.originalHtml) {

      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;

    }

    topbarLeft.innerHTML = `

      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">

        <span onclick="closeSqlHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>

        <span style="color:var(--muted);margin:0 8px;">&gt;</span>

        <span style="color:var(--navy);font-weight:700;">SQL &amp; Databases Handbook</span>

      </div>

    `;

  }

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function closeSqlHandbook() {

  // Restore dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = '';

  if (dashGrid) dashGrid.style.display = '';

  if (dashBottom) dashBottom.style.display = '';

  // Hide SQL details section

  const sqlSection = document.getElementById('sqlDetailSection');

  if (sqlSection) {

    sqlSection.style.display = 'none';

  }

  // Restore original header content

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft && topbarLeft.dataset.originalHtml) {

    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;

  }

  // Set Dashboard nav active

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))

    .find(item => item.textContent.includes('Dashboard'));

  if (dashBtn) dashBtn.classList.add('active');

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function openBiHandbook() {
  loadLazyIframe('biSyllabusIframe');

  // Hide main dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  // Hide all sections first

  hideAllSections();

        if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  // Show BI details section

  const biSection = document.getElementById('biDetailSection');

  if (biSection) {

    biSection.style.display = 'block';

  }

  // Update header text to breadcrumbs

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft) {

    if (!topbarLeft.dataset.originalHtml) {

      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;

    }

    topbarLeft.innerHTML = `

      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">

        <span onclick="closeBiHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>

        <span style="color:var(--muted);margin:0 8px;">&gt;</span>

        <span style="color:var(--navy);font-weight:700;">Business Intelligence &amp; Dashboards Handbook</span>

      </div>

    `;

  }

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function closeBiHandbook() {

  // Restore dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = '';

  if (dashGrid) dashGrid.style.display = '';

  if (dashBottom) dashBottom.style.display = '';

  // Hide BI details section

  const biSection = document.getElementById('biDetailSection');

  if (biSection) {

    biSection.style.display = 'none';

  }

  // Restore original header content

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft && topbarLeft.dataset.originalHtml) {

    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;

  }

  // Set Dashboard nav active

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))

    .find(item => item.textContent.includes('Dashboard'));

  if (dashBtn) dashBtn.classList.add('active');

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function openDeHandbook() {
  loadLazyIframe('deSyllabusIframe');

  // Hide main dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  // Hide all sections first

  hideAllSections();

        if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  // Show DE details section

  const deSection = document.getElementById('deDetailSection');

  if (deSection) {

    deSection.style.display = 'block';

  }

  // Update header text to breadcrumbs

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft) {

    if (!topbarLeft.dataset.originalHtml) {

      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;

    }

    topbarLeft.innerHTML = `

      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">

        <span onclick="closeDeHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>

        <span style="color:var(--muted);margin:0 8px;">&gt;</span>

        <span style="color:var(--navy);font-weight:700;">Data Engineering Fundamentals Handbook</span>

      </div>

    `;

  }

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function closeDeHandbook() {

  // Restore dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = '';

  if (dashGrid) dashGrid.style.display = '';

  if (dashBottom) dashBottom.style.display = '';

  // Hide DE details section

  const deSection = document.getElementById('deDetailSection');

  if (deSection) {

    deSection.style.display = 'none';

  }

  // Restore original header content

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft && topbarLeft.dataset.originalHtml) {

    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;

  }

  // Set Dashboard nav active

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))

    .find(item => item.textContent.includes('Dashboard'));

  if (dashBtn) dashBtn.classList.add('active');

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function openDomainHandbook() {
  loadLazyIframe('domainSyllabusIframe');

  // Hide main dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  // Hide all sections first

  hideAllSections();

        if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  // Show Domain details section

  const domainSection = document.getElementById('domainDetailSection');

  if (domainSection) {

    domainSection.style.display = 'block';

  }

  // Update header text to breadcrumbs

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft) {

    if (!topbarLeft.dataset.originalHtml) {

      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;

    }

    topbarLeft.innerHTML = `

      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">

        <span onclick="closeDomainHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>

        <span style="color:var(--muted);margin:0 8px;">&gt;</span>

        <span style="color:var(--navy);font-weight:700;">Storytelling, Communication &amp; Domain Knowledge Handbook</span>

      </div>

    `;

  }

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function closeDomainHandbook() {

  // Restore dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = '';

  if (dashGrid) dashGrid.style.display = '';

  if (dashBottom) dashBottom.style.display = '';

  // Hide Domain details section

  const domainSection = document.getElementById('domainDetailSection');

  if (domainSection) {

    domainSection.style.display = 'none';

  }

  // Restore original header content

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft && topbarLeft.dataset.originalHtml) {

    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;

  }

  // Set Dashboard nav active

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))

    .find(item => item.textContent.includes('Dashboard'));

  if (dashBtn) dashBtn.classList.add('active');

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function openAiHandbook() {
  loadLazyIframe('aiSyllabusIframe');

  // Hide main dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  // Hide all sections first

  hideAllSections();

        if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  // Show AI details section

  const aiSection = document.getElementById('aiDetailSection');

  if (aiSection) {

    aiSection.style.display = 'block';

  }

  // Update header text to breadcrumbs

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft) {

    if (!topbarLeft.dataset.originalHtml) {

      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;

    }

    topbarLeft.innerHTML = `

      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">

        <span onclick="closeAiHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>

        <span style="color:var(--muted);margin:0 8px;">&gt;</span>

        <span style="color:var(--navy);font-weight:700;">AI-Era Analytics Handbook</span>

      </div>

    `;

  }

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function closeAiHandbook() {

  // Restore dashboard homepage elements

  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = '';

  if (dashGrid) dashGrid.style.display = '';

  if (dashBottom) dashBottom.style.display = '';

  // Hide AI details section

  const aiSection = document.getElementById('aiDetailSection');

  if (aiSection) {

    aiSection.style.display = 'none';

  }

  // Restore original header content

  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');

  if (topbarLeft && topbarLeft.dataset.originalHtml) {

    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;

  }

  // Set Dashboard nav active

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))

    .find(item => item.textContent.includes('Dashboard'));

  if (dashBtn) dashBtn.classList.add('active');

  // Scroll to top

  window.scrollTo({ top: 0, behavior: 'smooth' });

}

function openExcelHandbook() {
  loadLazyIframe('excelSyllabusIframe');
  // Hide main dashboard homepage elements
  const statsGrid = document.querySelector('.stats-grid');
  const dashGrid = document.querySelector('.dashboard-grid');
  const dashBottom = document.querySelector('.dashboard-bottom');
  if (statsGrid) statsGrid.style.display = 'none';
  if (dashGrid) dashGrid.style.display = 'none';
  if (dashBottom) dashBottom.style.display = 'none';
  
  // Hide all sections first
  hideAllSections();
      if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  
  // Show Excel details section
  const excelSection = document.getElementById('excelDetailSection');
  if (excelSection) {
    excelSection.style.display = 'block';
  }
  
  // Update header text to breadcrumbs
  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft) {
    if (!topbarLeft.dataset.originalHtml) {
      topbarLeft.dataset.originalHtml = topbarLeft.innerHTML;
    }
    topbarLeft.innerHTML = `
      <div class="breadcrumbs" style="font-family:'Manrope', sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;">
        <span onclick="closeExcelHandbook()" style="cursor:pointer;color:var(--muted);transition:color 0.2s;">Home</span>
        <span style="color:var(--muted);margin:0 8px;">&gt;</span>
        <span style="color:var(--navy);font-weight:700;">Excel &amp; Google Sheets Handbook</span>
      </div>
    `;
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeExcelHandbook() {
  // Restore dashboard homepage elements
  const statsGrid = document.querySelector('.stats-grid');
  const dashGrid = document.querySelector('.dashboard-grid');
  const dashBottom = document.querySelector('.dashboard-bottom');
  if (statsGrid) statsGrid.style.display = '';
  if (dashGrid) dashGrid.style.display = '';
  if (dashBottom) dashBottom.style.display = '';
  
  // Hide Excel details section
  const excelSection = document.getElementById('excelDetailSection');
  if (excelSection) {
    excelSection.style.display = 'none';
  }
  
  // Restore original header content
  const topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft && topbarLeft.dataset.originalHtml) {
    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;
  }
  
  // Set Dashboard nav active
  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));
  const dashBtn = Array.from(document.querySelectorAll('.dashboard-nav-item'))
    .find(item => item.textContent.includes('Dashboard'));
  if (dashBtn) dashBtn.classList.add('active');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleAllPythonModules() {

  const modules = ['py-mod1', 'py-mod2', 'py-mod3', 'py-mod4', 'py-mod5', 'py-mod6'];

  const btn = document.getElementById('toggleAllModulesBtn');

  if (!btn) return;

  const isExpand = btn.textContent.includes('Expand');

  modules.forEach(id => {

    const card = document.getElementById(id);

    if (card) {

      if (isExpand) {

        card.classList.add('open');

      } else {

        card.classList.remove('open');

      }

    }

  });

  btn.textContent = isExpand ? 'Collapse All' : 'Expand All';

}

function togglePhase(id) {

  const card = document.getElementById(id);

  if (!card) return;

  card.classList.toggle('open');

}

// Scroll to a phase card and open it (triggered from subject-map chips)

function scrollToPhase(id) {

  const card = document.getElementById(id);

  if (!card) return;

  if (!card.classList.contains('open')) {

    card.classList.add('open');

  }

  card.scrollIntoView({ behavior: 'smooth', block: 'center' });

}

// -- FREE HANDBOOK MODAL LOGIC --

let currentModalConfig = {

  title: "Get Free SQL Handbook",

  sub: "Enter your details below &mdash; we will send the handbook directly to your inbox. No spam, we promise.",

  successMsg: "We just sent the free handbook directly to your inbox (check your spam folder just in case!).",

  downloadText: "📄 Download Free SQL Kit Now",

  fileLink: "https://drive.google.com/file/d/1-LIhEGSuNyCqY2zj2eg-sCxyU3Dnoyu2/view?usp=drive_link",

  subject: "📄 Your Free SQL Database Handbook — Learnlytics.handbook",

  emailTitle: "Free SQL Database Handbook"

};

function openModal(type) {

  const baseLink = window.location.origin;

  if (type === 'sql-questions') {

    currentModalConfig = {

      title: "Get Free SQL Questions Set",

      sub: "Enter your details below &mdash; we will send the sample questions directly to your inbox. No spam, we promise.",

      successMsg: "We just sent the free sample questions directly to your inbox (check your spam folder just in case!).",

      downloadText: "📄 Download Free SQL Questions Now",

      fileLink: "https://drive.google.com/file/d/1-LIhEGSuNyCqY2zj2eg-sCxyU3Dnoyu2/view?usp=drive_link",

      subject: "📄 Your Free SQL Questions Set — Learnlytics.handbook",

      emailTitle: "Free SQL Questions Set"

    };

  } else if (type === 'ml-interview-questions') {

    currentModalConfig = {

      title: "Get Free ML Part-01 Interview QS",

      sub: "Enter your details below &mdash; we will send the Machine Learning interview question set directly to your inbox. No spam, we promise.",

      successMsg: "We just sent the free ML interview question set directly to your inbox (check your spam folder just in case!).",

      downloadText: "📄 Download Free ML Part-01 Interview QS Now",

      fileLink: "https://drive.google.com/file/d/1UgDoS8ql9byHx2rtPORYe0bGSr2jwNaY/view?usp=sharing",

      subject: "📄 Your Free ML Part-01 Interview Question Set — Learnlytics.handbook",

      emailTitle: "Free ML Part-01 Interview Question Set"

    };

  } else if (type === 'ds-handbook') {

    currentModalConfig = {

      title: "Get Free ML Part-01 Handbook",

      sub: "Enter your details below &mdash; we will send the handbook directly to your inbox. No spam, we promise.",

      successMsg: "We just sent the free handbook directly to your inbox (check your spam folder just in case!).",

      downloadText: "📄 Download Free ML Part-01 Handbook Now",

      fileLink: "https://drive.google.com/file/d/1uWMZyKNwhMUyzIqkj-_0-kBxJ-o5KmoF/view?usp=sharing",

      subject: "📄 Your Free ML Part-01 Handbook — Learnlytics.handbook",

      emailTitle: "Free ML Part-01 Handbook"

    };

  } else if (type === 'ds-questions') {

    currentModalConfig = {

      title: "Get Free Machine Learning Questions Set",

      sub: "Enter your details below &mdash; we will send the sample questions directly to your inbox.",

      successMsg: "We just sent the free sample questions directly to your inbox (check your spam folder just in case!).",

      downloadText: "📄 Download ML Questions Sample Now",

      fileLink: baseLink + "/pdfs/ML-part01-que-handook.pdf",

      subject: "📄 Your Free Machine Learning Questions Sample — Learnlytics.handbook",

      emailTitle: "Free Machine Learning Questions Sample"

    };

  } else {

    // Default: sql-handbook

    currentModalConfig = {

      title: "Get Free SQL Handbook",

      sub: "Enter your details below &mdash; we will send the handbook directly to your inbox. No spam, we promise.",

      successMsg: "We just sent the free handbook directly to your inbox (check your spam folder just in case!).",

      downloadText: "📄 Download Free SQL Kit Now",

      fileLink: "https://drive.google.com/file/d/1-LIhEGSuNyCqY2zj2eg-sCxyU3Dnoyu2/view?usp=drive_link",

      subject: "📄 Your Free SQL Database Handbook — Learnlytics.handbook",

      emailTitle: "Free SQL Database Handbook"

    };

  }

  // Swap modal DOM values

  const titleEl = document.getElementById('modal-title');
  const subEl = document.getElementById('modal-sub');
  const successEl = document.getElementById('modal-success-msg');
  const dlBtn = document.getElementById('modal-download-btn');
  if (!titleEl || !subEl || !dlBtn) return;

  titleEl.innerText = currentModalConfig.title;

  subEl.innerHTML = currentModalConfig.sub;

  if (successEl) successEl.innerText = currentModalConfig.successMsg;

  dlBtn.href = currentModalConfig.fileLink;

  dlBtn.innerText = currentModalConfig.downloadText;


  document.getElementById('modal').classList.add('open');

}

function closeModal() {

  document.getElementById('modal').classList.remove('open');

  setTimeout(() => {

    document.getElementById('modal-form-content').style.display = 'block';

    document.getElementById('modal-success').style.display = 'none';

    document.getElementById('inp-name').value = '';

    document.getElementById('inp-email').value = '';

    document.getElementById('inp-wa').value = '';

  }, 300);

}

function submitModalForm() {

  const name = document.getElementById('inp-name').value.trim();

  const email = document.getElementById('inp-email').value.trim();

  const wa = document.getElementById('inp-wa').value.trim();

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || wa.replace(/\D/g,'').length < 10) { 

      alert('Please fill out all fields correctly.'); return; 

  }

  const btn = document.querySelector('.modal-submit');

  btn.innerText = "Processing...";

  const scriptURL = 'https://script.google.com/macros/s/AKfycbxl9TB50_VHlU_H6r6yCs33NNuzWU0VBqhWG5yXBbe7jwR4jMyd9zWbSj8AMGPRKgMy/exec';

  const formData = new URLSearchParams();

  formData.append('name', name);

  formData.append('email', email);

  formData.append('phone', wa);

  formData.append('fileLink', currentModalConfig.fileLink);

  formData.append('subject', currentModalConfig.subject);

  formData.append('emailTitle', currentModalConfig.emailTitle);

  fetch(scriptURL, {

    method: 'POST',

    body: formData

  })

  .then(response => {

    if (!response.ok) throw new Error('Server error');

    document.getElementById('modal-form-content').style.display = 'none';

    document.getElementById('modal-success').style.display = 'block';

    btn.innerText = "Unlock My PDF"; 

  })

  .catch(error => {

    alert('Error submitting form. Please try again.');

    btn.innerText = "Unlock My PDF";

  });

}

// -- REVIEW MODAL LOGIC --

function openReviewModal() {

  document.getElementById('review-modal').classList.add('open');

}

function closeReviewModal() {

  document.getElementById('review-modal').classList.remove('open');

  setTimeout(() => {

    document.getElementById('review-form-content').style.display = 'block';

    document.getElementById('review-success').style.display = 'none';

    document.getElementById('rev-name').value = '';

    document.getElementById('rev-rating').value = '5';

    document.getElementById('rev-text').value = '';

  }, 300);

}

function submitReviewForm() {

  const name = document.getElementById('rev-name').value.trim();

  const rating = document.getElementById('rev-rating').value.trim();

  const review = document.getElementById('rev-text').value.trim();

  if (!name || !review) { 

      alert('Please fill out your name and your review.'); return; 

  }

  const btn = document.querySelector('#review-form-content .modal-submit');

  btn.innerText = "Submitting...";

  const scriptURL = 'https://script.google.com/macros/s/AKfycbxl9TB50_VHlU_H6r6yCs33NNuzWU0VBqhWG5yXBbe7jwR4jMyd9zWbSj8AMGPRKgMy/exec';

  const formData = new URLSearchParams();

  formData.append('type', 'review'); 

  formData.append('name', name);

  formData.append('rating', rating);

  formData.append('review', review);

  fetch(scriptURL, {

    method: 'POST',

    body: formData

  })

  .then(response => {

    if (!response.ok) throw new Error('Server error');

    document.getElementById('review-form-content').style.display = 'none';

    document.getElementById('review-success').style.display = 'block';

    btn.innerText = "Submit Review"; 

  })

  .catch(error => {

    alert('Error submitting review. Please try again.');

    btn.innerText = "Submit Review";

  });

}

window.addEventListener('keydown', e => {

  if (e.key === 'Escape') {

    if (document.getElementById('modal').classList.contains('open')) {

      closeModal();

    } else if (document.getElementById('review-modal') && document.getElementById('review-modal').classList.contains('open')) {

      closeReviewModal();

    } else if (document.getElementById('coursesMenuSection')?.style.display === 'block') {

      closeCoursesMenu();

    } else if (detailView && detailView.classList.contains('open')) {

      closeDetail();

    }

  }

  // FIX: added review-modal and coursesMenuSection to guard -- previously arrow keys could navigate slides while modal was open

  const reviewModal = document.getElementById('review-modal');

  const coursesSection = document.getElementById('coursesMenuSection');

  const isCoursesOpen = coursesSection && coursesSection.style.display === 'block';

  if ((detailView && detailView.classList.contains('open')) || document.getElementById('modal')?.classList.contains('open') || isCoursesOpen || (reviewModal && reviewModal.classList.contains('open'))) return;

  if (!track) return;

  if (e.key === 'ArrowDown') goTo(current + 1);

  if (e.key === 'ArrowUp') goTo(current - 1);

});

const REGIONAL_CHECKOUT = {

  dataAnalyst: {

    asia: {

      handbook: 'https://rzp.io/rzp/7gKjrQ1R',

      interview: 'https://rzp.io/rzp/BnUho1gl',

      bundle: 'https://rzp.io/rzp/S2y4eZ3'

    },

    international: {

      handbook: 'https://rzp.io/rzp/D7r6WGq',

      interview: 'https://rzp.io/rzp/kGokl24y',

      bundle: 'https://rzp.io/rzp/ro1v8df'

    }

  },

  dataScience: {

    asia: 'https://rzp.io/rzp/43PikTXQ',

    international: 'https://rzp.io/rzp/jJvaGhJy'

  }

};

const EUROPE_COUNTRY_CODES = new Set([

  'AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK',

  'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'XK', 'LV',

  'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL',

  'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'TR',

  'UA', 'GB', 'VA'

]);

const ASIA_COUNTRY_CODES = new Set([

  'AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'GE', 'HK',

  'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KW', 'KG', 'LA',

  'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'KP', 'OM', 'PK', 'PS',

  'PH', 'QA', 'SA', 'SG', 'KR', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL',

  'TM', 'AE', 'UZ', 'VN', 'YE'

]);

const AFRICA_COUNTRY_CODES = new Set([

  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM',

  'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM',

  'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR',

  'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL',

  'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'

]);

const USD_DA_KIT_COUNTRY_CODES = new Set(['US', 'GB', 'RU']);

function getCourseRoots(courseIds) {

  return courseIds

    .map(id => document.getElementById(id))

    .filter(Boolean);

}

function updateWithin(roots, selector, update) {

  roots.forEach(root => root.querySelectorAll(selector).forEach(update));

}

function replacePaymentLink(oldUrl, newUrl) {

  document.querySelectorAll(`a[href="${oldUrl}"]`).forEach(link => {

    link.href = newUrl;

  });

}

function applyDataAnalystMarket(useInternationalCheckout) {

  if (!useInternationalCheckout) return;

  const analystRoots = getCourseRoots([

    'course-data-analyst',

    'course-data-analyst-questions'

  ]);

  updateWithin(analystRoots, '.price-basic', el => el.textContent = '$19');

  updateWithin(analystRoots, '.price-bundle', el => el.textContent = '$29');

  updateWithin(analystRoots, '.strike-basic', el => el.textContent = '$39');

  updateWithin(analystRoots, '.strike-bundle', el => el.textContent = '$79');

  updateWithin(analystRoots, '.conversion-callout span', el => {

    el.textContent = 'Market Value: $99. Launch Price: $19.';

  });

  const heroOffer = document.querySelector('.conversion-copy span');

  if (heroOffer) {

    heroOffer.textContent = 'Market Value: $99. Launch Price: $19.';

  }

  replacePaymentLink(

    REGIONAL_CHECKOUT.dataAnalyst.asia.handbook,

    REGIONAL_CHECKOUT.dataAnalyst.international.handbook

  );

  replacePaymentLink(

    REGIONAL_CHECKOUT.dataAnalyst.asia.interview,

    REGIONAL_CHECKOUT.dataAnalyst.international.interview

  );

  replacePaymentLink(

    REGIONAL_CHECKOUT.dataAnalyst.asia.bundle,

    REGIONAL_CHECKOUT.dataAnalyst.international.bundle

  );

}

function applyDaKitPricing(countryCode) {

  if (!countryCode) return;

  // Tier 3: Asia + Africa → keep INR defaults (same as India)
  if (ASIA_COUNTRY_CODES.has(countryCode) || AFRICA_COUNTRY_CODES.has(countryCode)) return;

  var tier;

  if (USD_DA_KIT_COUNTRY_CODES.has(countryCode)) {

    // Fixed USD pricing for the United States, United Kingdom, and Russia.
    tier = {
      kitDisplay: '$6.99',
      kitStrikeDisplay: '$24.99',
      upgradeDisplay: '+ $3.00',
      upgradeStrikeDisplay: '$19.99',
      upgradeDescHTML: 'Upgrade to the <strong>Complete Kit</strong> for Just $3.00',
      totalDisplay: '$9.99',
      offLabel: '72% OFF',
      kitLink: 'https://rzp.io/rzp/kGokl24y',
      bundleLink: 'https://rzp.io/rzp/ro1v8df',
      bundleCardPrice: '$9.99',
      bundleCardStrike: '$29.99',
      bundleCardOff: '67% OFF',
      perResourceDisplay: 'Less than $0.42 per resource • One-time payment'
    };

  } else {

    // Tier 2: Other international markets
    tier = {
      kitDisplay: '$7.99',
      kitStrikeDisplay: '$24.99',
      upgradeDisplay: '+ $3.99',
      upgradeStrikeDisplay: '$19.99',
      upgradeDescHTML: 'Add <strong>8 Premium Handbooks</strong> in Just $3.99',
      totalDisplay: '$11.98',
      offLabel: '68% OFF',
      kitLink: 'https://rzp.io/rzp/jQi4GPl',
      bundleLink: 'https://rzp.io/rzp/D7r6WGq',
      bundleCardPrice: '$11.99',
      bundleCardStrike: '$24.99',
      bundleCardOff: '52% OFF',
      perResourceDisplay: 'Less than $0.50 per resource • One-time payment'
    };

  }

  // Update the global config so toggleDaUpgrade() uses correct values
  if (typeof daKitConfig !== 'undefined') {
    daKitConfig.kitDisplay = tier.kitDisplay;
    daKitConfig.totalDisplay = tier.totalDisplay;
    daKitConfig.kitLink = tier.kitLink;
    daKitConfig.bundleLink = tier.bundleLink;
  }

  // Update hero section prices
  var heroOld = document.getElementById('dakitHeroOld');
  var heroNew = document.getElementById('dakitHeroNew');
  var heroBadge = document.getElementById('dakitHeroBadge');
  if (heroOld) heroOld.textContent = tier.kitStrikeDisplay;
  if (heroNew) heroNew.textContent = tier.kitDisplay;
  if (heroBadge) heroBadge.textContent = tier.offLabel;

  // Update bottom CTA prices
  var ctaOld = document.getElementById('dakitCtaOld');
  var ctaNew = document.getElementById('dakitCtaNew');
  var ctaBadge = document.getElementById('dakitCtaBadge');
  if (ctaOld) ctaOld.textContent = tier.kitStrikeDisplay;
  if (ctaNew) ctaNew.textContent = tier.kitDisplay;
  if (ctaBadge) ctaBadge.textContent = tier.offLabel;

  // Update checkout modal upgrade section
  var upgradeStrike = document.getElementById('dakitUpgradeStrike');
  var upgradePrice = document.getElementById('dakitUpgradePrice');
  var upgradeDesc = document.getElementById('dakitUpgradeDesc');
  if (upgradeStrike) upgradeStrike.textContent = tier.upgradeStrikeDisplay;
  if (upgradePrice) upgradePrice.textContent = tier.upgradeDisplay;
  if (upgradeDesc) upgradeDesc.innerHTML = tier.upgradeDescHTML;

  // Update checkout pay button and link
  var payPrice = document.getElementById('daPayPrice');
  if (payPrice) payPrice.textContent = tier.kitDisplay;

  // Reset the payment link
  if (typeof daPayLink !== 'undefined') {
    daPayLink = tier.kitLink;
  }

  // Reset upgrade checkbox state
  var cb = document.getElementById('daUpgradeCheck');
  if (cb) cb.checked = false;
  var card = document.getElementById('daUpgradeCard');
  if (card) card.classList.remove('active');

  // Update Course Bundles card (Home page)
  var bundlePrice = document.getElementById('bundleDaPrice');
  var bundleStrike = document.getElementById('bundleDaStrike');
  var bundleBadge = document.getElementById('bundleDaBadge');
  if (bundlePrice) bundlePrice.textContent = tier.kitDisplay;
  if (bundleStrike) bundleStrike.textContent = tier.kitStrikeDisplay;
  if (bundleBadge) bundleBadge.textContent = tier.offLabel;

  // Complete Kit: update its home card, detail page, and checkout buttons.
  var completeCardButton = document.querySelector('.course-bundle-card button[onclick*="data-analyst-complete"]');
  var completeCard = completeCardButton && completeCardButton.closest('.course-bundle-card');
  if (completeCard) {
    var completeCardPrice = completeCard.querySelector('.bundle-price-large');
    var completeCardStrike = completeCard.querySelector('.bundle-price-strike');
    var completeCardBadge = completeCard.querySelector('.bundle-discount-badge');
    if (completeCardPrice) completeCardPrice.textContent = tier.bundleCardPrice;
    if (completeCardStrike) completeCardStrike.textContent = tier.bundleCardStrike;
    if (completeCardBadge) completeCardBadge.textContent = tier.bundleCardOff;
  }

  var completeRoot = document.getElementById('course-data-analyst-complete');
  if (completeRoot) {
    completeRoot.querySelectorAll('.dakit-hero-pricing-new, .cta-price, .dakit-cta-pricing strong, .dakit-sticky-price strong')
      .forEach(el => el.textContent = tier.bundleCardPrice);
    completeRoot.querySelectorAll('.dakit-hero-pricing-old, .dakit-cta-pricing del, .dakit-sticky-price del')
      .forEach(el => el.textContent = tier.bundleCardStrike);
    completeRoot.querySelectorAll('.dakit-hero-pricing-badge, .dakit-off-badge, .sticky-off')
      .forEach(el => el.textContent = tier.bundleCardOff);
    completeRoot.querySelectorAll('.da-per-resource-value')
      .forEach(el => el.textContent = tier.perResourceDisplay);
    completeRoot.querySelectorAll('button[onclick*="rzp.io"]')
      .forEach(button => button.setAttribute('onclick', 'openDaCompleteCheckout()'));
  }

  window.openDaCompleteCheckout = function() {
    window.open(tier.bundleLink, '_blank');
  };

  // The Interview Kit hero and sticky CTA prices do not have individual IDs.
  var interviewRoot = document.getElementById('course-data-analyst');
  if (interviewRoot) {
    interviewRoot.querySelectorAll('.cta-price, .dakit-sticky-price strong')
      .forEach(el => el.textContent = tier.kitDisplay);
    interviewRoot.querySelectorAll('.dakit-sticky-price del')
      .forEach(el => el.textContent = tier.kitStrikeDisplay);
    interviewRoot.querySelectorAll('.dakit-sticky-price .sticky-off')
      .forEach(el => el.textContent = tier.offLabel);
  }

  if (typeof SEARCH_INDEX !== 'undefined') {
    var interviewSearchItem = SEARCH_INDEX.find(item => item.name === 'Data & BI Analyst Interview Kit');
    if (interviewSearchItem) interviewSearchItem.price = tier.kitDisplay;
  }

}

function closeDaCurriculumPreview() {
  const modal = document.getElementById('daCurriculumPreviewModal');
  if (modal) modal.remove();
  document.documentElement.classList.remove('curriculum-modal-open');
  document.body.classList.remove('curriculum-modal-open');
  document.body.style.overflow = '';
}

function lockCurriculumBackground() {
  document.documentElement.classList.add('curriculum-modal-open');
  document.body.classList.add('curriculum-modal-open');
  document.body.style.overflow = 'hidden';
}

function openDaCurriculumPreview(pdfUrl, title) {
  closeDaCurriculumPreview();
  const modal = document.createElement('div');
  modal.id = 'daCurriculumPreviewModal';
  modal.className = 'da-curriculum-modal';
  modal.innerHTML = `
    <div class="da-curriculum-modal-dialog" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="da-curriculum-modal-header">
        <div><strong>${title}</strong><span>Review the curriculum without leaving this page.</span></div>
        <button type="button" aria-label="Close curriculum preview" onclick="closeDaCurriculumPreview()">&times;</button>
      </div>
      <iframe src="${pdfUrl}#toolbar=0" title="${title}"></iframe>
      <div class="da-curriculum-modal-footer">
        <a href="${pdfUrl}" download>Download Curriculum</a>
        <button type="button" onclick="closeDaCurriculumPreview(); document.querySelector('#course-data-analyst-complete .dakit-hero-cta')?.click();">Get All 24 Resources</button>
      </div>
    </div>`;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeDaCurriculumPreview();
  });
  document.body.appendChild(modal);
  lockCurriculumBackground();
}

const mathStatsCurriculum = [
  ['Descriptive Statistics', 'Summarizing & Describing Data', ['Mean, Median & Mode', 'Trimmed & Winsorized Mean', 'Measures of Spread: Range & Interquartile Range', 'Variance & Standard Deviation', 'Skewness & Kurtosis', 'Percentiles, Quartiles & Deciles', 'Z-scores & Standardisation', 'Histograms & Box Plots', 'Frequency & Contingency Tables', 'QQ Plots & Shape Visualisation']],
  ['Probability Foundations', '', ['Sample Spaces & Events', 'Classical, Empirical & Subjective Probability', 'Kolmogorov Axioms', 'Addition & Multiplication Rules', 'Conditional Probability P(A|B)', 'Law of Total Probability', 'Permutations & Combinations', 'Probability Trees & Venn Diagrams', 'Expected Value E(X) & Variance Var(X)', 'Moment Generating Functions']],
  ['Probability Distributions', '', ['Bernoulli & Binomial Distributions', 'Poisson & Geometric Distributions', 'Negative Binomial & Hypergeometric Distributions', 'Uniform & Exponential Distributions', 'Gamma, Beta & Log-Normal Distributions', "Student's t-Distribution", 'Chi-Square & F-Distribution', 'Distribution Relationships', 'Distribution Selection Framework', 'Fitting & Mixture Distributions']],
  ['Normal Distribution', '', ['Definition & Parameters (μ, σ)', 'Standard Normal Distribution Z~N(0,1)', 'Empirical Rule (68-95-99.7)', 'Normal PDF & CDF', 'Z-score Interpretation', 'Finding Areas Under the Curve', 'Inverse Normal (Quantile Function)', 'QQ Plots & Shapiro-Wilk Test', 'Bivariate & Multivariate Normal Distribution', 'Transformations to Achieve Normality']],
  ['Central Limit Theorem', '', ['Law of Large Numbers (Weak & Strong)', 'Sampling Distributions', 'Standard Error (SE)', 'Bias-Variance of Estimators', 'CLT Formal Statement', 'Proof Intuition via MGFs', 'Berry-Esseen Theorem', 'CLT for Proportions', 'CLT in Practice — Required Sample Size', 'Finite Population Correction & Delta Method']],
  ['Hypothesis Testing', '', ['Null & Alternative Hypotheses (H₀, H₁)', 'Type I Error (α) — False Positive', 'Type II Error (β) — False Negative', 'Power (1−β) & p-value', 'One-Sample z-test & t-test', 'Independent & Paired Samples t-test', 'Chi-Square Goodness of Fit & Independence', "Cohen’s d & Effect Size", 'Sample Size Calculation', 'Bonferroni Correction & FDR']],
  ['Confidence Intervals', '', ['Point vs Interval Estimation', 'Correct Interpretation of CIs', 'Margin of Error', 'CI for Population Mean (z-interval)', 'CI for Population Mean (t-interval)', 'CI for Proportion', 'CI for Variance (Chi-Square)', 'CI for Difference of Two Means', 'Bootstrap Confidence Intervals', 'Bayesian Credible Intervals']],
  ['A/B Testing', '', ['Randomised Controlled Experiments', 'Control vs Treatment Groups & Randomisation Unit', 'Minimum Detectable Effect (MDE)', 'Sample Size Calculation & Experiment Duration', 'Statistical Significance in A/B Tests', 'The Peeking Problem', 'Sequential Testing & Always-Valid p-values', 'Network Effects & Interference', 'Multi-Armed Bandit Algorithms', 'Bayesian A/B Testing & Multivariate Testing']],
  ['Correlation & Regression', '', ['Pearson, Spearman & Kendall Correlation', 'Partial Correlation & Correlation vs Causation', 'OLS — Ordinary Least Squares', 'R-squared & Adjusted R-squared', 'Residual Analysis & Influential Points', 'Multiple Linear Regression', 'Multicollinearity & VIF', 'Regularisation — Ridge & Lasso', 'Logistic Regression', 'Model Evaluation Metrics']],
  ['Bayes Theorem Basics', '', ["Bayes’ Formula Derivation", 'Prior, Likelihood & Posterior', 'Bayesian Updating', 'Bayes vs Frequentist Paradigm', 'Beta-Binomial & Gamma-Poisson Conjugacy', 'Normal-Normal Conjugacy', 'Non-Conjugate Priors & MCMC', 'Naive Bayes Classifier', 'Bayesian Hypothesis Testing', 'Credible Intervals vs Confidence Intervals']],
  ['Analysis of Variance (ANOVA)', '', ['One-Way ANOVA', 'F-Statistic & F-Distribution', 'Assumptions of ANOVA', 'Post-Hoc Tests (Tukey & Bonferroni)', 'Two-Way ANOVA', 'Interaction Effects', 'Repeated Measures ANOVA', 'ANCOVA — Analysis of Covariance', 'Non-Parametric Alternatives (Kruskal-Wallis)', 'ANOVA in Python']],
  ['Time Series Statistics', '', ['Time Series Components (Trend, Seasonality, Noise)', 'Stationarity & Differencing', 'Autocorrelation (ACF) & Partial Autocorrelation (PACF)', 'Moving Averages & Smoothing', 'AR, MA & ARMA Models', 'ARIMA & Seasonal ARIMA (SARIMA)', 'Augmented Dickey-Fuller Test', 'Exponential Smoothing (Holt-Winters)', 'Forecasting Accuracy Metrics', 'Time Series in Python']]
];

const excelSheetsCurriculum = [
  ['The Foundation', 'Data Cleaning & Validation', ['Text functions: TRIM, CLEAN, PROPER, LEN', 'Extracting with LEFT, RIGHT, MID, FIND', 'SUBSTITUTE & REPLACE for text fixes', 'Flash Fill for pattern-based extraction', 'Finding & removing duplicate records', 'Data validation: dropdowns, date & number rules', 'IFERROR, IFNA & ISERROR for error handling', 'Standardizing date & number formats', 'Auditing tools: trace precedents & dependents', 'Basic math & descriptive stats: SUM, AVERAGE, COUNT']],
  ['Connecting Data', 'VLOOKUP, XLOOKUP, INDEX-MATCH', ['VLOOKUP syntax: exact vs approximate match', 'Troubleshooting #N/A & #REF errors', 'INDEX-MATCH: why it beats VLOOKUP', 'XLOOKUP: spill results & multiple columns', 'Two-way lookup with nested MATCH', 'Wildcard lookups with * and ?', 'Lookup across multiple sheets / workbooks', 'HLOOKUP & horizontal lookups', 'Handling missing values in lookups', 'Modern best practice: Why XLOOKUP is the new standard']],
  ['Summarizing at Scale', 'Pivot Tables & Charts', ['Building your first pivot table', 'Row, column, value & filter fields', 'Grouping dates (months/quarters), numbers & text', 'Calculated fields & items', 'Slicers & timelines for interactivity', 'Pivot charts & chart type selection', 'GETPIVOTDATA function', 'Refresh strategies & data source changes', 'Pivot table layouts: Compact vs Tabular', 'Top 10 filters inside Pivots']],
  ['Modern Logic', 'Dynamic Arrays & SUMPRODUCT', ['Understanding "Spill" logic in modern Excel', 'Dynamic arrays: FILTER, SORT, UNIQUE', 'SEQUENCE & RANDARRAY functions', 'SUMPRODUCT for multi-criteria aggregation', 'SUMIFS vs SUMPRODUCT compared', 'BYROW, BYCOL, MAP, REDUCE (The Lambda functions)', 'The # operator for spill ranges', 'LET and LAMBDA for creating custom formulas', 'CHOOSECOLS and CHOOSEROWS', 'Legacy arrays vs Dynamic arrays']],
  ['The Engine', 'Power Query / ETL', ['Power Query editor walkthrough', 'Importing: CSV, Excel, web & databases', 'Data type detection & transformation', 'Filtering, sorting & grouping rows', 'Merge queries (joins) & append queries (stacking)', 'Unpivoting columns (converting wide data to tall)', 'Custom & conditional columns', 'M language basics for advanced transforms', 'Query refresh & dependency management', 'Parameters in Power Query']],
  ['Visual Communication', 'Conditional Formatting', ['Highlight cell rules (greater than, duplicates)', 'Data bars & color scales', 'Icon sets for KPI indicators', 'Custom formula-based rules (The "secret sauce")', 'Cross-column conditional formatting', 'Heat maps for correlation matrices', 'Managing & prioritizing rule order', 'Using formatting to find data entry errors', 'Dynamic formatting based on Slicer selection', 'Checkboxes and conditional formatting logic']],
  ['Deep Analytics', 'Statistical Functions', ['Descriptive stats: MEDIAN, MODE, STDEV', 'Population vs Sample variance', 'PERCENTILE, QUARTILE & IQR calculation', 'CORREL & COVAR for correlation analysis', 'Linear regression with LINEST', 'SLOPE, INTERCEPT & R-squared', 'FORECAST.ETS for time-series prediction', 'Data Analysis ToolPak: ANOVA, t-Test, Histogram', 'Weighted averages using SUMPRODUCT', 'Probability distributions (NORM.DIST)']],
  ['Output & UX', 'Dashboard Design', ['Dashboard layout & UX principles', 'Dynamic named ranges for live charts', 'KPI cards with conditional formatting', 'Sparklines for inline trend visualization', 'Linking charts & slicers dynamically', 'Form controls: dropdowns, scroll bars, buttons', 'Camera tool & linked picture technique', 'Protecting sheets & locking dashboard cells', 'Print setup & PDF export', 'Color theory for professional reports']],
  ['Google Sheets Specialization', '', ['QUERY function: SQL-style data queries in Sheets', 'IMPORTRANGE & cross-sheet connections', 'ARRAYFORMULA for auto-expanding formulas', 'Collaboration, sharing & version history', 'GOOGLEFINANCE for live market data', 'SPARKLINE function (more powerful in Sheets)', 'FILTER and SORT differences vs Excel', 'Google Apps Script: JavaScript-based automation', 'Custom functions for Sheets', 'Looker Studio integration for live dashboards']],
  ['High-Level Automation', 'Excel VBA', ['Recording & running macros', 'VBA editor (Alt+F11) overview', 'Sub procedures vs Functions', 'Variables, data types & scope', 'Loops: For, For Each, Do While', 'Working with Range, Cells & Sheets objects', 'If-Else and Select Case logic', 'Event-driven macros (Worksheet_Change)', 'Debugging: breakpoints & watch window', 'Saving as .xlsm macro-enabled workbook']]
];

const curriculumUnit = (title, subtitle, topics) => [title, subtitle, topics.split('|')];

const sqlCurriculum = [
  curriculumUnit('The Core Foundation', 'SELECT, WHERE, ORDER BY', 'Basic SELECT syntax: columns & aliases|SELECT DISTINCT to remove duplicates|Filtering rows with WHERE clause|Comparison operators: =, <>, >, <, >=, <=|Logical operators: AND, OR, NOT|BETWEEN, IN, and NOT IN filters|Wildcard filtering with LIKE (%, _)|Sorting results with ORDER BY (ASC / DESC)|Limiting results: LIMIT, TOP, FETCH NEXT|Column aliasing with AS'),
  curriculumUnit('Reality Check', 'NULL Handling & Type Casting', 'What NULL means: unknown vs empty|IS NULL and IS NOT NULL filters|COALESCE to replace NULLs with defaults|NULLIF to convert a value into NULL|CAST and CONVERT for explicit type conversion|TRY_CAST and TRY_CONVERT for safe conversions|Implicit vs explicit type casting pitfalls|ISNULL and NVL: dialect-specific alternatives|NULLs in math: what happens when you add 5 to NULL?|Handling NULLs in logical conditions'),
  curriculumUnit('Summarizing Data', 'GROUP BY & Aggregations', 'Aggregate functions: SUM, COUNT, AVG, MIN, MAX|GROUP BY syntax and how it works|Filtering grouped results with HAVING|WHERE vs HAVING: key differences|COUNT(*) vs COUNT(column) vs COUNT(DISTINCT)|Grouping by multiple columns|ROLLUP for subtotals & grand totals|CUBE for multi-dimensional aggregations|GROUPING SETS for custom aggregation levels|NULLs in aggregate functions: what gets ignored?'),
  curriculumUnit('Combining Data Horizontally', 'JOINs', 'Understanding relational JOIN logic|INNER JOIN: matching rows only|LEFT JOIN: all left rows + matched right rows|RIGHT JOIN: all right rows + matched left rows|FULL OUTER JOIN: all rows from both tables|CROSS JOIN: cartesian product use cases|SELF JOIN: joining a table to itself|Joining on multiple conditions|Joining more than two tables|Common JOIN mistakes & NULLs in results'),
  curriculumUnit('Combining Data Vertically', 'Set Operations', 'What are set operations and when to use them|UNION to combine results from two queries|UNION vs UNION ALL: duplicates & performance|INTERSECT to find common rows between queries|EXCEPT / MINUS to find rows in one but not another|Column count & data type rules for set operations|Ordering results from set operations|Using set operations vs JOINs: when each fits|Stacking multiple result sets for reporting|Real-world use case: comparing daily snapshots'),
  curriculumUnit('Advanced Logic', 'Subqueries & CTEs', 'What is a subquery and where to use it|Subqueries in SELECT (scalar subqueries)|Subqueries in WHERE (filtering with results)|Subqueries in FROM (derived tables)|Correlated vs non-correlated subqueries|EXISTS and NOT EXISTS operators|CTE syntax with the WITH clause|Multiple CTEs in a single query|Recursive CTEs for hierarchical data|CTEs vs subqueries: readability & performance'),
  curriculumUnit('Professional Analysis', 'Window Functions', 'What are window functions and OVER clause|PARTITION BY to define window groups|ORDER BY inside OVER for row ordering|ROW_NUMBER for unique sequential ranking|RANK and DENSE_RANK: handling ties|NTILE for bucketing rows into groups|LAG to access previous row values|LEAD to access next row values|FIRST_VALUE and LAST_VALUE in a window|Running totals & moving averages (ROWS BETWEEN)'),
  curriculumUnit('Custom Logic & Cleaning', 'CASE, Dates, Strings', 'CASE WHEN syntax (Simple vs Searched)|CASE WHEN inside aggregates (Pivot logic)|Date data types and current date functions|EXTRACT, DATEDIFF, and DATE_TRUNC|String manipulation: CONCAT, SUBSTRING, TRIM|String searching: CHARINDEX, LIKE, REGEX|Splitting and replacing strings|Building dynamic labels and categories|Handling time zones in analytics|Formatting data for final reports'),
  curriculumUnit('Performance & Scale', 'Optimization & Cloud', 'How indexes work (Clustered vs Non-clustered)|Reading execution plans (EXPLAIN ANALYZE)|Identifying full table scans vs index seeks|SARGable vs non-SARGable conditions|BigQuery & Redshift architecture|Partitioned & clustered tables in the cloud|Cost management: bytes billed & dry runs|Distribution keys and sort keys|Loading data: GCS/S3 to Cloud SQL|Scheduled queries & materialized views'),
  curriculumUnit('Building Systems', 'Procedures, Views & Design', 'Creating, replacing & dropping Views|Materialized views and refresh strategies|Stored procedure syntax and structure|Input/Output parameters and variables|Transactions: COMMIT and ROLLBACK|Normalization (1NF, 2NF, 3NF)|Denormalization for analytics performance|Star schema: fact & dimension tables|Entity-Relationship (ER) diagrams|Choosing data types for storage efficiency')
];

const pythonCurriculum = [
  curriculumUnit('Python Fundamentals for Analytics', '', 'Variables, Constants, and PEP 8 Naming Conventions|Primitive Data Types: String, Integer, Float, Boolean|String Manipulation: f-strings, .strip(), .split(), .replace()|Type Casting and Checking (type(), isinstance())|Mathematical Operators & Order of Operations|Logical Operators (and, or, not) and Membership (in)|Conditional Logic: if, elif, else|Comparison Operators for Data Filtering'),
  curriculumUnit('Data Structures & Iteration', 'The Logic', 'Lists: Slicing, appending, and list methods|Dictionaries: Key-value pairs for JSON-like data|Sets & Tuples: Unique values and immutability|For Loops: Iterating through lists and dictionaries|While Loops: Logic-based iteration|List Comprehensions: Writing "Pythonic" one-liners for data transformation|Dictionary Comprehensions: Transforming mapping data|Nested structures: Lists of dictionaries (the standard API format)'),
  curriculumUnit('Functions & Error Handling', '', 'Defining Functions: def, arguments, and return|Positional vs. Keyword arguments|Lambda Functions: Anonymous functions for quick data mapping|Scope: Local vs. Global variables|Error Handling: try, except, finally to prevent script crashes|Importing modules (import math, import os)|Understanding __name__ == "__main__"|Documentation: Writing Docstrings for collaborative code'),
  curriculumUnit('NumPy', 'The Foundation of Data', "The ndarray: Why it's faster than Python lists|Array creation: np.array(), np.zeros(), np.arange(), np.linspace()|Vectorization: Performing math on entire columns without loops|Broadcasting: How NumPy handles different array shapes|Universal Functions (ufuncs): np.exp(), np.sqrt(), np.log()|Slicing and Masking: Filtering data using Boolean arrays|Aggregations: np.sum(), np.mean(), np.std(), np.median()|Reshaping and Transposing data"),
  curriculumUnit('pandas', 'Core DataFrame Operations', 'Series vs. DataFrames: The 1D and 2D structures|Data I/O: Reading and writing CSV, Excel, and JSON|Inspection: .head(), .info(), .describe(), .shape|Indexing: Selecting data with .loc (labels) and .iloc (positions)|Conditional Filtering: Selecting rows based on multiple criteria|Column Operations: Renaming, dropping, and creating new features|Sorting: .sort_values() and .sort_index()|Setting and Resetting Indexes'),
  curriculumUnit('pandas', 'Advanced Wrangling', "Merging: pd.merge() (Inner, Left, Right, Outer joins)|Concatenation: pd.concat() (Stacking data vertically or horizontally)|Groupby: Split-Apply-Combine logic|Aggregation: .agg(['mean', 'sum', 'count'])|Pivot Tables and Cross-tabulations (pd.pivot_table())|Transform & Filter: Advanced Groupby operations|Multi-indexing: Handling complex, hierarchical data|Apply: Using custom functions on rows/columns with .apply() and .map()"),
  curriculumUnit('The Data Cleaning Protocol', '', 'Identifying and handling Missing Data: .isnull(), .dropna(), .fillna()|Imputation strategies: Mean, Median, and Mode vs. Forward-fill|Data Type Conversion: .astype() and pd.to_datetime()|Handling Duplicates: .duplicated() and .drop_duplicates()|String Cleaning in DataFrames: .str accessor methods|Outlier Detection: Z-score and IQR (Interquartile Range) methods|Regex for Data Cleaning: Using re module to fix messy patterns|Standardizing units and category labels'),
  curriculumUnit('Data Collection', 'APIs & Scraping', 'The requests library: GET and POST requests|JSON Parsing: Converting API responses into DataFrames|Authentication: Working with API Keys and Headers|Web Scraping Basics: Introduction to BeautifulSoup|Inspecting HTML: Tags, Classes, and IDs|Scraping tables and lists into pandas|Handling Pagination: Scraping across multiple pages|Ethical Scraping: robots.txt and rate limiting'),
  curriculumUnit('Static Visualization', 'Matplotlib & Seaborn', 'The Object-Oriented Interface: fig, ax = plt.subplots()|Customizing Plots: Titles, Labels, Legends, and Colors|Basic Plots: Line, Bar, Scatter, and Pie|Statistical Viz (Seaborn): sns.histplot, sns.kdeplot, sns.boxplot|Categorical Viz: sns.violinplot, sns.stripplot, sns.countplot|Regression Plots: sns.regplot and sns.lmplot|Relationship Grids: sns.pairplot and sns.heatmap|Visualization Best Practices: Data-ink ratio and choosing the right chart'),
  curriculumUnit('Interactive Viz & Dashboards', 'Plotly & Streamlit', 'Interactive Scatter and Line plots with Plotly Express|Adding Interactivity: Hover data, Sliders, and Buttons|Geographic Maps: Choropleths and Scatter Geo|Streamlit Fundamentals: st.write(), st.sidebar, st.columns|Input Widgets: Selectboxes, Sliders, and File Uploaders|Integrating pandas with Streamlit for live filtering|Displaying charts and DataFrames in a web app|Deploying a Python Dashboard to the Cloud'),
  curriculumUnit('Exploratory Data Analysis', 'EDA & Stats', 'Descriptive Statistics: Central tendency and dispersion|Skewness and Kurtosis: Understanding distribution shapes|Correlation: Pearson vs. Spearman coefficients|Hypothesis Testing: Null vs. Alternative hypothesis|T-Tests: One-sample, Independent, and Paired|ANOVA: Comparing means across three or more groups|Chi-Square Test for Independence (Categorical data)|P-values and Significance levels (α = 0.05)'),
  curriculumUnit('Predictive Modeling', 'Regression', 'Introduction to Scikit-Learn: The fit-predict API|Simple Linear Regression: OLS (Ordinary Least Squares)|Multiple Linear Regression: Handling multiple features|Assumptions of Linear Regression (Normality, Homoscedasticity)|Logistic Regression: Sigmoid function and binary classification|Model Evaluation (Regression): R², MAE, MSE, RMSE|Model Evaluation (Classification): Confusion Matrix, Precision, Recall, F1-Score|Train-Test Split and Cross-Validation'),
  curriculumUnit('Time Series Analysis', '', "Handling Datetime objects: pd.to_datetime() and .dt accessor|Resampling and Frequency Conversion (.resample('M'), .asfreq())|Window Functions: Rolling means and Expanding windows|Time Shifting: .shift() and .diff() for growth rates|Seasonality and Trend decomposition|Handling Time Zones and Daylight Savings|Visualizing Time Series: Seasonal subseries plots|Basic Forecasting: Autocorrelation (ACF) and Moving Averages"),
  curriculumUnit('Unsupervised Learning', 'Clustering', 'Introduction to Unsupervised Learning vs. Supervised|K-Means Clustering: How the algorithm works|Choosing K: The Elbow Method and Silhouette Score|Data Scaling: Why StandardScaler is required for clustering|Principal Component Analysis (PCA) for Dimensionality Reduction|Interpreting Cluster Centroids and Labels|Hierarchical Clustering (Dendrograms)|Real-world Case Study: Customer Segmentation')
];

const biCurriculum = [
  curriculumUnit('Dashboard Design & UX Strategy', '', 'Defining KPIs: Lead vs. Lag indicators|The 5-Second Rule: Information hierarchy in layouts|Visual Perception: Gestalt principles (Proximity, Similarity, Enclosure)|Color Theory: Using color for emphasis, not decoration|Choosing the Right Chart: Comparison vs. Composition vs. Trend|User Stories: Defining “Who” the dashboard is for|Interactivity Design: Drill-downs vs. Tooltips vs. Page Navigation|Handling “Request Bloat”: How to say no to unnecessary charts'),
  curriculumUnit('BI Data Modeling', 'The Star Schema', 'Relational Modeling for BI: Fact tables vs. Dimension tables|Star Schema vs. Snowflake Schema: Why Star is king for BI|Primary Keys and Foreign Keys in a BI context|Cardinality: One-to-Many vs. Many-to-Many relationships|Normalization vs. Denormalization for performance|Handling Slowly Changing Dimensions (SCD Type 1 and Type 2)|Designing a “Date Table” (The backbone of all time-analysis)|ISNULL and NVL: dialect-specific alternatives|NULLs in math: what happens when you add 5 to NULL?|Handling NULLs in logical conditions'),
  curriculumUnit('Power BI Desktop Fundamentals', 'Track A: Power BI', 'Get Data: Connecting to SQL, Excel, and Web|Power Query (M Language) for BI-specific cleaning|Building the Relationship View: Active vs. Inactive relationships|Creating basic visuals: Cards, Tables, and Matrixes|Slicers and Syncing Slicers across pages|Using the “Selection Pane” for conditional layouts|Custom Visuals from the AppSource marketplace|CUBE for multi-dimensional aggregations|GROUPING SETS for custom aggregation levels|NULLs in aggregate functions: what gets ignored?'),
  curriculumUnit('DAX', 'Data Analysis Expressions', 'Calculated Columns vs. Measures: When to use which|The “Golden Rule”: Row Context vs. Filter Context|CALCULATE(): The most powerful function in Power BI|Time Intelligence: SAMEPERIODLASTYEAR, YTD, MTD|Iterator Functions: SUMX, AVERAGEX, RANKX|Variables (VAR) for readability and performance|DAX Studio for debugging and optimization|Joining on multiple conditions|Joining more than two tables|Common JOIN mistakes & NULLs in results'),
  curriculumUnit('Power BI Service & Governance', 'Track A: Power BI', 'Publishing Workspaces: My Workspace vs. Pro Workspaces|Gateway Configuration: Setting up automatic data refreshes|Creating Power BI “Apps” for end-users|Row-Level Security (RLS): Static vs. Dynamic|Creating Dashboards vs. Reports (The technical difference)|Usage Metrics: Seeing who actually uses your reports|Ordering results from set operations|Using set operations vs JOINs: when each fits|Stacking multiple result sets for reporting|Real-world use case: comparing daily snapshots'),
  curriculumUnit('Tableau Basics & Data Architecture', 'Track B: Tableau', 'Connecting to data: Live vs. Extract (Performance trade-offs)|Blue Pills vs. Green Pills: Dimensions vs. Measures|Discrete vs. Continuous data logic|Building the “Worksheet”: Marks Card, Shelves, and Pages|The “Order of Operations” in Tableau (The Filter Pipeline)|Groups, Sets, and Bins|CTE syntax with the WITH clause|Multiple CTEs in a single query|Recursive CTEs for hierarchical data|CTEs vs subqueries: readability & performance'),
  curriculumUnit('Advanced Tableau', 'LODs & Interactivity', 'Calculated Fields: String, Date, and Logic functions|LOD Expressions: FIXED, INCLUDE, EXCLUDE|Parameters: Creating “What-if” scenarios and dynamic toggles|Dashboard Actions: Filter, Highlight, and URL actions|Map Layers and Spatial Analysis|Device Designer: Making dashboards for Mobile vs. Desktop|Tableau Public vs. Tableau Cloud deployment|LEAD to access next row values|FIRST_VALUE and LAST_VALUE in a window|Running totals & moving averages (ROWS BETWEEN)'),
  curriculumUnit('Looker Studio', 'Track C: Lightweight / Marketing BI', 'Native Google Connectors: Sheets, Ads, GA4, BigQuery|Data Blending: Joining sources without a warehouse|Calculated Fields in Looker Studio|Building Interactive Controls (Dropdowns, Date ranges)|Report Sharing and Automated Email Scheduling|String searching: CHARINDEX, LIKE, REGEX|Splitting and replacing strings|Building dynamic labels and categories|Handling time zones in analytics|Formatting data for final reports'),
  curriculumUnit('Looker & LookML', 'Modern Enterprise BI', 'Looker’s unique architecture: Why it’s “Code-First”|LookML Basics: Dimensions, Measures, and Views|The Model File: Scoping explores and joins|Version Control: Using Git with Looker|Liquid Parameters for dynamic SQL generation|Persistent Derived Tables (PDTs) for performance|Cost management: bytes billed & dry runs|Distribution keys and sort keys|Loading data: GCS/S3 to Cloud SQL|Scheduled queries & materialized views'),
  curriculumUnit('KPI Tracking & The Metrics Layer', '', 'Building a “Data Dictionary” for stakeholders|Metric Consistency: Ensuring “Revenue” means the same thing everywhere|Alerting: Setting up “Threshold Alerts” for business owners|User Acceptance Testing (UAT): How to verify data with users|Maintenance: Handling “Schema Drift” when source data changes|Normalization (1NF, 2NF, 3NF)|Denormalization for analytics performance|Star schema: fact & dimension tables|Entity-Relationship (ER) diagrams|Choosing data types for storage efficiency')
];

const dataEngineeringCurriculum = [
  curriculumUnit('Data Integration', 'ELT & ETL', 'ETL vs. ELT: Why modern cloud stacks prefer Extract-Load-Transform|Batch vs. Real-time processing: When to use which|Change Data Capture (CDC): How databases sync only new/updated rows|Managed Connectors: Using Fivetran, Airbyte, or Stitch to automate ingestion|API Ingestion: Understanding how data is pulled from SaaS tools (Salesforce, Zendesk)|File-based Ingestion: Handling CSV, Parquet, and Avro files'),
  curriculumUnit('Storage Architecture', 'Lakes, Warehouses & Lakehouses', 'Data Warehouse: Structured storage for BI (BigQuery, Snowflake)|Data Lake: Unstructured storage for raw data (AWS S3, Google Cloud Storage)|The Data Lakehouse: The “best of both worlds” (Databricks, Iceberg)|Object Storage vs. Block Storage: Understanding S3/GCS buckets|Storage Formats: Row-based (CSV) vs. Columnar (Parquet) performance'),
  curriculumUnit('Cloud Data Warehousing', 'The Big Four', 'Google BigQuery: Serverless architecture and “Querying the Web”|Snowflake: Separation of Storage and Compute; Data Sharing features|AWS S3 + Athena: “Query-on-the-fly” logic for data lakes|Azure Synapse: Integrating Power BI with Enterprise DW|Cost Management: Understanding “Slot” usage, “Compute Credits,” and “Scan costs”'),
  curriculumUnit('Analytics Engineering with dbt', 'Data Build Tool', 'The dbt Workflow: Developing, Testing, and Documenting|Models & Modular SQL: Breaking complex queries into smaller, reusable pieces|Materializations: Views vs. Tables vs. Incremental models|Version Control: Basics of Git (Commit, Push, Pull Request) for analysts|Jinja & Macros: Using Python-like logic inside SQL to automate code|Lineage: Understanding how data flows from Raw to Product tables'),
  curriculumUnit('Orchestration & Automation', 'Airflow', 'The DAG (Directed Acyclic Graph): Understanding pipeline dependencies|Scheduling: Cron jobs and interval-based triggers|Task Failures & Retries: How pipelines recover from errors|Operators & Sensors: Logic for waiting for a file to arrive before running SQL|Airflow vs. dbt Cloud: Choosing the right tool for automation'),
  curriculumUnit('Schema Design & Data Modeling', '', 'Star Schema: Fact tables and Dimension tables|Slowly Changing Dimensions (SCD)|Denormalization: Why cloud warehouses prefer wide tables over complex joins|Surrogate Keys: Generating unique IDs for warehouse records|Partitioning & Clustering: How to organize tables to save money on queries'),
  curriculumUnit('Data Quality, Reliability & Observability', '', 'Data Validation: Using dbt tests for Uniqueness and Not-Null constraints|Freshness Alerts: Detecting when data hasn’t been updated in 24 hours|Schema Evolution: What happens when a source column name changes?|Anomalies: Detecting sudden spikes or drops in record counts|Data Documentation: Maintaining a Data Dictionary for the business'),
  curriculumUnit('Advanced Data Patterns', 'Streaming & Privacy', 'Streaming Basics: Kafka and Pub/Sub (Real-time events)|Lambda vs. Kappa Architecture: Handling both historical and live data|Data Privacy (GDPR/CCPA): Masking PII (Personally Identifiable Information)|Data Access Control: Administering roles and permissions in the warehouse')
];

const storytellingCurriculum = [
  curriculumUnit('Problem Framing & The Art of the Question', '', 'The “5 Whys” Technique: Digging past the surface request to find the true business pain|Converting Business Problems into Data|Defining Success Metrics: Setting clear KPIs before the analysis begins|Stakeholder Interviewing: How to run a discovery session|Identifying Constraints: Data availability, time sensitivity, and budget'),
  curriculumUnit('Narrative Design', 'The Story Arc', 'The ABT Framework: “And, But, Therefore” for quick data summaries|The SCQA Framework: Situation, Complication, Question, Answer|Choosing the Protagonist: Is the “Hero” the customer, the product, or the company?|Managing the “Climax”: Leading the audience toward the most important insight|The “Actionable Ending”: Ensuring every story ends with a clear “Next Step”'),
  curriculumUnit('Visual Communication & Slide Design', '', 'Preattentive Attributes: Using color, size, and orientation to guide the eye|Eliminating “Chart Junk”: Maximizing the data-to-ink ratio|The “Blink Test”: Can a stakeholder understand the slide in 5 seconds?|Effective Annotation: Using callouts and titles to tell the user what to think|Executive Slide Layouts: The “Z-Pattern” and “F-Pattern” of reading|Choosing “Insight over Information”: When to use a table vs. a chart'),
  curriculumUnit('Stakeholder Management & Oral Delivery', '', 'Translating Tech-to-English: Explaining P-values or Co-efficients to a Marketing Manager|Handling “Bad News”: How to present data that shows a project failed|Managing The Q&A: What to do when you don’t know the answer|Adapting to the Audience: Presenting to C-Suite vs. Peer Analysts|The “Executive Summary” Pitch: Delivering a 2-minute “Elevator Version” of your 40-page report'),
  curriculumUnit('Professional Writing & Documentation', '', 'Writing for Scannability: Bullet points, bold text, and headers|The Executive Summary: Writing the one-pager everyone actually reads|Documentation (READMEs): Explaining your methodology so other analysts can reproduce it|Data Ethics & Transparency: Disclosing data limitations and biases|Professional Slack/Email Communication: How to share a quick insight without a full deck'),
  curriculumUnit('Domain Specialization', 'Choose Your Track', 'Track A: E-Commerce & Retail|Track B: SaaS & Subscription|Track C: Marketing & Growth|Track D: FinTech & BFSI|Track E: Healthcare & BioTech')
];

const aiEraCurriculum = [
  curriculumUnit('Advanced Prompt Engineering for Analytics', '', 'The Analytical Persona: Crafting prompts that force the AI to act as a Senior Data Scientist|Chain-of-Thought (CoT) Prompting: Forcing LLMs to explain their logic step-by-step to reduce math errors|Few-Shot Learning: Providing examples of your schema and “Gold Standard” SQL to improve AI output|Delimiters & Structured Output: Getting AI to return data in specific formats (JSON, Markdown, Python dictionaries)|Iterative Debugging: How to talk back to an AI when it gives you a hallucinated column name'),
  curriculumUnit('AI-Assisted Development', 'SQL & Python', 'Copilot Mastery: Using GitHub Copilot, Cursor, or ChatGPT Canvas for real-time coding|Refactoring & Optimization: Using AI to turn “spaghetti SQL” into clean, SARGable queries|Auto-Documentation: Using AI to write dbt descriptions and Python docstrings|The “Rubber Duck” Method: Using LLMs to explain complex legacy code you inherited|Unit Testing with AI: Generating edge-case data to test if your Python functions break'),
  curriculumUnit('AI-Powered Exploratory Data Analysis', 'EDA', 'PandasAI & Sketch: Natural language interfaces for Python DataFrames|Automated Insight Discovery: Using AI to find anomalies or correlations you might have missed|Qualitative Data at Scale: Using LLMs to categorize and sentiment-tag thousands of customer reviews in seconds|Synthetic Data Generation: Creating “fake but realistic” datasets for privacy-safe testing|Visualization Suggestions: Asking AI to choose the best chart based on the data distribution'),
  curriculumUnit('The AI-Ready Semantic Layer', 'NL2SQL', 'What is a Semantic Layer?: Centralizing metrics so the AI knows exactly what “Revenue” means|Metadata Management: Naming columns and tables so an LLM can understand them|dbt Semantic Layer & Cube: Implementing a metrics layer that AI can query|Vector Databases (Basics): How RAG (Retrieval-Augmented Generation) helps AI find the right documentation|NL2SQL Interfaces: Setting up “Chat with your Data” for non-technical stakeholders'),
  curriculumUnit('AutoML & Low-Code Predictive Analytics', '', 'AutoML Overview: Using tools like PyCaret or Google Vertex AI to build models without writing the math|Feature Importance: Using AI to tell you which variables actually drive your KPIs|Automated Hyperparameter Tuning: Letting the machine find the best “settings” for your model|Model Interpretation: Using SHAP or LIME (assisted by AI) to explain why a prediction was made|From Analyst to “Citizen Data Scientist”: When to stop and hand it over to a Machine Learning Engineer'),
  curriculumUnit('AI Ethics, Trust & Governance', '', 'The Hallucination Trap: Strategies for “Verifying the Bot” (The “Always Be Checking” rule)|Data Privacy: Understanding PII (Personally Identifiable Information) and safe LLM usage|AI Bias Detection: Identifying if your AutoML model is discriminating against certain groups|Governance Frameworks: Managing “Shadow AI” (unauthorized tool usage) in the workplace|The “Human in the Loop”: Why AI provides the draft, but the Analyst provides the decision'),
  curriculumUnit('Agentic Workflows', 'The Future of the Role', 'Introduction to Agents: AI that can use tools (SQL, Python, Web Search) in a sequence|Building a Research Agent: Automating the collection of market data and competitor pricing|Multi-Step Pipelines: Setting up an AI to “Run SQL → Clean in Python → Write Slack Summary”|The Orchestration Layer: Basics of LangChain or AutoGen for data tasks|Prompt Versioning: Treating your AI prompts like code (Git for Prompts)')
];

function openStructuredCurriculum(curriculum, options) {
  closeDaCurriculumPreview();
  const units = curriculum.map((unit, unitIndex) => `
    <details class="math-curriculum-unit"${unitIndex === 0 ? ' open' : ''}>
      <summary>
        <span class="math-unit-number">${String(unitIndex + 1).padStart(2, '0')}</span>
        <span class="math-unit-heading"><strong>Unit ${unitIndex + 1}: ${unit[0]}</strong>${unit[1] ? `<small>${unit[1]}</small>` : ''}</span>
        <span class="math-topic-count">${unit[2].length} topics</span>
        <span class="math-unit-chevron" aria-hidden="true"></span>
      </summary>
      <ol class="math-topic-grid">
        ${unit[2].map((topic, topicIndex) => `<li><span>${unitIndex + 1}.${topicIndex + 1}</span>${topic}</li>`).join('')}
      </ol>
    </details>`).join('');

  const modal = document.createElement('div');
  modal.id = 'daCurriculumPreviewModal';
  modal.className = 'da-curriculum-modal math-curriculum-modal';
  modal.innerHTML = `
    <div class="da-curriculum-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="structuredCurriculumTitle">
      <div class="da-curriculum-modal-header math-curriculum-header">
        <div>
          <span class="math-curriculum-eyebrow">COMPLETE LEARNING PATH</span>
          <strong id="structuredCurriculumTitle">${options.title}</strong>
          <span>${options.meta}</span>
        </div>
        <button type="button" aria-label="Close curriculum" onclick="closeDaCurriculumPreview()">&times;</button>
      </div>
      <div class="math-curriculum-body">
        <div class="math-curriculum-intro">
          <div><strong>${options.intro}</strong><span>Open any unit to explore the topics covered inside.</span></div>
          <span class="math-curriculum-badge">${curriculum.reduce((total, unit) => total + unit[2].length, 0)} topics</span>
        </div>
        <div class="math-curriculum-units">${units}</div>
      </div>
      <div class="da-curriculum-modal-footer math-curriculum-footer">
        <span>Ready to master the complete roadmap?</span>
        <button type="button" onclick="closeDaCurriculumPreview(); document.querySelector('#course-data-analyst-complete .dakit-hero-cta')?.click();">Get All 24 Resources →</button>
      </div>
    </div>`;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeDaCurriculumPreview();
  });
  document.body.appendChild(modal);
  lockCurriculumBackground();
}

const mlResourceLists = {
  questions: {
    title: '10 Interview Question Sets',
    meta: '2,100+ machine learning interview questions',
    intro: 'Complete question-set coverage for Machine Learning interviews.',
    items: ['Statistics Interview Question Set', 'Linear Algebra Interview Question Set', 'Python Interview Question Set', 'Data Engineering & Code Quality Interview Question Set', 'Exploratory Data Analysis Interview Question Set', 'Feature Engineering Interview Question Set', 'Data Cleaning & Preprocessing Interview Question Set', 'Supervised Learning — Regression Interview Question Set', 'Supervised Learning — Classification Interview Question Set', 'Unsupervised Learning Interview Question Set']
  },
  answers: {
    title: '10 Detailed Answer Sheets',
    meta: 'Step-by-step explanations for every question set',
    intro: 'Detailed answer workbooks to check and improve every response.',
    items: ['Statistics Detailed Answer Workbook', 'Linear Algebra Detailed Answer Workbook', 'Python Detailed Answer Workbook', 'Data Engineering & Code Quality Detailed Answer Workbook', 'Exploratory Data Analysis Detailed Answer Workbook', 'Feature Engineering Detailed Answer Workbook', 'Data Cleaning & Preprocessing Detailed Answer Workbook', 'Supervised Learning — Regression Detailed Answer Workbook', 'Supervised Learning — Classification Detailed Answer Workbook', 'Unsupervised Learning Detailed Answer Workbook']
  },
  handbooks: {
    title: '10 Comprehensive Handbooks',
    meta: 'Complete Machine Learning preparation library',
    intro: 'Structured handbooks covering every core Machine Learning subject.',
    items: ['Statistics Handbook', 'Linear Algebra Handbook', 'Python Handbook', 'Data Engineering & Code Quality Handbook', 'Exploratory Data Analysis Handbook', 'Feature Engineering Handbook', 'Data Cleaning & Preprocessing Handbook', 'Supervised Learning — Regression Handbook', 'Supervised Learning — Classification Handbook', 'Unsupervised Learning Handbook']
  }
};

function openMlResourceModal(type) {
  const resource = mlResourceLists[type];
  if (!resource) return;
  closeDaCurriculumPreview();
  const rows = resource.items.map((item, index) => `
    <div class="math-curriculum-unit ml-resource-unit">
      <div class="ml-resource-row">
        <span class="math-unit-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="math-unit-heading"><strong>${item}</strong></span>
      </div>
    </div>`).join('');
  const modal = document.createElement('div');
  modal.id = 'daCurriculumPreviewModal';
  modal.className = 'da-curriculum-modal math-curriculum-modal ml-resource-modal';
  modal.innerHTML = `
    <div class="da-curriculum-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="mlResourceModalTitle">
      <div class="da-curriculum-modal-header math-curriculum-header">
        <div>
          <span class="math-curriculum-eyebrow">COMPLETE PREPARATION SYSTEM</span>
          <strong id="mlResourceModalTitle">${resource.title}</strong>
          <span>${resource.meta}</span>
        </div>
        <button type="button" aria-label="Close" onclick="closeDaCurriculumPreview()">&times;</button>
      </div>
      <div class="math-curriculum-body">
        <div class="math-curriculum-intro">
          <div><strong>${resource.intro}</strong><span>All 10 resources are included in your complete kit.</span></div>
          <span class="math-curriculum-badge">10 resources</span>
        </div>
        <div class="math-curriculum-units">${rows}</div>
      </div>
      <div class="da-curriculum-modal-footer math-curriculum-footer">
        <span>Ready to start your complete interview preparation?</span>
        <button type="button" onclick="closeDaCurriculumPreview(); document.querySelector('#course-ai-automation .dakit-hero-cta')?.click();">Get Complete Kit →</button>
      </div>
    </div>`;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeDaCurriculumPreview();
  });
  document.body.appendChild(modal);
  lockCurriculumBackground();
}

function openMathStatsCurriculum() {
  openStructuredCurriculum(mathStatsCurriculum, {
    title: 'Mathematics & Statistics Curriculum',
    meta: '12 structured units • 120 practical topics • Beginner to advanced',
    intro: 'Build the statistical foundation every data analyst needs.'
  });
}

function openExcelSheetsCurriculum() {
  openStructuredCurriculum(excelSheetsCurriculum, {
    title: 'Excel & Google Sheets Curriculum',
    meta: '10 structured units • 100 practical topics • A complete analytics journey',
    intro: 'Turn raw spreadsheets into clean analysis, automation and dashboards.'
  });
}

function openSqlCurriculum() {
  openStructuredCurriculum(sqlCurriculum, {
    title: 'SQL & Databases Curriculum',
    meta: '10 structured units • 100 practical topics • A complete analytics journey',
    intro: 'Build job-ready SQL skills from your first query to scalable data systems.'
  });
}

function openPythonCurriculum() {
  openStructuredCurriculum(pythonCurriculum, {
    title: 'Python for Analytics Curriculum',
    meta: '14 structured units • 112 practical topics • A complete analytics journey',
    intro: 'Move from Python fundamentals to analysis, dashboards and predictive models.'
  });
}

function openBiCurriculum() {
  const topicTotal = biCurriculum.reduce((total, unit) => total + unit[2].length, 0);
  openStructuredCurriculum(biCurriculum, {
    title: 'Business Intelligence & Dashboards Curriculum',
    meta: `10 structured units • ${topicTotal} supplied topics • A complete BI journey`,
    intro: 'Design trusted dashboards across Power BI, Tableau and the modern BI stack.'
  });
}

function openDataEngineeringCurriculum() {
  openStructuredCurriculum(dataEngineeringCurriculum, {
    title: 'Data Engineering Fundamentals Curriculum',
    meta: '8 structured units • 41 practical topics • A complete data engineering journey',
    intro: 'Understand the modern data stack from ingestion and storage to reliable pipelines.'
  });
}

function openStorytellingCurriculum() {
  const topicTotal = storytellingCurriculum.reduce((total, unit) => total + unit[2].length, 0);
  openStructuredCurriculum(storytellingCurriculum, {
    title: 'Storytelling, Communication & Domain Knowledge',
    meta: `6 supplied units • ${topicTotal} supplied topics • A complete communication journey`,
    intro: 'Turn sound analysis into clear narratives, decisions and stakeholder action.'
  });
}

function openAiEraCurriculum() {
  openStructuredCurriculum(aiEraCurriculum, {
    title: 'AI-Era Analytics Curriculum',
    meta: '7 structured units • 35 practical topics • A complete AI-era journey',
    intro: 'Use AI responsibly across analytics, development, modeling and agentic workflows.'
  });
}

function openAllCurricula() {
  closeDaCurriculumPreview();
  const modules = [
    ['Mathematics & Statistics', mathStatsCurriculum],
    ['Excel & Google Sheets', excelSheetsCurriculum],
    ['SQL & Databases', sqlCurriculum],
    ['Python for Analytics', pythonCurriculum],
    ['Business Intelligence & Dashboards', biCurriculum],
    ['Data Engineering Fundamentals', dataEngineeringCurriculum],
    ['Storytelling, Communication & Domain Knowledge', storytellingCurriculum],
    ['AI-Era Analytics', aiEraCurriculum]
  ];
  const totalUnits = modules.reduce((total, module) => total + module[1].length, 0);
  const totalTopics = modules.reduce((total, module) => total + module[1].reduce((sum, unit) => sum + unit[2].length, 0), 0);
  const moduleMarkup = modules.map((module, moduleIndex) => {
    const moduleTopics = module[1].reduce((total, unit) => total + unit[2].length, 0);
    const unitMarkup = module[1].map((unit, unitIndex) => `
      <details class="math-curriculum-unit">
        <summary>
          <span class="math-unit-number">${String(unitIndex + 1).padStart(2, '0')}</span>
          <span class="math-unit-heading"><strong>Unit ${unitIndex + 1}: ${unit[0]}</strong>${unit[1] ? `<small>${unit[1]}</small>` : ''}</span>
          <span class="math-topic-count">${unit[2].length} topics</span>
          <span class="math-unit-chevron" aria-hidden="true"></span>
        </summary>
        <ol class="math-topic-grid">
          ${unit[2].map((topic, topicIndex) => `<li><span>${unitIndex + 1}.${topicIndex + 1}</span>${topic}</li>`).join('')}
        </ol>
      </details>`).join('');
    return `
      <details class="all-curriculum-module">
        <summary class="all-module-summary">
          <span class="all-module-number">${moduleIndex + 1}</span>
          <span><strong>${module[0]}</strong><small>${module[1].length} units • ${moduleTopics} topics</small></span>
          <span class="math-unit-chevron" aria-hidden="true"></span>
        </summary>
        <div class="all-module-units">${unitMarkup}</div>
      </details>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'daCurriculumPreviewModal';
  modal.className = 'da-curriculum-modal math-curriculum-modal all-curriculum-modal';
  modal.innerHTML = `
    <div class="da-curriculum-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="allCurriculumTitle">
      <div class="da-curriculum-modal-header math-curriculum-header all-curriculum-header">
        <div>
          <span class="math-curriculum-eyebrow">COMPLETE DATA ANALYST ROADMAP</span>
          <strong id="allCurriculumTitle">Full 8-Module Curriculum</strong>
          <span>${totalUnits} units • ${totalTopics} supplied topics • Beginner to advanced</span>
        </div>
        <button type="button" aria-label="Close curriculum" onclick="closeDaCurriculumPreview()">&times;</button>
      </div>
      <div class="math-curriculum-body">
        <div class="math-curriculum-intro all-curriculum-intro">
          <div><strong>Your complete, structured Data & BI Analyst learning path.</strong><span>Open a handbook, then expand any unit to see every topic.</span></div>
          <span class="math-curriculum-badge">8 modules</span>
        </div>
        <div class="all-curriculum-modules">${moduleMarkup}</div>
      </div>
      <div class="da-curriculum-modal-footer math-curriculum-footer">
        <span>Everything you need—from foundations to AI-era analytics.</span>
        <button type="button" onclick="closeDaCurriculumPreview(); document.querySelector('#course-data-analyst-complete .dakit-hero-cta')?.click();">Get All 24 Resources →</button>
      </div>
    </div>`;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeDaCurriculumPreview();
  });
  document.body.appendChild(modal);
  lockCurriculumBackground();
}

document.addEventListener('DOMContentLoaded', () => {
  const valueStack = document.querySelector('#course-data-analyst-complete .da-cro-value-stack');
  const authorNote = document.querySelector('#course-data-analyst-complete .ll-author-note-section');
  if (valueStack && authorNote) {
    valueStack.appendChild(authorNote);
  }

  document.querySelectorAll('#da-bundle-handbooks .da-curriculum-card').forEach(card => {
    card.addEventListener('click', event => {
      event.preventDefault();
      if (card.dataset.curriculum === 'math-stats') {
        openMathStatsCurriculum();
      } else if (card.dataset.curriculum === 'excel-sheets') {
        openExcelSheetsCurriculum();
      } else if (card.dataset.curriculum === 'sql-databases') {
        openSqlCurriculum();
      } else if (card.dataset.curriculum === 'python') {
        openPythonCurriculum();
      } else if (card.dataset.curriculum === 'bi-dashboards') {
        openBiCurriculum();
      } else if (card.dataset.curriculum === 'data-engineering') {
        openDataEngineeringCurriculum();
      } else if (card.dataset.curriculum === 'storytelling-domain') {
        openStorytellingCurriculum();
      } else if (card.dataset.curriculum === 'ai-era-analytics') {
        openAiEraCurriculum();
      } else {
        openDaCurriculumPreview(card.getAttribute('href'), card.querySelector('h3')?.textContent || 'Module Curriculum');
      }
    });
  });
});

function applyDataScienceMarket(useAsianCheckout) {

  const scienceRoots = getCourseRoots([

    'course-data-science',

    'course-data-science-questions'

  ]);

  if (useAsianCheckout) {

    updateWithin(scienceRoots, '.price-basic', el => el.textContent = '\u20B9399');

    updateWithin(scienceRoots, '.price-bundle', el => el.textContent = '\u20B9899');

    updateWithin(scienceRoots, '.strike-bundle', el => el.textContent = '\u20B93,500');

  } else {

    updateWithin(scienceRoots, '.price-basic', el => el.textContent = '$29');

    updateWithin(scienceRoots, '.price-bundle', el => el.textContent = '$39');

    updateWithin(scienceRoots, '.strike-basic', el => el.textContent = '$49');

    updateWithin(scienceRoots, '.strike-bundle', el => el.textContent = '$99');

    replacePaymentLink(

      REGIONAL_CHECKOUT.dataScience.asia,

      REGIONAL_CHECKOUT.dataScience.international

    );

  }

}

function applyAiAutomationPricing(countryCode) {
  if (!USD_DA_KIT_COUNTRY_CODES.has(countryCode)) return;

  const price = '$3.99';
  const strike = '$9.99';
  const discount = '60% OFF';
  const checkoutLink = 'https://rzp.io/rzp/rbubuQPm';

  const aiCardButton = document.querySelector('.course-bundle-card button[onclick*="ai-automation"]');
  const aiCard = aiCardButton && aiCardButton.closest('.course-bundle-card');
  if (aiCard) {
    const cardPrice = aiCard.querySelector('.bundle-price-large');
    const cardStrike = aiCard.querySelector('.bundle-price-strike');
    const cardBadge = aiCard.querySelector('.bundle-discount-badge');
    if (cardPrice) cardPrice.textContent = price;
    if (cardStrike) cardStrike.textContent = strike;
    if (cardBadge) cardBadge.textContent = discount;
  }

  const aiRoot = document.getElementById('course-ai-automation');
  if (aiRoot) {
    aiRoot.querySelectorAll('#aiHeroNew, #aiCtaNew, #aiPayPrice')
      .forEach(el => el.textContent = price);
    aiRoot.querySelectorAll('#aiHeroOld, #aiCtaOld')
      .forEach(el => el.textContent = strike);
    aiRoot.querySelectorAll('#aiHeroBadge, #aiCtaBadge')
      .forEach(el => el.textContent = discount);

    // The INR-only first-buyer discount is not applicable to fixed USD pricing.
    const discountCard = document.getElementById('aiDiscountCard');
    if (discountCard) discountCard.style.display = 'none';
    const discountCheck = document.getElementById('aiDiscountCheck');
    if (discountCheck) discountCheck.checked = false;
  }

  if (typeof aiCheckoutConfig !== 'undefined') {
    aiCheckoutConfig.regularLink = checkoutLink;
    aiCheckoutConfig.discountLink = checkoutLink;
    aiPayLink = checkoutLink;
  }

  if (typeof SEARCH_INDEX !== 'undefined') {
    const aiSearchItem = SEARCH_INDEX.find(item => item.name === 'Crack Machine Learning Interviews');
    if (aiSearchItem) aiSearchItem.price = price;
  }
}

async function detectCountryCode() {

  const providers = [

    {

      url: 'https://ipapi.co/json/',

      readCountry: data => data.country_code

    },

    {

      url: 'https://api.country.is/',

      readCountry: data => data.country

    }

  ];

  for (const provider of providers) {

    try {

      const response = await fetch(provider.url);

      if (!response.ok) continue;

      const data = await response.json();

      const countryCode = String(provider.readCountry(data) || '').toUpperCase();

      if (/^[A-Z]{2}$/.test(countryCode)) return countryCode;

    } catch (error) {

      // Try the next provider.

    }

  }

  return '';

}

function getLocalCountryOverride() {

  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);

  if (!localHosts.has(window.location.hostname)) return '';

  const countryCode = new URLSearchParams(window.location.search)

    .get('test-country')

    ?.toUpperCase();

  return /^[A-Z]{2}$/.test(countryCode || '') ? countryCode : '';

}

async function localizePrices() {

  const countryCode = getLocalCountryOverride() || await detectCountryCode();

  // A failed lookup keeps the safer INR defaults and existing Asian links.

  if (!countryCode) return;

  const useInternationalAnalystCheckout =

    countryCode === 'US' || EUROPE_COUNTRY_CODES.has(countryCode);

  const useAsianScienceCheckout = ASIA_COUNTRY_CODES.has(countryCode);

  applyDataAnalystMarket(useInternationalAnalystCheckout);

  applyDataScienceMarket(useAsianScienceCheckout);

  applyDaKitPricing(countryCode);


}

// Combined initialization: deep-link routing + price localization

window.addEventListener('DOMContentLoaded', () => {

  // Make direct shared links work

  if (window.location.hash) {

    const hashId = window.location.hash.substring(1);

    if (document.getElementById('course-' + hashId)) {

      openDetail(hashId);

    }

  }

  // Detect location and swap currency

  localizePrices();

});

// --- EXPLORE ALL HANDBOOKS LOGIC ---

const popularityOrder = ['hb-math', 'hb-math-ds', 'hb-python', 'hb-python-ds', 'hb-ml', 'hb-dl', 'hb-genai', 'hb-sql', 'hb-mlops', 'hb-bi', 'hb-de', 'hb-ai', 'hb-domain', 'hb-eda', 'hb-model', 'hb-excel'];

const analyticsOrder = ['hb-math', 'hb-excel', 'hb-sql', 'hb-python', 'hb-bi', 'hb-de', 'hb-domain', 'hb-ai'];

const scienceOrder = ['hb-math-ds', 'hb-python-ds', 'hb-eda', 'hb-ml', 'hb-model', 'hb-dl', 'hb-mlops', 'hb-genai'];

function filterHandbooks() {

  const filter = document.getElementById('explore-sort-select').value;

  const container = document.getElementById('explore-grid-container');

  if (!container) return;

  const cards = Array.from(container.getElementsByClassName('explore-card'));

  let orderArray = popularityOrder;

  if (filter === 'analytics') orderArray = analyticsOrder;

  else if (filter === 'science') orderArray = scienceOrder;

  // Hide all first

  cards.forEach(c => c.style.display = 'none');

  // Update count text

  document.getElementById('explore-showing-text').textContent = `1-${orderArray.length} of ${orderArray.length}`;

  // Reorder and show

  orderArray.forEach((id, index) => {

    const card = document.getElementById(id);

    if (card) {

      card.style.display = 'block';

      // Update the number tag

      const numSpan = card.querySelector('.explore-num');

      if (numSpan) numSpan.textContent = (index + 1).toString().padStart(2, '0');

      container.appendChild(card); // Moves to end

    }

  });

}

function openExploreAllHandbooks() {

        if (document.getElementById('pythonDetailSection')?.style.display === 'block') {
    closePythonHandbook();
  }
  if (document.getElementById('pythonDsDetailSection')?.style.display === 'block') {
    closePythonDsHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('mathDsDetailSection')?.style.display === 'block') {
    closeMathDsHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  if (document.getElementById('mathDetailSection')?.style.display === 'block') {
    closeMathHandbook();
  }
  if (document.getElementById('sqlDetailSection')?.style.display === 'block') {
    closeSqlHandbook();
  }
  if (document.getElementById('biDetailSection')?.style.display === 'block') {
    closeBiHandbook();
  }
  if (document.getElementById('deDetailSection')?.style.display === 'block') {
    closeDeHandbook();
  }
  if (document.getElementById('domainDetailSection')?.style.display === 'block') {
    closeDomainHandbook();
  }
  if (document.getElementById('aiDetailSection')?.style.display === 'block') {
    closeAiHandbook();
  }
  if (document.getElementById('excelDetailSection')?.style.display === 'block') {
    closeExcelHandbook();
  }
  const statsGrid = document.querySelector('.stats-grid');

  const dashGrid = document.querySelector('.dashboard-grid');

  const dashBottom = document.querySelector('.dashboard-bottom');

  if (statsGrid) statsGrid.style.display = 'none';

  if (dashGrid) dashGrid.style.display = 'none';

  if (dashBottom) dashBottom.style.display = 'none';

  hideAllSections();

  const eah = document.getElementById('exploreAllHandbooksSection');

  if (eah) {

    eah.style.display = 'block';

    document.getElementById('explore-sort-select').value = 'popularity';

    filterHandbooks();

  }

  document.querySelectorAll('.dashboard-nav-item').forEach(item => item.classList.remove('active'));

  // Reset the topbar back to the homepage "Welcome to Learnlytics" title
  var topbarLeft = document.querySelector('.dashboard-topbar > div:first-child');
  if (topbarLeft && topbarLeft.dataset.originalHtml) {
    topbarLeft.innerHTML = topbarLeft.dataset.originalHtml;
  }
  var h1 = document.querySelector('.dashboard-topbar h1');
  var p = document.querySelector('.dashboard-topbar p');
  if (h1) h1.innerHTML = 'Welcome to Learn<span class="brand-lytics">lytics</span>';
  if (p) p.innerHTML = 'Your one-stop hub for high-quality handbooks to <strong>learn, practice &amp; grow.</strong>';

  window.scrollTo({ top: 0, behavior: 'instant' });
}



/* ==========================================
   MOBILE SIDEBAR DRAWER TRIGGERS (ADDED)
   ========================================== */

function toggleMobileSidebar(isOpen) {
  const sidebar = document.querySelector('.dashboard-sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && overlay) {
    if (isOpen) {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    } else {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = ''; // restore background scrolling
    }
  }
}

// Automatically close the mobile sidebar drawer when a navigation item is clicked
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.dashboard-nav-item, .sidebar-help-btn');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      toggleMobileSidebar(false);
    });
  });
});

/* ==========================================
   GLOBAL SEARCH
   ========================================== */

const SEARCH_INDEX = [
  // -- Course Bundles --
  {
    name: "Data & BI Analyst Interview Kit",
    keywords: ["data analyst", "da bundle", "analyst bundle", "data analyst bundle", "bundle", "bi analyst", "data bi", "interview kit", "sql", "excel", "python", "power bi"],
    category: "Course Bundle",
    categoryClass: "cat-bundle",
    price: "₹499",
    icon: "📦",
    iconClass: "type-bundle",
    type: "bundle",
    action: function() { openDetail('data-analyst'); }
  },
  {
    name: "Crack Machine Learning Interviews",
    keywords: ["machine learning", "ml", "machine learning interview", "ml interview", "interview kit", "course bundle"],
    category: "Course Bundle",
    categoryClass: "cat-bundle",
    price: "₹499",
    icon: "🤖",
    iconClass: "type-bundle",
    type: "bundle",
    action: function() { openDetail('ai-automation'); }
  },
  {
    name: "Data Scientist & GenAI Engineer Bundle",
    keywords: ["data scientist", "ds bundle", "scientist bundle", "data science bundle", "bundle", "genai bundle", "gen ai bundle", "course bundle"],
    category: "Course Bundle",
    categoryClass: "cat-bundle",
    price: "₹699",
    icon: "📦",
    iconClass: "type-bundle",
    type: "bundle",
    action: function() { openDetail('data-science'); }
  },
  {
    name: "Data Engineer Bundle",
    keywords: ["data engineer", "de bundle", "engineer bundle", "data engineering", "pipeline", "etl"],
    category: "Course Bundle",
    categoryClass: "cat-bundle",
    price: "Coming Soon",
    icon: "📦",
    iconClass: "type-bundle",
    type: "coming",
    action: function() { showDashboard(); }
  },
  {
    name: "Free Resources",
    keywords: ["free", "resources", "download", "free handbooks", "free resources", "sql free", "ml free", "samples", "sample handbooks", "free sql", "free ml"],
    category: "Free Resources",
    categoryClass: "cat-da",
    price: "100% Free",
    icon: "🎁",
    iconClass: "type-bundle",
    type: "free",
    action: function() { showSection('free'); }
  },
  {
    name: "Help & FAQ",
    keywords: ["help", "faq", "support", "contact", "questions", "refund", "download issue", "privacy", "terms"],
    category: "Support",
    categoryClass: "cat-bundle",
    price: "Support",
    icon: "❓",
    iconClass: "type-bundle",
    type: "help",
    action: function() { openDetail('help'); }
  }
];

function filterSearch(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];
  return SEARCH_INDEX.filter(function(item) {
    // Check item name
    if (item.name.toLowerCase().includes(q)) return true;
    // Check keywords
    return item.keywords.some(function(kw) { return kw.includes(q); });
  });
}

function renderSearchResults(results, query) {
  var dropdown = document.getElementById('searchDropdown');
  if (!dropdown) return;

  if (!query || query.trim().length < 1) {
    dropdown.classList.remove('active');
    dropdown.innerHTML = '';
    return;
  }

  if (results.length === 0) {
    var noResultDiv = document.createElement('div');
    noResultDiv.className = 'search-no-results';
    var iconSpan = document.createElement('span');
    iconSpan.textContent = '🔍';
    noResultDiv.appendChild(iconSpan);
    noResultDiv.appendChild(document.createTextNode('No results found for "' + query + '"'));
    dropdown.innerHTML = '';
    dropdown.appendChild(noResultDiv);
    dropdown.classList.add('active');
    return;
  }

  // Group results
  var bundles = results.filter(function(r) { return r.type === 'bundle'; });
  var handbooks = results.filter(function(r) { return r.type === 'handbook'; });
  var coming = results.filter(function(r) { return r.type === 'coming'; });

  var html = '';

  if (bundles.length > 0) {
    html += '<div class="search-dropdown-group">📦 Course Bundles</div>';
    bundles.forEach(function(item) {
      html += buildSearchItem(item);
    });
  }

  if (handbooks.length > 0) {
    if (bundles.length > 0) html += '<div class="search-dropdown-divider"></div>';
    html += '<div class="search-dropdown-group">📘 Handbooks</div>';
    handbooks.forEach(function(item) {
      html += buildSearchItem(item);
    });
  }

  if (coming.length > 0) {
    if (bundles.length > 0 || handbooks.length > 0) html += '<div class="search-dropdown-divider"></div>';
    html += '<div class="search-dropdown-group">🔜 Coming Soon</div>';
    coming.forEach(function(item) {
      html += buildSearchItem(item);
    });
  }

  dropdown.innerHTML = html;
  dropdown.classList.add('active');

  // Attach click handlers
  var items = dropdown.querySelectorAll('.search-dropdown-item');
  items.forEach(function(el) {
    el.addEventListener('click', function() {
      var idx = parseInt(el.getAttribute('data-index'));
      var searchInput = document.getElementById('globalSearchInput');
      if (searchInput) { searchInput.value = ''; }
      dropdown.classList.remove('active');
      dropdown.innerHTML = '';
      if (SEARCH_INDEX[idx]) SEARCH_INDEX[idx].action();
    });
  });
}

function buildSearchItem(item) {
  var idx = SEARCH_INDEX.indexOf(item);
  var priceHtml = '';
  if (item.type === 'coming') {
    priceHtml = '<span class="search-item-coming">Coming July 20</span>';
  } else if (item.price === 'Free' || item.price === 'Part 01 Free') {
    priceHtml = '<span class="search-item-price free">' + item.price + '</span>';
  } else {
    priceHtml = '<span class="search-item-price">' + item.price + '</span>';
  }
  return '<button class="search-dropdown-item" data-index="' + idx + '" type="button">' +
    '<div class="search-item-icon ' + item.iconClass + '">' + item.icon + '</div>' +
    '<div class="search-item-body">' +
      '<div class="search-item-name">' + item.name + '</div>' +
      '<div class="search-item-meta">' +
        '<span class="search-item-badge ' + item.categoryClass + '">' + item.category + '</span>' +
      '</div>' +
    '</div>' +
    priceHtml +
  '</button>';
}

// -- Search Event Listeners --
document.addEventListener('DOMContentLoaded', function() {
  var searchInput = document.getElementById('globalSearchInput');
  var dropdown = document.getElementById('searchDropdown');
  if (!searchInput || !dropdown) return;

  // Live search on typing
  var searchDebounceTimer;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(function() {
      var query = searchInput.value;
      var results = filterSearch(query);
      renderSearchResults(results, query);
    }, 150);
  });

  // Re-open on focus if there is text
  searchInput.addEventListener('focus', function() {
    var query = searchInput.value;
    if (query && query.trim().length > 0) {
      var results = filterSearch(query);
      renderSearchResults(results, query);
    }
  });

  // Close on Escape
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdown.classList.remove('active');
      dropdown.innerHTML = '';
      searchInput.blur();
    }
  });

  // Close on click outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
      dropdown.innerHTML = '';
    }
  });
});


function loadLazyIframe(id) {
  const iframe = document.getElementById(id);
  if (iframe && iframe.dataset.src && !iframe.getAttribute('src')) {
    iframe.src = iframe.dataset.src;
  }
}

/* ==========================================
   CLIENT-SIDE ROUTING & CLEAN URL PATHS
   ========================================== */

let isNavigatingFromRouter = false;

function safePushState(url) {
  try {
    sessionStorage.setItem('lastLearnyticsUrl', url);
  } catch (e) {}
  if (!isNavigatingFromRouter && window.location.pathname !== url) {
    try {
      window.history.pushState(null, '', url);
    } catch (e) {}
  }
}

function handleRouting(path) {
  isNavigatingFromRouter = true;
  try {
    let checkPath = path;
    if (!checkPath || checkPath === '/' || checkPath === '/index.html') {
      if (window.location.hash) {
        const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
        if (hash === 'data-analyst-complete' || hash === 'data-bi-analyst-complete-bundle') {
          checkPath = '/course-bundles/data-bi-analyst-complete-bundle';
        } else if (hash === 'data-analyst' || hash === 'data-bi-analyst-interview-kit' || hash === 'data-bi-analyst-bundle') {
          checkPath = '/course-bundles/data-bi-analyst-interview-kit';
        } else if (hash === 'ai-automation' || hash === 'ai-automation-bundle' || hash === 'machine-learning-interview-kit') {
          checkPath = '/course-bundles/machine-learning-interview-kit';
        } else if (hash === 'data-science' || hash === 'data-scientist-genai-engineer-bundle') {
          checkPath = '/course-bundles/data-scientist-genai-engineer-bundle';
        } else if (hash === 'free' || hash === 'free-handbooks' || hash === 'free-download') {
          checkPath = '/free-download';
        } else if (hash === 'reviews' || hash === 'review') {
          checkPath = '/review';
        }
      }
      if (!checkPath || checkPath === '/' || checkPath === '/index.html') {
        try {
          const saved = sessionStorage.getItem('lastLearnyticsUrl');
          if (saved && saved !== '/' && saved !== '/index.html') {
            checkPath = saved;
          }
        } catch (e) {}
      }
    }

    const cleanPath = (checkPath || '').replace(/\/index\.html$/, '') || '/';
    const decodedPath = decodeURIComponent(cleanPath);
    const normalizedPath = decodedPath.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (
      normalizedPath === '/course-bundles/data-bi-analyst-complete-bundle' ||
      normalizedPath === '/course-bundles/data-bi-analyst-complete'
    ) {
      openDetail('data-analyst-complete');
    } else if (
      normalizedPath === '/course-bundles/data-bi-analyst-interview-kit' ||
      normalizedPath === '/course-bundles/data-bi-analyst-bundle' ||
      normalizedPath === '/course-bundles/data-bi-analyst'
    ) {
      openDetail('data-analyst');
    } else if (
      normalizedPath === '/course-bundles/machine-learning-interview-kit' ||
      normalizedPath === '/course-bundles/ai-automation-bundle' ||
      normalizedPath === '/course-bundles/ai-playbook-bundle' ||
      normalizedPath === '/course-bundles/ai-automation'
    ) {
      openDetail('ai-automation');
    } else if (
      normalizedPath === '/course-bundles/data-bi-analyst-bundle/data-scientist-genai-engineer-bundle' ||
      normalizedPath === '/course-bundles/data-scientist-genai-engineer-bundle' ||
      normalizedPath === '/course-bundles/data-science'
    ) {
      openDetail('data-science');
    } else if (normalizedPath === '/course-bundles/data-bi-analyst-bundle/interview-questions') {
      openDetail('data-analyst-questions');
    } else if (
      normalizedPath === '/course-bundles/data-bi-analyst-bundle/data-scientist-genai-engineer-bundle/interview-questions' ||
      normalizedPath === '/course-bundles/data-scientist-genai-engineer-bundle/interview-questions'
    ) {
      openDetail('data-science-questions');
    } else if (normalizedPath === '/help') {
      openDetail('help');
    } else if (
      normalizedPath === '/free-download' ||
      normalizedPath === '/free-handbooks' ||
      normalizedPath === '/free'
    ) {
      showSection('free');
    } else if (normalizedPath === '/review' || normalizedPath === '/reviews') {
      showSection('reviews');
    } else if (normalizedPath === '/whats-inside' || normalizedPath === '/inside') {
      showSection('inside');
    } else if (normalizedPath === '/tools-tech' || normalizedPath === '/tools') {
      showSection('tools');
    } else if (normalizedPath === '/course-bundles') {
      openCoursesMenu();
    } else {
      showDashboard();
    }
  } catch (e) {
    console.error('Routing transition error:', e);
  } finally {
    isNavigatingFromRouter = false;
  }
}

// Wrapper interceptions for Page Open triggers
if (typeof showDashboard === 'function') {
  const originalShowDashboard = showDashboard;
  showDashboard = function(...args) {
    originalShowDashboard.apply(this, args);
    safePushState('/');
  };
}

if (typeof openCoursesMenu === 'function') {
  const originalOpenCoursesMenu = openCoursesMenu;
  openCoursesMenu = function(...args) {
    originalOpenCoursesMenu.apply(this, args);
    safePushState('/course-bundles');
  };
}

if (typeof openDetail === 'function') {
  const originalOpenDetail = openDetail;
  openDetail = function(courseId, ...args) {
    originalOpenDetail.apply(this, [courseId, ...args]);
    if (courseId === 'data-analyst') {
      safePushState('/course-bundles/data-bi-analyst-interview-kit');
    } else if (courseId === 'data-analyst-complete') {
      safePushState('/course-bundles/data-bi-analyst-complete-bundle');
    } else if (courseId === 'ai-automation') {
      safePushState('/course-bundles/machine-learning-interview-kit');
    } else if (courseId === 'data-science') {
      safePushState('/course-bundles/data-scientist-genai-engineer-bundle');
    } else if (courseId === 'data-science-questions') {
      safePushState('/course-bundles/data-scientist-genai-engineer-bundle/interview-questions');
    } else if (courseId === 'help') {
      safePushState('/help');
    }
  };
}

if (typeof showSection === 'function') {
  const originalShowSection = showSection;
  showSection = function(section, ...args) {
    originalShowSection.apply(this, [section, ...args]);
    if (section === 'inside') {
      safePushState('/whats-inside');
    } else if (section === 'tools') {
      safePushState('/tools-tech');
    } else if (section === 'free') {
      safePushState('/free-download');
    } else if (section === 'reviews') {
      safePushState('/review');
    }
  };
}

if (typeof openExploreAllHandbooks === 'function') {
  const originalOpenExploreAllHandbooks = openExploreAllHandbooks;
  openExploreAllHandbooks = function(...args) {
    originalOpenExploreAllHandbooks.apply(this, args);
    safePushState('/all-handbook-page');
  };
}

if (typeof openMathHandbook === 'function') {
  const originalOpenMathHandbook = openMathHandbook;
  openMathHandbook = function(...args) {
    originalOpenMathHandbook.apply(this, args);
    safePushState('/all-handbook-page/math-stats');
  };
}

if (typeof openMathDsHandbook === 'function') {
  const originalOpenMathDsHandbook = openMathDsHandbook;
  openMathDsHandbook = function(...args) {
    originalOpenMathDsHandbook.apply(this, args);
    safePushState('/all-handbook-page/math-stats-ds');
  };
}

if (typeof openPythonHandbook === 'function') {
  const originalOpenPythonHandbook = openPythonHandbook;
  openPythonHandbook = function(...args) {
    originalOpenPythonHandbook.apply(this, args);
    safePushState('/all-handbook-page/python');
  };
}

if (typeof openPythonDsHandbook === 'function') {
  const originalOpenPythonDsHandbook = openPythonDsHandbook;
  openPythonDsHandbook = function(...args) {
    originalOpenPythonDsHandbook.apply(this, args);
    safePushState('/all-handbook-page/python-ds');
  };
}

if (typeof openSqlHandbook === 'function') {
  const originalOpenSqlHandbook = openSqlHandbook;
  openSqlHandbook = function(...args) {
    originalOpenSqlHandbook.apply(this, args);
    safePushState('/all-handbook-page/sql');
  };
}

if (typeof openExcelHandbook === 'function') {
  const originalOpenExcelHandbook = openExcelHandbook;
  openExcelHandbook = function(...args) {
    originalOpenExcelHandbook.apply(this, args);
    safePushState('/all-handbook-page/excel');
  };
}

if (typeof openBiHandbook === 'function') {
  const originalOpenBiHandbook = openBiHandbook;
  openBiHandbook = function(...args) {
    originalOpenBiHandbook.apply(this, args);
    safePushState('/all-handbook-page/bi-tools');
  };
}

if (typeof openDeHandbook === 'function') {
  const originalOpenDeHandbook = openDeHandbook;
  openDeHandbook = function(...args) {
    originalOpenDeHandbook.apply(this, args);
    safePushState('/all-handbook-page/de');
  };
}

if (typeof openAiHandbook === 'function') {
  const originalOpenAiHandbook = openAiHandbook;
  openAiHandbook = function(...args) {
    originalOpenAiHandbook.apply(this, args);
    safePushState('/all-handbook-page/ai-era');
  };
}

if (typeof openDomainHandbook === 'function') {
  const originalOpenDomainHandbook = openDomainHandbook;
  openDomainHandbook = function(...args) {
    originalOpenDomainHandbook.apply(this, args);
    safePushState('/all-handbook-page/domain');
  };
}

// Wrapper interceptions for Page Close triggers to restore Home URL
const closeHandlers = [
  'closePythonHandbook', 'closePythonDsHandbook', 'closeMathHandbook',
  'closeMathDsHandbook', 'closeSqlHandbook', 'closeBiHandbook',
  'closeDeHandbook', 'closeDomainHandbook', 'closeAiHandbook', 'closeExcelHandbook'
];
closeHandlers.forEach(handlerName => {
  if (typeof window[handlerName] === 'function') {
    const originalClose = window[handlerName];
    window[handlerName] = function(...args) {
      originalClose.apply(this, args);
      safePushState('/');
    };
  }
});

// Setup popstate and DOMContentLoaded routing listeners
window.addEventListener('popstate', () => {
  handleRouting(window.location.pathname);
});

// Perform routing on initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    handleRouting(window.location.pathname);
  });
} else {
  handleRouting(window.location.pathname);
}

// Automatically sync mobile home content visibility with stats-grid visibility
document.addEventListener('DOMContentLoaded', function() {
  var statsGrid = document.querySelector('.stats-grid');
  var mobileHome = document.querySelector('.mobile-home-content');
  if (statsGrid && mobileHome) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'style') {
          if (statsGrid.style.display === 'none') {
            mobileHome.classList.add('hide-mobile-home');
          } else {
            mobileHome.classList.remove('hide-mobile-home');
          }
        }
      });
    });
    observer.observe(statsGrid, { attributes: true, attributeFilter: ['style'] });
    
    // Initial check in case stats-grid is already hidden
    if (statsGrid.style.display === 'none') {
      mobileHome.classList.add('hide-mobile-home');
    }
  }
});

// Function to update recent order dates dynamically relative to today's date
function updateRecentOrderDates() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const today = new Date();
  const todayStr = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  
  // Local ISO Date: YYYY-MM-DD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayIso = `${year}-${month}-${day}`;
  
  // Today minus 3 days
  const minus3 = new Date();
  minus3.setDate(today.getDate() - 3);
  const minus3Str = `${months[minus3.getMonth()]} ${minus3.getDate()}, ${minus3.getFullYear()}`;
  const m3Year = minus3.getFullYear();
  const m3Month = String(minus3.getMonth() + 1).padStart(2, '0');
  const m3Day = String(minus3.getDate()).padStart(2, '0');
  const minus3Iso = `${m3Year}-${m3Month}-${m3Day}`;
  
  // Update elements
  document.querySelectorAll('.recent-order-time-today').forEach(el => {
    el.textContent = todayStr;
    el.setAttribute('datetime', todayIso);
  });
  
  document.querySelectorAll('.recent-order-time-minus-3').forEach(el => {
    el.textContent = minus3Str;
    el.setAttribute('datetime', minus3Iso);
  });
}

// Perform initial update on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateRecentOrderDates);
} else {
  updateRecentOrderDates();
}


/* ═══ DA INTERVIEW KIT — 1-HOUR COUNTDOWN TIMER ═══ */
(function() {
  var STORAGE_KEY = 'dakit_countdown_end_60m';
  var DURATION_MS = 60 * 60 * 1000;

  function getEndTime() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      var endTime = parseInt(stored, 10);
      if (endTime > Date.now()) return endTime;
    }
    var newEnd = Date.now() + DURATION_MS;
    localStorage.setItem(STORAGE_KEY, newEnd.toString());
    return newEnd;
  }

  function updateCountdown() {
    var hrsEl = document.getElementById('dakitHrs');
    var minsEl = document.getElementById('dakitMins');
    var secsEl = document.getElementById('dakitSecs');
    var daHrsEl = document.getElementById('daCompleteHrs');
    var daMinsEl = document.getElementById('daCompleteMins');
    var daSecsEl = document.getElementById('daCompleteSecs');
    var mobileMinsEl = document.getElementById('dakitMobileMins');
    var mobileSecsEl = document.getElementById('dakitMobileSecs');

    var endTime = getEndTime();
    var remaining = Math.max(0, endTime - Date.now());

    if (remaining <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      endTime = getEndTime();
      remaining = Math.max(0, endTime - Date.now());
    }

    var totalSecs = Math.floor(remaining / 1000);
    var hrs = Math.floor(totalSecs / 3600);
    var mins = Math.floor((totalSecs % 3600) / 60);
    var secs = totalSecs % 60;

    var hrsStr = hrs.toString().padStart(2, '0');
    var minsStr = mins.toString().padStart(2, '0');
    var secsStr = secs.toString().padStart(2, '0');

    if (hrsEl) hrsEl.textContent = hrsStr;
    if (minsEl) minsEl.textContent = minsStr;
    if (secsEl) secsEl.textContent = secsStr;

    if (daHrsEl) daHrsEl.textContent = hrsStr;
    if (daMinsEl) daMinsEl.textContent = minsStr;
    if (daSecsEl) daSecsEl.textContent = secsStr;

    if (mobileMinsEl) mobileMinsEl.textContent = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    if (mobileSecsEl) mobileSecsEl.textContent = secsStr;
  }

  function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCountdown);
  } else {
    startCountdown();
  }
})();


/* ═══ DA INTERVIEW & COMPLETE KIT — UNIVERSAL AUTO-SCROLL TESTIMONIAL CAROUSEL ═══ */
function dakitSlideTestimonials(direction) {
  var track = document.getElementById('dakitTestiTrack');
  if (!track) return;
  var cards = track.querySelectorAll('.dakit-testimonial-card');
  if (!cards.length) return;
  var cardWidth = cards[0].offsetWidth + 24;
  var maxScroll = track.scrollWidth - track.clientWidth;
  var newScroll = track.scrollLeft + (direction * cardWidth);
  newScroll = Math.max(0, Math.min(newScroll, maxScroll));
  track.scrollTo({ left: newScroll, behavior: 'smooth' });
}

function daCompleteSlideTestimonials(direction) {
  var track = document.getElementById('daCompleteTestiTrack');
  if (!track) return;
  var cards = track.querySelectorAll('.dakit-testimonial-card');
  if (!cards.length) return;
  var cardWidth = cards[0].offsetWidth + 24;
  var maxScroll = track.scrollWidth - track.clientWidth;
  var newScroll = track.scrollLeft + (direction * cardWidth);
  newScroll = Math.max(0, Math.min(newScroll, maxScroll));
  track.scrollTo({ left: newScroll, behavior: 'smooth' });
}

(function initUniversalTestimonialsAutoScroll() {
  function setupTrackAutoScroll(trackId) {
    var track = document.getElementById(trackId);
    if (!track) return;

    var timer = null;
    var isPaused = false;

    function doAutoAdvance() {
      if (isPaused) return;
      var card = track.querySelector('.dakit-testimonial-card');
      if (!card) return;
      var cardWidth = card.offsetWidth + 24;
      var isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      track.scrollTo({ left: isAtEnd ? 0 : track.scrollLeft + cardWidth, behavior: 'smooth' });
    }

    function startTimer() {
      if (!timer) {
        timer = window.setInterval(doAutoAdvance, 3500);
      }
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    startTimer();

    // Pause on user interactions
    track.addEventListener('mouseenter', function() { isPaused = true; }, { passive: true });
    track.addEventListener('mouseleave', function() { isPaused = false; }, { passive: true });
    track.addEventListener('touchstart', function() { isPaused = true; }, { passive: true });
    track.addEventListener('touchend', function() {
      window.setTimeout(function() { isPaused = false; }, 2000);
    }, { passive: true });
  }

  function setupAll() {
    setupTrackAutoScroll('daCompleteTestiTrack');
    setupTrackAutoScroll('dakitTestiTrack');
    setupTrackAutoScroll('aiTestiTrack');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAll);
  } else {
    setupAll();
  }
})();


/* ═══ DA INTERVIEW KIT — FAQ TOGGLE ICON ═══ */
(function() {
  function setupFaqIcons() {
    var items = document.querySelectorAll('.dakit-faq-item');
    items.forEach(function(item) {
      var question = item.querySelector('.dakit-faq-question');
      if (question) {
        question.addEventListener('click', function() {
          item.classList.toggle('active');
          var icon = item.querySelector('.dakit-faq-icon');
          if (icon) {
            icon.textContent = item.classList.contains('active') ? '−' : '+';
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFaqIcons);
  } else {
    setupFaqIcons();
  }
})();
function aiSlideTestimonials(direction) {
  var track = document.getElementById('aiTestiTrack');
  if (!track) return;
  var cards = track.querySelectorAll('.dakit-testimonial-card');
  if (!cards.length) return;
  var cardWidth = cards[0].offsetWidth + 24;
  var maxScroll = track.scrollWidth - track.clientWidth;
  var newScroll = track.scrollLeft + (direction * cardWidth);
  newScroll = Math.max(0, Math.min(newScroll, maxScroll));
  track.scrollTo({ left: newScroll, behavior: 'smooth' });
}

/* ═══ AI AUTOMATION BUNDLE — MOBILE TESTIMONIAL AUTO-SCROLL ═══ */
(function() {
  var autoScrollTimer;

  function stopAutoScroll() {
    window.clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }

  function startAutoScroll() {
    var track = document.getElementById('aiTestiTrack');
    if (!track || !window.matchMedia('(max-width: 768px)').matches || autoScrollTimer) return;

    autoScrollTimer = window.setInterval(function() {
      var card = track.querySelector('.dakit-testimonial-card');
      if (!card) return;
      var cardWidth = card.offsetWidth + 24;
      var isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo({ left: isAtEnd ? 0 : track.scrollLeft + cardWidth, behavior: 'smooth' });
    }, 3500);
  }

  function setupMobileTestimonials() {
    var track = document.getElementById('aiTestiTrack');
    if (!track) return;
    startAutoScroll();
    track.addEventListener('touchstart', stopAutoScroll, { passive: true });
    track.addEventListener('touchend', function() {
      window.setTimeout(startAutoScroll, 1800);
    }, { passive: true });
    window.addEventListener('resize', function() {
      stopAutoScroll();
      startAutoScroll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileTestimonials);
  } else {
    setupMobileTestimonials();
  }
})();

/* ═══ AI AUTOMATION BUNDLE — 1-HOUR COUNTDOWN TIMER ═══ */
(function() {
  var STORAGE_KEY = 'ai_countdown_end_60m';
  var DURATION_MS = 60 * 60 * 1000;

  function getEndTime() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      var endTime = parseInt(stored, 10);
      if (endTime > Date.now()) return endTime;
    }
    var newEnd = Date.now() + DURATION_MS;
    localStorage.setItem(STORAGE_KEY, newEnd.toString());
    return newEnd;
  }

  function updateCountdown() {
    var hrsEl = document.getElementById('aiHrs');
    var minsEl = document.getElementById('aiMins');
    var secsEl = document.getElementById('aiSecs');
    var mobileMinsEl = document.getElementById('aiMobileMins');
    var mobileSecsEl = document.getElementById('aiMobileSecs');
    if (!hrsEl || !minsEl || !secsEl) return;

    var endTime = getEndTime();
    var remaining = Math.max(0, endTime - Date.now());

    if (remaining <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      endTime = getEndTime();
      remaining = Math.max(0, endTime - Date.now());
    }

    var totalSecs = Math.floor(remaining / 1000);
    var hrs = Math.floor(totalSecs / 3600);
    var mins = Math.floor((totalSecs % 3600) / 60);
    var secs = totalSecs % 60;

    hrsEl.textContent = hrs.toString().padStart(2, '0');
    minsEl.textContent = mins.toString().padStart(2, '0');
    secsEl.textContent = secs.toString().padStart(2, '0');
    if (mobileMinsEl) mobileMinsEl.textContent = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    if (mobileSecsEl) mobileSecsEl.textContent = secs.toString().padStart(2, '0');
  }

  function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCountdown);
  } else {
    startCountdown();
  }
})();

// ═══════════════════════════════════════════════
// CRO CONVERSION OPTIMIZATION — ADDITIONS
// ═══════════════════════════════════════════════

(function initCROFeatures() {
  // --- Fix 3: Sticky Mobile CTA for DA Interview Kit ---
  var stickyBar = document.getElementById('dakitStickyMobileCta');
  var heroSection = document.querySelector('#course-data-analyst .dakit-hero');

  if (stickyBar && heroSection) {
    var stickyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var daPage = document.getElementById('course-data-analyst');
        if (daPage && daPage.style.display !== 'none' && daPage.classList.contains('active')) {
          if (!entry.isIntersecting) {
            stickyBar.classList.add('visible');
          } else {
            stickyBar.classList.remove('visible');
          }
        } else {
          stickyBar.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    stickyObserver.observe(heroSection);
  }

  // --- Sticky Mobile CTA for DA Complete Kit ---
  var daCompleteStickyBar = document.getElementById('daCompleteStickyMobileCta');
  var daCompleteHeroSection = document.querySelector('#course-data-analyst-complete .da-hero-panel');

  if (daCompleteStickyBar && daCompleteHeroSection) {
    var daCompleteStickyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var completePage = document.getElementById('course-data-analyst-complete');
        if (completePage && completePage.style.display !== 'none' && completePage.classList.contains('active')) {
          if (!entry.isIntersecting) {
            daCompleteStickyBar.classList.add('visible');
          } else {
            daCompleteStickyBar.classList.remove('visible');
          }
        } else {
          daCompleteStickyBar.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    daCompleteStickyObserver.observe(daCompleteHeroSection);
  }

  // --- Sticky Mobile CTA for ML Interview Kit ---
  var mlStickyBar = document.getElementById('mlkitStickyMobileCta');
  var mlHeroSection = document.querySelector('#course-ai-automation .dakit-hero');

  if (mlStickyBar && mlHeroSection) {
    var mlStickyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var mlPage = document.getElementById('course-ai-automation');
        if (mlPage && mlPage.style.display !== 'none' && mlPage.classList.contains('active')) {
          mlStickyBar.classList.toggle('visible', !entry.isIntersecting);
        } else {
          mlStickyBar.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    mlStickyObserver.observe(mlHeroSection);
  }

  // --- Social Proof Toast (Triggers 2 times in 3 minutes = every 90 seconds) ---
  var socialToast = document.getElementById('dakitSocialToast');
  var toastCountEl = document.getElementById('toastGrabbedCount');
  var currentGrabbedCount = 557;

  function triggerSocialToast() {
    if (!socialToast) {
      socialToast = document.getElementById('dakitSocialToast');
      if (!socialToast) return;
    }
    if (!toastCountEl) {
      toastCountEl = document.getElementById('toastGrabbedCount');
    }
    currentGrabbedCount += Math.floor(Math.random() * 2) + 1;
    if (toastCountEl) {
      toastCountEl.textContent = currentGrabbedCount + '+';
    }
    socialToast.classList.add('show');
    setTimeout(function() {
      if (socialToast) socialToast.classList.remove('show');
    }, 6500);
  }

  // Initial trigger after 4 seconds, then recurring every 90 seconds (2 times in 3 minutes)
  setTimeout(function() {
    triggerSocialToast();
    setInterval(triggerSocialToast, 90000);
  }, 4000);

  // Close toast button
  var toastClose = document.getElementById('dakitToastClose');
  if (toastClose) {
    toastClose.addEventListener('click', function() {
      if (socialToast) socialToast.classList.remove('show');
    });
  }

  // --- Hide sticky bars when navigating away ---
  var origShowDashboard = window.showDashboard;
  if (typeof origShowDashboard === 'function') {
    window.showDashboard = function() {
      if (stickyBar) stickyBar.classList.remove('visible');
      if (daCompleteStickyBar) daCompleteStickyBar.classList.remove('visible');
      if (mlStickyBar) mlStickyBar.classList.remove('visible');
      origShowDashboard.apply(this, arguments);
    };
  }

})();

// ── Sample Page Lightbox Zoom Modal ──
function openSamplePageModal(src) {
  var modal = document.getElementById('samplePageModal');
  var img = document.getElementById('samplePageModalImg');
  if (modal && img) {
    // The shared modal is declared inside the DA page container. Move it to the
    // document root so it remains visible when another course page is active.
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    img.src = src;
    var downloadLink = modal.querySelector('.dakit-sample-modal-footer a');
    if (downloadLink && String(src).indexOf('images/ml-page/') !== -1) {
      downloadLink.href = 'pdfs/ml-25-page.pdf';
      downloadLink.textContent = 'VIEW 25 SAMPLE QUESTIONS FREE →';
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeSamplePageModal(e) {
  if (e && e.target && e.target.id !== 'samplePageModal' && !e.target.classList.contains('dakit-sample-modal-close')) {
    return;
  }
  var modal = document.getElementById('samplePageModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeSamplePageModal();
  }
});

// ── Author Note Language Switcher ──
function switchAuthorNoteLang(btn, lang) {
  var section = btn.closest('.ll-author-note-section');
  if (!section) return;

  var tabs = section.querySelectorAll('.ll-lang-tab');
  tabs.forEach(function(t) {
    if (t.getAttribute('data-lang') === lang) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  var contents = section.querySelectorAll('.ll-note-content');
  contents.forEach(function(c) {
    if (c.classList.contains('ll-note-' + lang)) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
}
