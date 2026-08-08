const DEFAULT_LANG = "ja";
const SUPPORTED_LANGS = ["ja", "en"];

const state = {
  lang: DEFAULT_LANG,
  translations: {},
};

const script = document.currentScript || document.querySelector('script[src$="assets/main.js"]');
const BASE_PATH = script?.dataset.base || ".";

function sitePath(path) {
  return `${BASE_PATH}/${path.replace(/^\//, "")}`;
}

function getStoredLanguage() {
  const stored = localStorage.getItem("rinro-language");
  if (SUPPORTED_LANGS.includes(stored)) return stored;
  const browserLang = navigator.language?.slice(0, 2);
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
}

async function loadTranslations(lang) {
  const response = await fetch(sitePath(`/lang/${lang}.json`));
  if (!response.ok) throw new Error(`Unable to load ${lang} translations`);
  return response.json();
}

function getValue(path, source) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function applyTranslations() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getValue(element.dataset.i18n, state.translations);
    if (typeof value === "string") element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":").map((item) => item.trim());
      const value = getValue(key, state.translations);
      if (attr && typeof value === "string") element.setAttribute(attr, value);
    });
  });
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.langButton === state.lang));
  });
}

async function setLanguage(lang) {
  state.lang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  state.translations = await loadTranslations(state.lang);
  localStorage.setItem("rinro-language", state.lang);
  applyTranslations();
  await renderNews();
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat(state.lang === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

async function renderNews() {
  const container = document.querySelector("[data-news-list]");
  if (!container) return;
  try {
    const response = await fetch(sitePath("/news.json"));
    if (!response.ok) throw new Error("Unable to load news");
    const news = await response.json();
    const sorted = news.slice().sort((a, b) => b.date.localeCompare(a.date));
    const limit = container.dataset.newsLimit ? Number(container.dataset.newsLimit) : sorted.length;
    const items = sorted.slice(0, limit);

    container.innerHTML = items
      .map((item) => {
        const title = state.lang === "ja" ? item.title_ja : item.title_en;
        const readLabel = state.translations.common?.readMore || "Read";
        const url = item.url.startsWith("/") ? sitePath(item.url) : item.url;
        return `
          <a class="news-item fade-in" href="${url}">
            <time class="news-date" datetime="${item.date}">${formatDate(item.date)}</time>
            <span class="news-title">${title}</span>
            <span class="button">${readLabel}</span>
          </a>
        `;
      })
      .join("");
  } catch (error) {
    container.innerHTML = `<p class="muted">${state.translations.news?.error || "News could not be loaded."}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langButton));
  });

  document.querySelectorAll("[data-back-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const referrer = document.referrer && new URL(document.referrer);
      const cameFromSite = referrer && referrer.origin === location.origin && document.referrer !== location.href;
      if (cameFromSite && history.length > 1) {
        event.preventDefault();
        history.back();
      }
    });
  });

  try {
    await setLanguage(getStoredLanguage());
  } catch (error) {
    state.lang = DEFAULT_LANG;
    state.translations = await loadTranslations(DEFAULT_LANG);
    applyTranslations();
    await renderNews();
  }
});
