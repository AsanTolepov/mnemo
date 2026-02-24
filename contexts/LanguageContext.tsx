import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../services/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('mnemo_language');
        return (saved as Language) || 'uz';
    });

    useEffect(() => {
        localStorage.setItem('mnemo_language', language);
    }, [language]);

    const t = (key: string): string => {
        if (!translations[key]) return key;
        return translations[key][language] || translations[key]['uz'];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
