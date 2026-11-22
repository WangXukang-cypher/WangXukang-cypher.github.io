const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const languageToggle = document.querySelector('#language-toggle');
const progressBar = document.querySelector('#reading-progress-bar');
const navLinks = [...document.querySelectorAll('.section-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];

const savedTheme = localStorage.getItem('wx-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
root.dataset.theme = savedTheme || (prefersDark ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('wx-theme', next);
});

let language = localStorage.getItem('wx-language') || 'en';

function applyLanguage() {
  root.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-en][data-zh]').forEach((node) => {
    node.textContent = node.dataset[language];
  });
  languageToggle.textContent = language === 'en' ? '中文' : 'EN';
  languageToggle.setAttribute('aria-label', language === 'en' ? '切换至中文' : 'Switch to English');
  document.title = language === 'en' ? 'Wang Xukang · AI Research' : '汪旭康 · 人工智能研究';
}

languageToggle.addEventListener('click', () => {
  language = language === 'en' ? 'zh' : 'en';
  localStorage.setItem('wx-language', language);
  applyLanguage();
});

applyLanguage();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
}, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.5] });

sections.forEach((section) => sectionObserver.observe(section));

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();
