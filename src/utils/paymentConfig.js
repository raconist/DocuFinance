/**
 * DocuFinance AI - Payment Routing & Promo Code Engine
 * Integrates Stripe, LemonSqueezy, Shopier, and PayTR
 */

export const PAYMENT_GATEWAYS = {
  lemonsqueezy: {
    name: 'LemonSqueezy (Global Card / Apple Pay)',
    type: 'global',
    proMonthlyUrl: 'https://docufinance.lemonsqueezy.com/buy/pro-monthly',
    proAnnualUrl: 'https://docufinance.lemonsqueezy.com/buy/pro-annual',
    singlePassUrl: 'https://docufinance.lemonsqueezy.com/buy/single-pass'
  },
  stripe: {
    name: 'Stripe Checkout',
    type: 'global',
    proMonthlyUrl: 'https://buy.stripe.com/docufinance_monthly',
    proAnnualUrl: 'https://buy.stripe.com/docufinance_annual',
    singlePassUrl: 'https://buy.stripe.com/docufinance_single'
  },
  shopier: {
    name: 'Shopier (Yerli Kart & Taksit)',
    type: 'local',
    proMonthlyUrl: 'https://shopier.com/docufinance_pro_aylik',
    proAnnualUrl: 'https://shopier.com/docufinance_pro_yillik',
    singlePassUrl: 'https://shopier.com/docufinance_tek_seferlik'
  },
  paytr: {
    name: 'PayTR / Havale EFT',
    type: 'local',
    proMonthlyUrl: 'https://paytr.com/docufinance_monthly',
    proAnnualUrl: 'https://paytr.com/docufinance_annual',
    singlePassUrl: 'https://paytr.com/docufinance_single'
  }
};

export const PROMO_CODES = {
  LAUNCH50: {
    discountPercent: 50,
    description: '%50 Lansman İndirimi'
  },
  DOCU2026: {
    discountFixedTRY: 250,
    discountFixedUSD: 5,
    discountFixedEUR: 5,
    description: '₺250 / $5 Özel İndirim'
  },
  MUHASEBE100: {
    discountPercent: 100,
    description: '1 Ay Ücretsiz Tam Pro Erişim (Mali Müşavir Özel)'
  }
};

export function validatePromoCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  if (PROMO_CODES[cleanCode]) {
    return {
      isValid: true,
      code: cleanCode,
      ...PROMO_CODES[cleanCode]
    };
  }
  return { isValid: false };
}
