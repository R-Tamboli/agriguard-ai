import { useEffect, useState } from 'react';
import { LanguageContext } from './LanguageContext';

const storageKey = 'agriguard.language';
const english = (en) => en;
const hindi = (_en, hi) => hi;

function initialLanguage() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'en' || saved === 'hi') return saved;
  } catch {
    // The switch also works when the browser disables local storage.
  }

  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferences) {
    const language = tag?.split('-')[0].toLowerCase();
    if (language === 'hi' || language === 'en') return language;
  }
  return 'en';
}

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage);
  const t = language === 'hi' ? hindi : english;

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('AgriGuard AI — Precision Agriculture for a Hunger-Free 2030', 'एग्रीगार्ड एआई — किसानों के लिए खेती की सलाह');
  }, [language, t]);

  function changeLanguage(next) {
    setLanguage(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // Keep the selection for this visit when it cannot be saved.
    }
  }

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
