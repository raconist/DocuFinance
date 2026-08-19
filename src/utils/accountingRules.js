/**
 * DocuFinance AI - Universal Accounting Rule Engine
 * Supports:
 * - 🇹🇷 Turkey: Tek Düzen Hesap Planı (TDHP) (100 Kasa, 102 Banka, 770 Yönetim, 760 Pazarlama, 320 Satıcı, 120 Alıcı, 360/361 Vergi & SGK)
 * - 🇺🇸 Global / US: GAAP / QuickBooks / Xero (1000 Cash, 2000 AP, 5000 Operating Exp, 6000 Utilities, 4000 Revenue)
 * - 🇩🇪 DACH / Germany: DATEV SKR03 / SKR04 (1200 Bank, 4900 Aufwand, 1600 Verbindlichkeiten, 8400 Erlöse)
 */

const STORAGE_KEY_CUSTOM_RULES = 'docufinance_custom_accounting_rules_v1';

export const DEFAULT_ACCOUNTING_RULES = [
  // --- 🇹🇷 TÜRKİYE TDHP & YEREL KURUMLAR ---
  // Akaryakıt & Ulaşım (770.03 Taşıt / Nakliye)
  { id: 'tr_fuel_1', keywords: ['SHELL', 'OPET', 'BP ', 'PO ', 'PETROL OFISI', 'TOTAL', 'AYGAZ', 'LUKOIL'], accountCode: '770.03', category: 'Taşıt & Akaryakıt', standard: 'tdhp' },
  { id: 'tr_transport_1', keywords: ['HGS', 'OGS', 'KGM', 'AVRASYA TUNEL', 'ICA ', 'OTOBAN', 'ISPARK'], accountCode: '770.04', category: 'Ulaşım & Otoyol', standard: 'tdhp' },
  { id: 'tr_flight_1', keywords: ['THY', 'TURK HAVA', 'PEGASUS', 'AJET', 'SUNEXPRESS', 'UBER', 'BITAKSI'], accountCode: '770.05', category: 'Seyahat & Uçak', standard: 'tdhp' },

  // Yemek & Temsil Ağırlama (770.01 Yemek)
  { id: 'tr_food_1', keywords: ['MIGROS', 'BIM ', 'A101', 'SOK ', 'CARREFOUR', 'METRO GROSS', 'YEMEKSEPETI', 'GETIR', 'TRENDYOL YEMEK', 'MULTINET', 'SODEXO', 'TICKET'], accountCode: '770.01', category: 'Yemek & Mutfak Gideri', standard: 'tdhp' },
  { id: 'tr_restaurant_1', keywords: ['RESTORAN', 'CAFE', 'KAHVE', 'STARBUCKS', 'ESPRESSO', 'LOKANTA'], accountCode: '770.01', category: 'Temsil & Ağırlama', standard: 'tdhp' },

  // İletişim & Bilişim & SaaS (770.02 İletişim / 770.07 Yazılım)
  { id: 'tr_telecom_1', keywords: ['TURKCELL', 'VODAFONE', 'TURK TELEKOM', 'TTNET', 'TURKNET', 'SUPERONLINE'], accountCode: '770.02', category: 'İletişim & İnternet', standard: 'tdhp' },
  { id: 'tr_software_1', keywords: ['GOOGLE', 'MICROSOFT', 'AWS', 'AMAZON WEB', 'OPENAI', 'ADOBE', 'CANVA', 'FIGMA', 'NOTION', 'ZOOM', 'SLACK', 'NETFLIX', 'SPOTIFY'], accountCode: '770.07', category: 'Yazılım & Bulut Hizmetleri', standard: 'tdhp' },

  // Ofis, Kırtasiye & Kargo (770.06 Ofis / 770.08 Kargo)
  { id: 'tr_office_1', keywords: ['IKEA', 'KOCTAS', 'BAUHAUS', 'KIRTASIYE', 'OFIS', 'HEPSIBURADA', 'TRENDYOL', 'AMAZON.COM.TR', 'AMZN'], accountCode: '770.06', category: 'Ofis & Kırtasiye Gideri', standard: 'tdhp' },
  { id: 'tr_cargo_1', keywords: ['YURTICI KARGO', 'ARAS KARGO', 'MNG KARGO', 'SURAT KARGO', 'PTT KARGO', 'UPS KARGO', 'DHL', 'FEDEX'], accountCode: '770.08', category: 'Kargo & Kurye', standard: 'tdhp' },

  // Yasal Yükümlülükler & Vergiler & SGK (360 / 361 / 770.09)
  { id: 'tr_tax_1', keywords: ['VERGI DAIRESI', 'GIB ', 'GELIR IDARESI', 'KDV ', 'GECICI VERGI', 'KURUMLAR VERGISI', 'MUHTASAR'], accountCode: '360.01', category: 'Vergi Ödemeleri', standard: 'tdhp' },
  { id: 'tr_sgk_1', keywords: ['SGK', 'SOSYAL GUVENLIK', 'BAGKUR', 'GSS ', 'ISKUR'], accountCode: '361.01', category: 'SGK & Prim Ödemeleri', standard: 'tdhp' },
  { id: 'tr_bank_fee_1', keywords: ['BSMV', 'KKDF', 'HESAP ISLETIM', 'KOMISYON', 'EFT UCRETI', 'HAVALE UCRETI', 'POS KOMISYON', 'FAIZ TAHAKKUK'], accountCode: '770.09', category: 'Banka Masraf & Komisyonları', standard: 'tdhp' },

  // Maaş & Personel (335 / 770.10)
  { id: 'tr_salary_1', keywords: ['MAAS', 'PERSONEL', 'AVANS', 'TUTAR AKTARIMI', 'IKRAMIYE', 'HUZUR HAKKI'], accountCode: '335.01', category: 'Personel Maaş & Avans', standard: 'tdhp' },

  // Tahsilat & Satış Gelirleri (600 Yurtiçi Satışlar / 120 Alıcılar)
  { id: 'tr_pos_inflow_1', keywords: ['POS BLOKE COZUMU', 'POS ALACAK', 'GUNCEL POS', 'PAYTR', 'SHOPIER', 'IYZICO', 'STRIPE', 'FATURA TAHSILATI', 'CARI TAHSILAT'], accountCode: '600.01', category: 'Satış & POS Gelirleri', standard: 'tdhp' },

  // --- 🇺🇸 GLOBAL / US GAAP & UK IFRS ---
  { id: 'us_cash_1', keywords: ['BANK TRANSFER', 'DEPOSIT', 'WIRE IN', 'STRIPE PAYOUT', 'PAYPAL TRANSFER', 'ACH CREDIT'], accountCode: '1000', category: 'Operating Revenue / Cash', standard: 'gaap' },
  { id: 'us_saas_1', keywords: ['AWS', 'GOOGLE CLOUD', 'GITHUB', 'HEROKU', 'DATADOG', 'HUBSPOT', 'SALESFORCE'], accountCode: '5010', category: 'Hosting & SaaS Tools', standard: 'gaap' },
  { id: 'us_travel_1', keywords: ['UBER', 'LYFT', 'DELTA', 'UNITED AIRLINES', 'AMERICAN AIR', 'AIRBNB', 'MARRIOTT'], accountCode: '5020', category: 'Travel & Transportation', standard: 'gaap' },
  { id: 'us_office_1', keywords: ['WEWORK', 'STAPLES', 'OFFICE DEPOT', 'APPLE STORE', 'BEST BUY'], accountCode: '5030', category: 'Office Supplies & Rent', standard: 'gaap' },
  { id: 'us_marketing_1', keywords: ['FACEBOOK ADS', 'META ADS', 'GOOGLE ADS', 'LINKEDIN ADS', 'TIKTOK ADS'], accountCode: '5040', category: 'Advertising & Marketing', standard: 'gaap' },

  // --- 🇩🇪 GERMANY / DACH (DATEV SKR03 / SKR04) ---
  { id: 'de_erloese_1', keywords: ['KUNDENZAHLUNG', 'RECHNUNGSAUSGLEICH', 'GUTSCHRIFT', 'UMSATZ'], accountCode: '8400', category: 'Erlöse 19% USt', standard: 'datev' },
  { id: 'de_miete_1', keywords: ['MIETE', 'NEBENKOSTEN', 'KAUTION', 'IMMOBILIEN'], accountCode: '4210', category: 'Miete / Raumkosten', standard: 'datev' },
  { id: 'de_kfz_1', keywords: ['ARAL', 'SHELL', 'TANKEN', 'BENZIN', 'DIESEL', 'DEUTSCHE BAHN', 'SIXT'], accountCode: '4530', category: 'Laufende Kfz-Betriebskosten', standard: 'datev' },
  { id: 'de_it_1', keywords: ['TELEKOM', 'VODAFONE', 'STRATO', 'IONOS', 'SOFTWARE', 'HOSTING'], accountCode: '4920', category: 'Telefon, Internet & Software', standard: 'datev' }
];

