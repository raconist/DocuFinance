import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Shield, Zap, CreditCard, Lock, ArrowRight, Tag, ExternalLink } from 'lucide-react';
import { validatePromoCode, PAYMENT_GATEWAYS } from '../utils/paymentConfig';
import { TRANSLATIONS } from '../utils/i18n';
import CheckoutModal from './CheckoutModal';
import confetti from 'canvas-confetti';

export default function PricingModal({ isOpen, onClose, onUpgradeSuccess, lang = 'tr', theme = 'dark' }) {
  const [currencyMode, setCurrencyMode] = useState('TRY');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState(null);
  const [promoError, setPromoError] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null); // 'pro_monthly' | 'pro_annual' | 'single_pass'

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;

  // Auto-set default currency based on selected language
  useEffect(() => {
    if (lang === 'en') setCurrencyMode('USD');
    else if (lang === 'de') setCurrencyMode('EUR');
    else setCurrencyMode('TRY');
  }, [lang, isOpen]);

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    const result = validatePromoCode(promoInput);
    if (result && result.isValid) {
      setActivePromo(result);
      setPromoError(false);
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}
    } else {
      setPromoError(true);
      setActivePromo(null);
    }
  };

  const handleOpenCheckout = (planId) => {
    if (planId === 'free') {
      onUpgradeSuccess('free');
      onClose();
      return;
    }
    setCheckoutPlan(planId);
  };

  const handlePaymentCompleted = (upgradedUser) => {
    setCheckoutPlan(null);
    onUpgradeSuccess(upgradedUser?.tier || 'pro_monthly');
    onClose();
  };

  // Base pricing
  const rawPricing = {
    TRY: { 
      proMonthly: 950, 
      proAnnual: 9500, 
      singlePass: 240, 
      symbol: '₺', 
      periodMonthly: lang === 'tr' ? '/ ay' : '/ mo', 
      periodAnnual: lang === 'tr' ? '/ yıl (2 Ay Bedava)' : '/ yr (2 Mo Free)', 
      singlePeriod: lang === 'tr' ? '/ tek seferlik' : '/ one-time' 
    },
    USD: { 
      proMonthly: 20, 
      proAnnual: 199, 
      singlePass: 4.99, 
      symbol: '$', 
      periodMonthly: '/ mo', 
      periodAnnual: '/ yr (2 Mo Free)', 
      singlePeriod: '/ one-time' 
    },
    EUR: { 
      proMonthly: 19, 
      proAnnual: 189, 
      singlePass: 4.90, 
      symbol: '€', 
      periodMonthly: '/ Monat', 
      periodAnnual: '/ Jahr (2 Mo Gratis)', 
      singlePeriod: '/ einmalig' 
    }
  };

  const curr = rawPricing[currencyMode];

  // Apply discount if active promo
  const calcPrice = (amount) => {
    if (!activePromo) return amount;
    if (activePromo.discountPercent) {
      const discounted = amount * (1 - activePromo.discountPercent / 100);
      return discounted <= 0 ? 0 : discounted;
    }
    return amount;
  };

  const formattedProMonthly = `${curr.symbol}${calcPrice(curr.proMonthly).toLocaleString()}`;
  const formattedProAnnual = `${curr.symbol}${calcPrice(curr.proAnnual).toLocaleString()}`;
  const formattedSingle = `${curr.symbol}${calcPrice(curr.singlePass).toLocaleString()}`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-5xl rounded-3xl bg-[#0b1120] border border-white/10 shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.pricingHeaderBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              {t.pricingModalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {t.pricingModalSubtitle}
            </p>

            {/* Controls: Currency & Billing Cycle */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              
              {/* Currency Selector */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold">
                <button
                  onClick={() => setCurrencyMode('TRY')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currencyMode === 'TRY' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇹🇷 ₺ TRY
                </button>
                <button
                  onClick={() => setCurrencyMode('USD')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currencyMode === 'USD' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇺🇸 $ USD
                </button>
                <button
                  onClick={() => setCurrencyMode('EUR')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currencyMode === 'EUR' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇪🇺 € EUR
                </button>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    billingCycle === 'monthly' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.billingMonthly}
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    billingCycle === 'annual' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.billingAnnual}
                </button>
              </div>
            </div>

            {/* Promo Code Input Box */}
            <div className="mt-4 max-w-sm mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={t.promoPlaceholder}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 uppercase font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all"
                >
                  {t.promoApplyBtn}
                </button>
              </div>

              {activePromo && (
                <div className="mt-2 text-left p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
                  <span>{t.promoAppliedMsg} <strong>{activePromo.description}</strong></span>
                  <span className="font-mono font-bold text-emerald-400">-%{activePromo.discountPercent || ''}</span>
                </div>
              )}

              {promoError && (
                <div className="mt-2 text-left p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium animate-fadeIn">
                  {t.promoErrorMsg}
                </div>
              )}
            </div>

          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* 1. Free Tier */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{t.freePlanTitle}</h3>
                <p className="text-xs text-slate-400 mb-4">{t.freePlanDesc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold font-mono text-white">0</span>
                  <span className="text-xs text-slate-400">{t.freePlanPeriod}</span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{t.freeFeature1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{t.freeFeature2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{t.freeFeature3}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{t.freeFeature4}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenCheckout('free')}
                className="mt-6 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-white/10"
              >
                {t.freePlanBtn}
              </button>
            </div>

            {/* 2. Pro Plan (Highlighted) */}
            <div className="relative rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 p-6 sm:p-7 flex flex-col justify-between shadow-2xl shadow-emerald-500/10 hover:scale-[1.02] transition-all">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md">
                {t.proPlanBadge}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-extrabold text-white">{t.proPlanTitle}</h3>
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mb-4">{t.proPlanDesc}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold font-mono text-emerald-400">
                    {billingCycle === 'annual' ? formattedProAnnual : formattedProMonthly}
                  </span>
                  <span className="text-xs text-slate-400">
                    {billingCycle === 'annual' ? curr.periodAnnual : curr.periodMonthly}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-bold text-white">{t.proFeature1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{t.proFeature2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{t.proFeature3}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{t.proFeature4}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{t.proFeature5}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenCheckout(billingCycle === 'annual' ? 'pro_annual' : 'pro_monthly')}
                className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{t.proPlanBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Single Pass */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{t.singlePlanTitle}</h3>
                <p className="text-xs text-slate-400 mb-4">{t.singlePlanDesc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold font-mono text-white">{formattedSingle}</span>
                  <span className="text-xs text-slate-400">{curr.singlePeriod}</span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{t.singleFeature1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{t.singleFeature2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{t.singleFeature3}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenCheckout('single_pass')}
                className="mt-6 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-white/10"
              >
                {t.singlePlanBtn}
              </button>
            </div>

          </div>

          {/* Security & Guarantee Footer */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{t.securityGuarantee}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{t.moneyBack}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Checkout Screen Modal */}
      {checkoutPlan && (
        <CheckoutModal
          isOpen={Boolean(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          selectedPlan={checkoutPlan}
          currencyMode={currencyMode}
          onPaymentSuccess={handlePaymentCompleted}
          theme={theme}
          lang={lang}
        />
      )}
    </>
  );
}
