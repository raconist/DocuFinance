import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Shield, Zap, CreditCard, Lock, ArrowRight, Tag, ExternalLink } from 'lucide-react';
import { validatePromoCode, PAYMENT_GATEWAYS } from '../utils/paymentConfig';
import { TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';

export default function PricingModal({ isOpen, onClose, onUpgradeSuccess, lang = 'tr' }) {
  const [currencyMode, setCurrencyMode] = useState('TRY');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState(null);
  const [promoError, setPromoError] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

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

  const handleSelectPlan = (planId) => {
    setLoadingPlan(planId);
    setTimeout(() => {
      setLoadingPlan(null);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      onUpgradeSuccess(planId);
      onClose();
    }, 1000);
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
                🇹🇷 ₺950 TRY
              </button>
              <button
                onClick={() => setCurrencyMode('USD')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currencyMode === 'USD' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 $20 USD
              </button>
              <button
                onClick={() => setCurrencyMode('EUR')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currencyMode === 'EUR' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇪🇺 €19 EUR
              </button>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  billingCycle === 'monthly' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.billingMonthly}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  billingCycle === 'annual' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.billingAnnual}
              </button>
            </div>

          </div>

          {/* Working Promo Code Bar */}
          <div className="mt-4 flex items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder={t.promoPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleApplyPromo}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200"
            >
              {t.promoApplyBtn}
            </button>
          </div>

          {activePromo && (
            <p className="text-xs text-emerald-400 font-semibold mt-2 animate-fadeIn">
              {t.promoAppliedMsg} {activePromo.description}
            </p>
          )}
          {promoError && (
            <p className="text-xs text-rose-400 font-semibold mt-2 animate-fadeIn">
              {t.promoErrorMsg}
            </p>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Free Tier */}
          <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{t.freePlanTitle}</h3>
              <p className="text-xs text-slate-400 mb-6">{t.freePlanDesc}</p>
              
              <div className="text-4xl font-extrabold text-white font-mono mb-6">
                {curr.symbol}0
                <span className="text-xs text-slate-400 font-normal font-sans ml-1">{t.freePlanPeriod}</span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.freeFeature1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.freeFeature2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.freeFeature3}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.freeFeature4}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="mt-8 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all border border-white/10"
            >
              {t.freePlanBtn}
            </button>
          </div>

          {/* Pro Unlimited */}
          <div className="relative p-7 rounded-3xl bg-gradient-to-b from-slate-900 to-[#071520] border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 flex flex-col justify-between scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold tracking-wider uppercase shadow-md">
              {t.proPlanBadge}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold text-white">{t.proPlanTitle}</h3>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-300/80 mb-6">{t.proPlanDesc}</p>
              
              <div className="text-4xl font-extrabold text-white font-mono mb-6">
                {billingCycle === 'monthly' ? formattedProMonthly : formattedProAnnual}
                <span className="text-xs text-slate-400 font-normal font-sans ml-1">
                  {billingCycle === 'monthly' ? curr.periodMonthly : curr.periodAnnual}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold text-white">{t.proFeature1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.proFeature2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.proFeature3}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.proFeature4}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.proFeature5}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('pro')}
              disabled={loadingPlan === 'pro'}
              className="mt-8 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loadingPlan === 'pro' ? t.proPlanBtnLoading : t.proPlanBtn}
            </button>
          </div>

          {/* Single Pass */}
          <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{t.singlePlanTitle}</h3>
              <p className="text-xs text-slate-400 mb-6">{t.singlePlanDesc}</p>
              
              <div className="text-4xl font-extrabold text-white font-mono mb-6">
                {formattedSingle}
                <span className="text-xs text-slate-400 font-normal font-sans ml-1">{curr.singlePeriod}</span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.singleFeature1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.singleFeature2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.singleFeature3}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('single_pass')}
              disabled={loadingPlan === 'single_pass'}
              className="mt-8 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all border border-white/10"
            >
              {loadingPlan === 'single_pass' ? t.proPlanBtnLoading : t.singlePlanBtn}
            </button>
          </div>

        </div>

        {/* Security & Gateways Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>{t.securityGuarantee}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>{t.moneyBack}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
