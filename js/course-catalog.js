/* Shared presentation data. Checkout destinations and regional rules stay in kit-payments.js/script.js. */
(function (root) {
  'use strict';
  const courses = [
    {
      id: 'aptitude-kit', path: '/aptitude-kit', state: 'coming-soon',
      title: 'Complete Placement & Technical Assessment Bundle', category: 'APTITUDE & PLACEMENT',
      description: 'Prepare for placement assessments, reasoning rounds and technical interviews.',
      image: 'images/light-theme/aptitude-kit-card-v1.png', width: 1536, height: 1024,
      stats: ['43 Handbooks', '3200+ Pages', '1500+ Questions'], availability: 'Coming soon on 30 OCT',
    },
    {
      id: 'data-science', path: '/course-bundles/data-scientist-genai-engineer-bundle', state: 'available',
      title: 'Data Scientist & Gen AI Complete Kit', category: 'DATA SCIENCE & GEN AI',
      description: 'Prepare for data science interviews, from core foundations to Generative AI.',
      image: 'images/light-theme/data-science-genai-card-v2.webp', width: 900, height: 600,
      stats: ['7 Modules', '60 Resources'], price: '₹499', strike: '₹1,499', discount: '67% OFF',
    },
    {
      id: 'ds-genai-ml', path: '/course-bundles/ds-genai-ml-complete-kit', state: 'available',
      title: 'Data Science + Gen AI + ML Engineer Complete Kit', category: 'ALL-IN-ONE COMPLETE KIT',
      description: 'Explore data science, Generative AI and machine learning in one complete kit.',
      stats: ['9 Modules', '80 Resources', '4500+ Practice Questions'], price: '₹899',
    },
    {
      id: 'ai-automation', path: '/course-bundles/machine-learning-interview-kit', state: 'available',
      title: 'Machine Learning Engineer Complete Kit', category: 'MACHINE LEARNING',
      description: 'Learn, practise and prepare with handbooks, workbooks and solution manuals.',
      image: 'images/light-theme/ml-interview-kit-card-v2.webp', width: 900, height: 600,
      stats: ['7 Modules', '60 Resources'], price: '₹499', strike: '₹1,499', discount: '67% OFF',
    },
    {
      id: 'data-analyst', path: '/course-bundles/data-bi-analyst-interview-kit', state: 'available',
      title: 'Data & BI Analyst with Gen AI Complete Kit', relatedTitle: 'Data & BI Analyst Interview Kit', category: 'DATA ANALYTICS',
      description: 'Prepare for analytics interviews with technical questions, scenarios and detailed answers.',
      image: 'images/light-theme/da-interview-kit-card-v2.webp', width: 900, height: 600,
      stats: ['8 Subjects', '2200+ Interview Questions'], price: '₹399', strike: '₹1,499', discount: '73% OFF',
    },
  ];
  const freeBooks = {
    'sql-handbook': { title: 'SQL 250+ Interview Questions', image: 'free-sql-handbook-v2.webp' },
    'ds-handbook': { title: 'Machine Learning Handbook (Part 1)', image: 'free-ml-handbook-v2.webp' },
    'eda-part01': {
      title: 'Exploratory Data Analysis Part-01', image: 'free-eda-handbook-v1.webp',
      description: 'Explore data, understand patterns and practise interview questions.',
      link: 'https://drive.google.com/file/d/10yTUHmbl0RkS_ZLxqB48KYbRpoWo-cAD/view?usp=sharing',
    },
    'big-data': {
      title: 'Big Data Management & Analytics', image: 'free-big-data-handbook-v1.webp',
      description: 'A free handbook for your big data and analytics learning journey.',
      link: 'https://drive.google.com/file/d/1C0bKsKoY0k0ZtPnFFdDHu6qSpLt1VC71/view?usp=drive_link',
    },
    'analytics-ground-zero': {
      title: 'ANALYTICS–GROUND ZERO', image: 'free-analytics-ground-zero-v1.webp',
      description: 'Start building your analytics foundations with this free handbook.',
      link: 'https://drive.google.com/file/d/1DiHU4m1TVkrFKVlaFtCNYWf1aZ5JKmoY/view?usp=sharing',
    },
  };
  const prices = new Map(courses.map(course => [course.id, {
    price: course.price || '', strike: course.strike || '', discount: course.discount || '',
  }]));
  const catalog = {
    courses, freeBooks,
    get(id) { return courses.find(course => course.id === id); },
    getPrice(id) { return { ...prices.get(id) }; },
    setPrice(id, values) {
      if (!prices.has(id)) return;
      prices.set(id, { ...prices.get(id), ...values });
      if (root.document) this.syncPrices(root.document);
    },
    syncPrices(container) {
      container.querySelectorAll('[data-catalog-price]').forEach(element => {
        const value = prices.get(element.dataset.catalogPrice)?.[element.dataset.priceField || 'price'];
        if (value !== undefined) element.textContent = value;
      });
    },
    href(id) {
      return root.location?.protocol === 'file:' ? 'index.html#' + id : this.get(id).path;
    },
  };
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.LearnlyticsCatalog = catalog;
})(globalThis);
