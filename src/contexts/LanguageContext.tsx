import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'English' | 'हिन्दी' | 'Hinglish';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  English: {
    heroTitle: 'All your shop stock, in one tap.',
    heroSubtitle: 'Live stock, best prices, and route delivery.',
    browseStock: 'Browse stock & order',
    trackOrder: 'Track my order',
    todayDeals: "Today's hot deals",
    loading: 'Loading inventory...',
    realTimeStock: 'Real-time stock',
    realTimeStockDesc: 'Visible stock levels, no surprises.',
    routeDelivery: 'Route-wise delivery',
    routeDeliveryDesc: '6 routes, fixed days.',
    bestPrice: 'Best wholesale price',
    bestPriceDesc: 'MRP vs best price clearly visible.',
  },
  'हिन्दी': {
    heroTitle: 'आपकी दुकान का सारा सामान, एक क्लिक में।',
    heroSubtitle: 'लाइव स्टॉक, सबसे अच्छे दाम, और समय पर डिलीवरी।',
    browseStock: 'स्टॉक देखें और ऑर्डर करें',
    trackOrder: 'अपना ऑर्डर ट्रैक करें',
    todayDeals: 'आज की खास डील',
    loading: 'सामान लोड हो रहा है...',
    realTimeStock: 'असली स्टॉक',
    realTimeStockDesc: 'जो है वही दिखेगा। कोई धोखा नहीं।',
    routeDelivery: 'रूट के हिसाब से डिलीवरी',
    routeDeliveryDesc: '6 रूट, तय दिन। आपकी दुकान तक।',
    bestPrice: 'सबसे सस्ता दाम',
    bestPriceDesc: 'MRP और आपके दाम का अंतर साफ दिखेगा।',
  },
  Hinglish: {
    heroTitle: 'Aapki dukan ka saara saamaan, ek tap mein.',
    heroSubtitle: 'Live stock, MRP vs best price aur route delivery.',
    browseStock: 'Browse stock & order',
    trackOrder: 'Track my order',
    todayDeals: "Today's hot deals",
    loading: 'Loading inventory...',
    realTimeStock: 'Real-time stock',
    realTimeStockDesc: 'Wahi dikhega jo available hai. No surprises.',
    routeDelivery: 'Route-wise delivery',
    routeDeliveryDesc: '6 routes, fixed days. Aapke shop pe direct.',
    bestPrice: 'Best wholesale price',
    bestPriceDesc: 'MRP vs aapka price clearly visible.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'Hinglish';
  });

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
