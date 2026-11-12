const DEFAULT_LANG = 'it';
let translations = {};

async function loadTranslations() {
  const res = await fetch('./translations.json');
  return res.json();
}

function applyLanguage(lang) {
  const dict = translations[lang] || translations[DEFAULT_LANG];
  if (!dict) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('everlia_lang', lang);
  document.documentElement.lang = lang;
}

(async function initLang() {
  try {
    translations = await loadTranslations();
  } catch (err) {
    console.error('Erreur chargement traductions :', err);
    return;
  }

  const saved = localStorage.getItem('everlia_lang');
  const browserLang = (navigator.language || 'it').slice(0, 2);
  const initial = saved || (['it', 'en', 'fr'].includes(browserLang) ? browserLang : DEFAULT_LANG);

  applyLanguage(initial);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });
})();
