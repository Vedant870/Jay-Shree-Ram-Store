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
    navCatalog: 'Catalog',
    navTrackOrder: 'Track Order',
    navAdminPanel: 'Admin Panel',
    navLogin: 'Login',
    navCart: 'Cart',
    todayDeals: "Today's hot deals",
    loading: 'Loading inventory...',
    realTimeStock: 'Real-time stock',
    realTimeStockDesc: 'Visible stock levels, no surprises.',
    routeDelivery: 'Route-wise delivery',
    routeDeliveryDesc: '6 routes, fixed days.',
    bestPrice: 'Best wholesale price',
    bestPriceDesc: 'MRP vs best price clearly visible.',
    shoppingCartTitle: 'Shopping Cart',
    shoppingCartDesc: 'Review your selected items before checkout.',
    customerDetails: 'Customer Details',
    fullNameShop: 'Full Name / Shop Name',
    phoneNumber: 'Phone Number',
    fullAddress: 'Full Address',
    specialNoteOptional: 'Special Note (Optional)',
    routeDeliveryArea: 'Route (Delivery Area)',
    subtotal: 'Subtotal',
    total: 'Total',
    placeOrderNow: 'Place Order Now',
    processing: 'Processing...',
    onlyTenDigits: 'Only 10 digits allowed',
  },
  'हिन्दी': {
    heroTitle: 'आपकी दुकान का सारा सामान, एक क्लिक में।',
    heroSubtitle: 'लाइव स्टॉक, सबसे अच्छे दाम, और समय पर डिलीवरी।',
    browseStock: 'स्टॉक देखें और ऑर्डर करें',
    trackOrder: 'अपना ऑर्डर ट्रैक करें',
    navCatalog: 'कैटलॉग',
    navTrackOrder: 'ऑर्डर ट्रैक करें',
    navAdminPanel: 'एडमिन पैनल',
    navLogin: 'लॉगिन',
    navCart: 'कार्ट',
    todayDeals: 'आज की खास डील',
    loading: 'सामान लोड हो रहा है...',
    realTimeStock: 'असली स्टॉक',
    realTimeStockDesc: 'जो है वही दिखेगा। कोई धोखा नहीं।',
    routeDelivery: 'रूट के हिसाब से डिलीवरी',
    routeDeliveryDesc: '6 रूट, तय दिन। आपकी दुकान तक।',
    bestPrice: 'सबसे सस्ता दाम',
    bestPriceDesc: 'MRP और आपके दाम का अंतर साफ दिखेगा।',
    shoppingCartTitle: 'शॉपिंग कार्ट',
    shoppingCartDesc: 'चेकआउट से पहले चुने हुए सामान को देख लें।',
    customerDetails: 'ग्राहक की जानकारी',
    fullNameShop: 'पूरा नाम / दुकान का नाम',
    phoneNumber: 'फोन नंबर',
    fullAddress: 'पूरा पता',
    specialNoteOptional: 'खास नोट (वैकल्पिक)',
    routeDeliveryArea: 'रूट (डिलीवरी एरिया)',
    subtotal: 'उप-योग',
    total: 'कुल',
    placeOrderNow: 'अभी ऑर्डर करें',
    processing: 'प्रोसेस हो रहा है...',
    onlyTenDigits: 'सिर्फ 10 अंक मान्य हैं',
  },
  Hinglish: {
    heroTitle: 'Aapki dukan ka saara saamaan, ek tap mein.',
    heroSubtitle: 'Live stock, MRP vs best price aur route delivery.',
    browseStock: 'Browse stock & order',
    trackOrder: 'Track my order',
    navCatalog: 'Catalog',
    navTrackOrder: 'Track Order',
    navAdminPanel: 'Admin Panel',
    navLogin: 'Login',
    navCart: 'Cart',
    todayDeals: "Today's hot deals",
    loading: 'Loading inventory...',
    realTimeStock: 'Real-time stock',
    realTimeStockDesc: 'Wahi dikhega jo available hai. No surprises.',
    routeDelivery: 'Route-wise delivery',
    routeDeliveryDesc: '6 routes, fixed days. Aapke shop pe direct.',
    bestPrice: 'Best wholesale price',
    bestPriceDesc: 'MRP vs aapka price clearly visible.',
    shoppingCartTitle: 'Shopping Cart',
    shoppingCartDesc: 'Checkout se pehle selected items review kar lo.',
    customerDetails: 'Customer Details',
    fullNameShop: 'Full Name / Shop Name',
    phoneNumber: 'Phone Number',
    fullAddress: 'Full Address',
    specialNoteOptional: 'Special Note (Optional)',
    routeDeliveryArea: 'Route (Delivery Area)',
    subtotal: 'Subtotal',
    total: 'Total',
    placeOrderNow: 'Place Order Now',
    processing: 'Processing...',
    onlyTenDigits: 'Sirf 10 digits allowed',
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