/**
 * Get user custom rules merged with default rules
 */
export function getAccountingRules() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_ACCOUNTING_RULES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_RULES);
    if (raw) {
      const custom = JSON.parse(raw);
      if (Array.isArray(custom)) {
        return [...custom, ...DEFAULT_ACCOUNTING_RULES];
      }
    }
  } catch (e) {
    console.error('Failed to load custom rules:', e);
  }
  return DEFAULT_ACCOUNTING_RULES;
}

/**
 * Save user custom rules
 */
export function saveCustomRules(customRules = []) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_RULES, JSON.stringify(customRules));
  } catch (e) {
    console.error('Failed to save custom rules:', e);
  }
}

/**
 * Match a single transaction description to the optimal accounting code and category
 */
export function matchTransactionRule(description = '', amount = 0, standard = 'tdhp') {
  if (!description) {
    return {
      accountCode: standard === 'tdhp' ? '770.99' : standard === 'datev' ? '4900' : '5090',
      category: 'Genel Gider / Miscellaneous',
      matchedRule: null,
      confidence: 0
    };
  }

  const cleanDesc = description.toUpperCase().replace(/[^A-Z0-9ĞÜŞİÖÇ\s]/g, ' ');
  const rules = getAccountingRules();

  // 1. Direct Keyword Match
  for (const rule of rules) {
    if (rule.standard && rule.standard !== standard && standard !== 'all') {
      continue;
    }

    for (const keyword of rule.keywords) {
      if (cleanDesc.includes(keyword.toUpperCase())) {
        return {
          accountCode: rule.accountCode,
          category: rule.category,
          matchedRule: rule.id,
          matchedKeyword: keyword,
          confidence: 0.95
        };
      }
    }
  }

  // 2. Amount-based heuristic (Credit/Inflow vs Debit/Outflow)
  if (amount > 0) {
    return {
      accountCode: standard === 'tdhp' ? '600.01' : standard === 'datev' ? '8400' : '4000',
      category: 'Satış / Gelir (Inflow)',
      matchedRule: 'heuristic_inflow',
      confidence: 0.70
    };
  }

  return {
    accountCode: standard === 'tdhp' ? '770.99' : standard === 'datev' ? '4900' : '5000',
    category: 'Diğer Genel Giderler',
    matchedRule: 'heuristic_outflow',
    confidence: 0.50
  };
}

/**
 * Batch categorize an entire transaction array
 */
export function categorizeTransactions(transactions = [], standard = 'tdhp') {
  return transactions.map(tx => {
    const desc = tx.description || tx.aciklama || tx.detail || '';
    const amount = Number(tx.amount || tx.tutar || (tx.credit || 0) - (tx.debit || 0)) || 0;
    const match = matchTransactionRule(desc, amount, standard);

    return {
      ...tx,
      accountCode: tx.accountCode || match.accountCode,
      category: tx.category || match.category,
      matchConfidence: match.confidence,
      matchedKeyword: match.matchedKeyword
    };
  });
}
