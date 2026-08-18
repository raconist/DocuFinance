/**
 * DocuFinance AI - Payment Routing & Settings Engine
 * Supports PayTR, Shopier, LemonSqueezy, Stripe, and Direct Bank Transfer (IBAN)
 */

const STORAGE_KEY_SETTINGS = 'docufinance_admin_payment_settings_v2';
const STORAGE_KEY_PROMOS = 'docufinance_admin_promo_codes_v2';

export const DEFAULT_PAYMENT_GATEWAYS = {
  // 🇹🇷 Türkiye: PayTR (En düşük oranlı şahıs/şirket Sanal POS)
  paytr: {
    name: 'PayTR Sanal POS (En Düşük Komisyon %1.8)',
    type: 'local',
    enabled: true,
    merchantId: '948201',
    proMonthlyUrl: 'https://paytr.com/odeme/docufinance-pro-aylik',
    proAnnualUrl: 'https://paytr.com/odeme/docufinance-pro-yillik',
    singlePassUrl: 'https://paytr.com/odeme/docufinance-tek-ekstre'
  },
  // 🇹🇷 Türkiye: Shopier (Şirketsiz Şahıslar İçin 0 Bürokrasi)
  shopier: {
    name: 'Shopier (Şirketsiz Bireysel Kart & Taksit)',
    type: 'local',
    enabled: true,
    proMonthlyUrl: 'https://shopier.com/docufinance_pro_aylik',
    proAnnualUrl: 'https://shopier.com/docufinance_pro_yillik',
    singlePassUrl: 'https://shopier.com/docufinance_tek_seferlik'
  },
  // 🌐 Global / Yurt Dışı: LemonSqueezy (Yetkili Satıcı - MoR - Türkiye'ye Yasal Para Girişi)
  lemonsqueezy: {
    name: 'LemonSqueezy (Global Card, Apple Pay, PayPal & Tax Management)',
    type: 'global',
    enabled: true,
    storeId: 'docufinance_store',
    proMonthlyUrl: 'https://docufinance.lemonsqueezy.com/buy/pro-monthly',
    proAnnualUrl: 'https://docufinance.lemonsqueezy.com/buy/pro-annual',
    singlePassUrl: 'https://docufinance.lemonsqueezy.com/buy/single-pass'
  },
  // 🏛️ Havale / EFT / FAST (Sıfır Komisyon Doğrudan Banka Transferi)
  bankTransfer: {
    name: 'Banka Havale / EFT / FAST',
    type: 'local',
    enabled: true,
    bankName: 'Garanti BBVA A.Ş.',
    accountHolder: 'DocuFinance AI FinTeknoloji',
    iban: 'TR45 0006 2000 0001 2345 6789 01',
    branchCode: '6298'
  }
};

export const PAYMENT_GATEWAYS = DEFAULT_PAYMENT_GATEWAYS;

export const DEFAULT_PROMOS = {
  LAUNCH50: {
    code: 'LAUNCH50',
    discountPercent: 50,
    description: '%50 Lansman İndirimi',
    active: true,
    usageCount: 42
  },
  DOCU2026: {
    code: 'DOCU2026',
    discountPercent: 30,
    description: '%30 Özel Yıl Dönümü İndirimi',
    active: true,
    usageCount: 18
  },
  MUHASEBE100: {
    code: 'MUHASEBE100',
    discountPercent: 100,
    description: '1 Ay Ücretsiz Tam Pro Erişim (Mali Müşavir Özel)',
    active: true,
    usageCount: 89
  }
};

// Get active payment settings
export function getPaymentSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_PAYMENT_GATEWAYS;
}

// Save payment settings from Admin Panel
export function savePaymentSettings(settings) {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

// Get all promo codes
export function getPromoCodes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMOS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_PROMOS;
}

// Save promo codes from Admin Panel
export function savePromoCodes(promos) {
  localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(promos));
}

// Validate Promo Code
export function validatePromoCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  const allPromos = getPromoCodes();

  if (allPromos[cleanCode] && allPromos[cleanCode].active !== false) {
    return {
      isValid: true,
      ...allPromos[cleanCode]
    };
  }
  return { isValid: false };
}
