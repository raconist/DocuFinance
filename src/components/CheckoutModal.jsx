import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Smartphone, 
  FileText, 
  Copy, 
  Receipt,
  Check,
  ExternalLink
} from 'lucide-react';
import { validatePromoCode, getPaymentSettings } from '../utils/paymentConfig';
import { upgradeUserToPro, getCurrentUser, loginUser } from '../utils/authService';
import { TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  selectedPlan = 'pro_monthly', 
  currencyMode = 'TRY', 
  onPaymentSuccess, 
  theme = 'dark',
  lang = 'tr' 
}) {
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'applepay' | 'eft'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedLicense, setGeneratedLicense] = useState('');
  const [copiedIban, setCopiedIban] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  // Base pricing
  const planPrices = {
    TRY: {
      pro_monthly: 950,
      pro_annual: 9500,
      single_pass: 240,
      symbol: '₺'
    },
    USD: {
      pro_monthly: 20,
      pro_annual: 199,
      single_pass: 4.99,
      symbol: '$'
    },
    EUR: {
      pro_monthly: 19,
      pro_annual: 189,
      single_pass: 4.90,
      symbol: '€'
    }
  };

  const curr = planPrices[currencyMode] || planPrices.TRY;
  const rawPrice = curr[selectedPlan] || curr.pro_monthly;

  // Calculate final price with discount
  let finalPrice = rawPrice;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      finalPrice = rawPrice * (1 - appliedPromo.discountPercent / 100);
      if (finalPrice < 0) finalPrice = 0;
    }
  }

  const planTitles = {
    pro_monthly: lang === 'tr' ? 'Pro Sınırsız (Aylık Abonelik)' : lang === 'de' ? 'Pro Unbegrenzt (Monatlich)' : 'Pro Unlimited (Monthly)',
    pro_annual: lang === 'tr' ? 'Pro Sınırsız (Yıllık Kurumsal - 2 Ay Bedava)' : lang === 'de' ? 'Pro Unbegrenzt (Jährlich - 2 Monate Gratis)' : 'Pro Unlimited (Annual Corporate - 2 Mo Free)',
    single_pass: lang === 'tr' ? 'Tek Seferlik Ekstre İndirme Kartı' : lang === 'de' ? 'Einzeldokument-Pass' : 'Single Document Pass'
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const res = validatePromoCode(promoCodeInput);
    if (res && res.isValid) {
      setAppliedPromo(res);
      setPromoError(false);
      try {
        confetti({ particleCount: 40, spread: 40 });
      } catch (e) {}
    } else {
      setPromoError(true);
      setAppliedPromo(null);
    }
  };

  const handleFormatCardNumber = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleFormatExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      const newLicense = `DOCUPRO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setGeneratedLicense(newLicense);

      // Upgrade active user or create session
      let user = getCurrentUser();
      if (!user) {
        user = loginUser({ 
          email: billingEmail || 'musteri@sirket.com', 
          password: 'password', 
          name: cardHolder || 'Kurumsal Kullanıcı',
          accountType: companyName ? 'corporate' : 'individual',
          companyName: companyName || '',
          taxNumber: taxNumber || ''
        });
      }
      
      const upgradedUser = upgradeUserToPro(user.id, selectedPlan, newLicense);

      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      } catch (e) {}

      setTimeout(() => {
        onPaymentSuccess(upgradedUser);
      }, 2500);

    }, 1200);
  };

  const handleCopyIban = (iban) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md font-extrabold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {lang === 'tr' ? '256-Bit SSL Güvenli Ödeme' : lang === 'de' ? '256-Bit SSL Sichere Zahlung' : '256-Bit SSL Secure Checkout'}
              </h2>
              <p className="text-xs text-slate-400">
                Stripe • LemonSqueezy • Shopier • PayTR 3D Secure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          
          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="text-center py-8 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className={`text-2xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {lang === 'tr' ? 'Ödeme Başarıyla Tamamlandı!' : lang === 'de' ? 'Zahlung erfolgreich abgeschlossen!' : 'Payment Successful!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                {lang === 'tr' ? 'Pro lisansınız hesabınıza tanımlandı. Sınırsız ekstre dönüştürme ve muhasebe aktarımı hemen aktif edildi.' : 'Your Pro license is now active with unlimited conversions.'}
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 max-w-md mx-auto text-left font-mono text-xs">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>{t.licenseNoLabel}</span>
                  <span className="text-emerald-400 font-bold">{generatedLicense}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'tr' ? 'Plan:' : 'Plan:'}</span>
                  <span className="text-white font-bold">{planTitles[selectedPlan]}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { onClose(); }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg hover:scale-105 transition-all"
                >
                  {lang === 'tr' ? 'Stüdyoya Dön & Kullanmaya Başla' : 'Start Converting in Studio'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Order Summary Box */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-[#090e1a] border-emerald-500/30' : 'bg-emerald-50/60 border-emerald-300'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                    {lang === 'tr' ? 'Seçilen Paket' : 'Selected Plan'}
                  </span>
                  <p className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {planTitles[selectedPlan]}
                  </p>
                </div>
                <div className="text-right">
                  {appliedPromo && (
                    <span className="text-xs text-slate-400 line-through block font-mono">
                      {curr.symbol}{rawPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xl font-extrabold font-mono text-emerald-400">
                    {curr.symbol}{finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder={lang === 'tr' ? 'İndirim Kuponu (Örn: LAUNCH50)' : 'Promo Code (e.g. LAUNCH50)'}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-xs uppercase font-mono font-bold focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all"
                >
                  {lang === 'tr' ? 'Uygula' : 'Apply'}
                </button>
              </form>

              {appliedPromo && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>✓ {appliedPromo.description} uygulandı!</span>
                </div>
              )}

              {promoError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium animate-fadeIn">
                  {t.promoErrorMsg}
                </div>
              )}

              {/* Payment Methods Selector: 2 Real Channels */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/40 border border-white/5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{lang === 'tr' ? 'Kredi / Banka Kartı (Shopier)' : 'Credit Card (Shopier / Stripe)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('eft')}
                  className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'eft' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lang === 'tr' ? 'Havale / EFT / FAST (TEB)' : 'Bank Wire / SEPA'}</span>
                </button>
              </div>

              {/* CHANNEL 1: SHOPIER KREDİ / BANKA KARTI (TÜRKİYE & GLOBAL) */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 py-2">
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-950/80 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="font-extrabold text-sm text-white">Shopier 3D Secure Güvenli Ödeme</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        256-BIT SSL & 3D SECURE
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tüm yerli ve yabancı <strong>Visa, Mastercard, Troy</strong> kartları ve <strong>3 Taksit İmkanı</strong> ile resmi Shopier ödeme sayfası üzerinden güvenle ödeyin.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-white/5">💳 Bonus</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-white/5">💳 Maximum</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-white/5">💳 World</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-white/5">💳 CardFinans</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-white/5">💳 Axess / Paraf</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-white/5">📱 Apple Pay</span>
                    </div>
                  </div>

                  <a
                    href={selectedPlan === 'pro_annual' 
                      ? (getPaymentSettings().shopier?.proAnnualUrl || 'https://www.shopier.com/50024271')
                      : (getPaymentSettings().shopier?.proMonthlyUrl || 'https://www.shopier.com/50024234')
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{curr.symbol}{finalPrice.toLocaleString()} Shopier ile Güvenli Kartla Öde</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>

                  <p className="text-[11px] text-slate-400 text-center">
                    🔒 Ödeme doğrudan Shopier güvencesiyle alınır ve her hafta Çarşamba TEB banka hesabınıza aktarılır.
                  </p>
                </div>
              )}

              {/* FORM 3: HAVALE / EFT / FAST */}
              {paymentMethod === 'eft' && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Banka:</span>
                      <strong className="text-white">{getPaymentSettings().bankTransfer?.bankName || 'Türk Ekonomi Bankası (TEB)'}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Alıcı:</span>
                      <strong className="text-white">{getPaymentSettings().bankTransfer?.accountHolder || 'Recep Yıldız / DocuFinance AI'}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>IBAN:</span>
                      <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                        <span>{getPaymentSettings().bankTransfer?.iban || 'TR02 0003 2000 0000 0088 0175 88'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyIban(getPaymentSettings().bankTransfer?.iban?.replace(/\s+/g, '') || '')}
                          className="p-1 hover:text-white"
                          title="IBAN Kopyala"
                        >
                          {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Açıklama Kodu:</span>
                      <span className="font-mono font-bold text-amber-400">DOCU-PRO-{Date.now().toString().slice(-5)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
                  >
                    {lang === 'tr' ? 'Havale Yaptım, Pro Hesabımı Başlat' : 'I have transferred, Activate License'}
                  </button>
                </div>
              )}

              {/* Direct Shopier Checkout Button for Turkish Lira */}
              {(currencyMode === 'TRY' || lang === 'tr') && (
                <div className="pt-2">
                  <a
                    href={selectedPlan === 'pro_annual' 
                      ? (getPaymentSettings().shopier?.proAnnualUrl || 'https://shopier.com/docufinance_pro_yillik')
                      : (getPaymentSettings().shopier?.proMonthlyUrl || 'https://shopier.com/docufinance_pro_aylik')
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>🇹🇷 Shopier ile Güvenli Kartla Öde (Taksit & Anında Aktivasyon)</span>
                  </a>
                </div>
              )}

              {/* Direct Global Checkout Link */}
              {(currencyMode === 'USD' || currencyMode === 'EUR' || lang !== 'tr') && (
                <div className="pt-2">
                  <a
                    href={selectedPlan === 'pro_annual' 
                      ? (getPaymentSettings().lemonsqueezy?.proAnnualUrl || 'https://docufinance.lemonsqueezy.com/checkout/buy/944de374-39c3-45a1-bff3-4b4ebfeb8275')
                      : (getPaymentSettings().lemonsqueezy?.proMonthlyUrl || 'https://docufinance.lemonsqueezy.com/checkout/buy/75260f6e-61df-427a-88e3-5af4360a0f9f')
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>🌐 Pay directly via Global Checkout (Apple Pay, Card, PayPal)</span>
                  </a>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs text-slate-400 ${
          isDark ? 'bg-slate-950/80 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>14 Gün Koşulsuz Para İade Garantisi</span>
          </div>

          <button
            onClick={onClose}
            className="hover:text-white transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
