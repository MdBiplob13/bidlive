"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations, DEFAULT_LOCALE, LOCALES } from "./translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "bidlive_locale";

function resolve(obj, path) {
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const initial = LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
    setLocaleState(initial);
    document.documentElement.lang = initial;
    setMounted(true);
  }, []);

  const setLocale = useCallback((next) => {
    if (!LOCALES.includes(next)) return;
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "bn" ? "en" : "bn");
  }, [locale, setLocale]);

  /** t("nav.home") -> localized string; falls back to en then the key. */
  const t = useCallback(
    (key, vars) => {
      let str =
        resolve(translations[locale], key) ??
        resolve(translations.en, key) ??
        key;
      if (vars && typeof str === "string") {
        str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
      }
      return str;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
