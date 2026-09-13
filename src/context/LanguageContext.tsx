import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { translations, TranslationKey } from '../i18n/translations';

export type Language = 'fr' | 'ar';

export interface CustomTextsState {
  fr: Record<string, string>;
  ar: Record<string, string>;
}

const STORAGE_KEY_LANG = 'roketlead_lang';
const STORAGE_KEY_CUSTOM_TEXTS = 'roketlead_custom_texts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  customTexts: CustomTextsState;
  updateCustomText: (lang: Language, key: string, value: string) => void;
  batchUpdateCustomTexts: (newTexts: { fr?: Record<string, string>; ar?: Record<string, string> }) => void;
  resetCustomKey: (lang: Language, key: string) => void;
  resetSection: (sectionKeys: string[], lang?: Language) => void;
  resetAllCustomTexts: () => void;
  getCustomText: (lang: Language, key: string) => string | undefined;
  getDefaultText: (lang: Language, key: string) => string;
  isCustomized: (lang: Language, key: string) => boolean;
  hasAnyCustomizations: boolean;
  customCount: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return (saved === 'ar' || saved === 'fr') ? saved : 'fr';
  });

  const [customTexts, setCustomTexts] = useState<CustomTextsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_TEXTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fr: parsed.fr || {},
          ar: parsed.ar || {}
        };
      }
    } catch {
      // Fallback on JSON parse error
    }
    return { fr: {}, ar: {} };
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', dir);
  }, [language, dir]);

  // Persist custom texts to localStorage
  const saveCustomTexts = (newTexts: CustomTextsState) => {
    setCustomTexts(newTexts);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TEXTS, JSON.stringify(newTexts));
    } catch (err) {
      console.error('Failed to persist custom texts:', err);
    }
  };

  const updateCustomText = useCallback((lang: Language, key: string, value: string) => {
    setCustomTexts(prev => {
      const langDict = { ...prev[lang] };
      const defaultVal = (translations as any)[lang]?.[key] || (translations as any).fr?.[key] || '';
      
      if (value.trim() === '' || value === defaultVal) {
        delete langDict[key];
      } else {
        langDict[key] = value;
      }
      
      const updated: CustomTextsState = {
        ...prev,
        [lang]: langDict
      };
      
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_TEXTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist custom texts:', err);
      }
      return updated;
    });
  }, []);

  const batchUpdateCustomTexts = useCallback((newTexts: { fr?: Record<string, string>; ar?: Record<string, string> }) => {
    setCustomTexts(prev => {
      const updated: CustomTextsState = {
        fr: { ...prev.fr, ...(newTexts.fr || {}) },
        ar: { ...prev.ar, ...(newTexts.ar || {}) }
      };

      // Clean up identical to default
      (['fr', 'ar'] as Language[]).forEach(lang => {
        Object.keys(updated[lang]).forEach(k => {
          const defaultVal = (translations as any)[lang]?.[k] || (translations as any).fr?.[k] || '';
          if (updated[lang][k] === defaultVal || updated[lang][k].trim() === '') {
            delete updated[lang][k];
          }
        });
      });

      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_TEXTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist custom texts:', err);
      }
      return updated;
    });
  }, []);

  const resetCustomKey = useCallback((lang: Language, key: string) => {
    setCustomTexts(prev => {
      if (!prev[lang][key]) return prev;
      const langDict = { ...prev[lang] };
      delete langDict[key];
      const updated = { ...prev, [lang]: langDict };
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_TEXTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist custom texts:', err);
      }
      return updated;
    });
  }, []);

  const resetSection = useCallback((sectionKeys: string[], targetLang?: Language) => {
    setCustomTexts(prev => {
      const updated = {
        fr: { ...prev.fr },
        ar: { ...prev.ar }
      };

      const langsToReset: Language[] = targetLang ? [targetLang] : ['fr', 'ar'];
      langsToReset.forEach(lang => {
        sectionKeys.forEach(key => {
          delete updated[lang][key];
        });
      });

      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_TEXTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist custom texts:', err);
      }
      return updated;
    });
  }, []);

  const resetAllCustomTexts = useCallback(() => {
    const empty: CustomTextsState = { fr: {}, ar: {} };
    saveCustomTexts(empty);
  }, []);

  const getCustomText = useCallback((lang: Language, key: string): string | undefined => {
    return customTexts[lang]?.[key];
  }, [customTexts]);

  const getDefaultText = useCallback((lang: Language, key: string): string => {
    return (translations as any)[lang]?.[key] || (translations as any).fr?.[key] || key;
  }, []);

  const isCustomized = useCallback((lang: Language, key: string): boolean => {
    const val = customTexts[lang]?.[key];
    return val !== undefined && val !== null && val.trim() !== '';
  }, [customTexts]);

  const customCount = useMemo(() => {
    return Object.keys(customTexts.fr).length + Object.keys(customTexts.ar).length;
  }, [customTexts]);

  const hasAnyCustomizations = customCount > 0;

  const t = useCallback((key: TranslationKey | string): string => {
    // 1. Check custom overrides for current language
    const customVal = customTexts[language]?.[key];
    if (customVal !== undefined && customVal !== null && customVal.trim() !== '') {
      return customVal;
    }

    // 2. Fallback to dictionary
    const langDict = (translations as any)[language] || translations.fr;
    return langDict[key] || (translations.fr as any)[key] || key;
  }, [language, customTexts]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isRTL,
      dir,
      customTexts,
      updateCustomText,
      batchUpdateCustomTexts,
      resetCustomKey,
      resetSection,
      resetAllCustomTexts,
      getCustomText,
      getDefaultText,
      isCustomized,
      hasAnyCustomizations,
      customCount
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

