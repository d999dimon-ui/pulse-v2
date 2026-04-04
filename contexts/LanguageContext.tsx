"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getDefaultLanguage } from '@/utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedLang = localStorage.getItem('language');
      if (savedLang === 'en' || savedLang === 'ru') {
        setLanguageState(savedLang);
      } else {
        setLanguageState(getDefaultLanguage());
      }
    } catch (e) {
      console.error('Language init error:', e);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('language', lang); } catch (e) {}
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
