/**
 * DocuFinance AI - Payment Routing & Settings Engine
 * Supports PayTR, Shopier, LemonSqueezy, Stripe, and Direct Bank Transfer (IBAN)
 */

const STORAGE_KEY_SETTINGS = 'docufinance_admin_payment_settings_v5';
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
  // 🇹🇷 Türkiye: Shopier (Şirketsiz Bireysel Kart & Taksit)
  shopier: {
    name: 'Shopier (Şirketsiz Bireysel Kart & Taksit)',
    type: 'local',
    enabled: true,
    proMonthlyUrl: 'https://www.shopier.com/50024234',
    proAnnualUrl: 'https://www.shopier.com/50024271',
    singlePassUrl: 'https://www.shopier.com/50024234'
  },
  // 🌐 Global / Yurt Dışı: LemonSqueezy / Paddle (Yetkili Satıcı - MoR - Türkiye'ye Yasal Para Girişi)
  lemonsqueezy: {
    name: 'LemonSqueezy / Paddle (Global Card, Apple Pay, PayPal & Tax Management)',
    type: 'global',
    enabled: true,
    storeId: 'docufinance',
    proMonthlyUrl: 'https://docufinance.lemonsqueezy.com/checkout/buy/75260f6e-61df-427a-88e3-5af4360a0f9f',
    proAnnualUrl: 'https://docufinance.lemonsqueezy.com/checkout/buy/944de374-39c3-45a1-bff3-4b4ebfeb8275',
    singlePassUrl: 'https://docufinance.lemonsqueezy.com/checkout/buy/75260f6e-61df-427a-88e3-5af4360a0f9f'
  },
  // 🏛️ Havale / EFT / FAST (Sıfır Komisyon Doğrudan Banka Transferi)
  bankTransfer: {
    name: 'Banka Havale / EFT / FAST',
    type: 'local',
    enabled: true,
    bankName: 'Türk Ekonomi Bankası (TEB)',
    accountHolder: 'Recep Yıldız / DocuFinance AI',
    iban: 'TR02 0003 2000 0000 0088 0175 88',
    branchCode: '0032'
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
