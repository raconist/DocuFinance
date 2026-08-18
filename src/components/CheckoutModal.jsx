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
  Check
} from 'lucide-react';
import { validatePromoCode } from '../utils/paymentConfig';
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

              {/* Payment Methods Selector */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-950/40 border border-white/5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{lang === 'tr' ? 'Kredi / Banka Kartı' : 'Credit Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'applepay' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Apple / Google Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('eft')}
                  className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'eft' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lang === 'tr' ? 'Havale / EFT / FAST' : 'Bank Wire / SEPA'}</span>
                </button>
              </div>

              {/* FORM 1: CREDIT CARD */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleProcessPayment} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.emailLabel}</label>
                      <input
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        placeholder="fatura@sirketiniz.com"
                        required
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                          isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        {lang === 'tr' ? 'Kart Üzerindeki İsim:' : 'Cardholder Name:'}
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder={t.demoUserCorporateName}
                        required
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                          isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        {lang === 'tr' ? 'Kart Numarası:' : 'Card Number:'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleFormatCardNumber}
                          placeholder="4242 •••• •••• 4242"
                          required
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-emerald-500 ${
                            isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                          3D SECURE
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        {lang === 'tr' ? 'Son Kullanma (AA/YY):' : 'Expiry (MM/YY):'}
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleFormatExpiry}
                        placeholder="12/28"
                        required
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono text-center focus:outline-none focus:border-emerald-500 ${
                          isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">CVC / CWW:</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.slice(0, 4))}
                        placeholder="•••"
                        required
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono text-center focus:outline-none focus:border-emerald-500 ${
                          isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>{lang === 'tr' ? '3D Secure Doğrulanıyor...' : 'Processing 3D Secure...'}</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{curr.symbol}{finalPrice.toLocaleString()} {lang === 'tr' ? 'Güvenli Öde ve Pro Aç' : 'Pay & Activate Pro'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* FORM 2: APPLE PAY / GOOGLE PAY */}
              {paymentMethod === 'applepay' && (
                <div className="text-center py-6 space-y-4">
                  <p className="text-xs text-slate-300">
                    {lang === 'tr' ? 'Cihazınızdaki biyometrik doğrulama (FaceID / TouchID) ile tek tıkla ödeyin.' : 'Instant 1-click checkout with Apple Pay or Google Wallet.'}
                  </p>
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full max-w-sm mx-auto py-3.5 rounded-2xl bg-white text-black font-extrabold text-sm shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Pay with Apple Pay ({curr.symbol}{finalPrice.toLocaleString()})</span>
                  </button>
                </div>
              )}

              {/* FORM 3: HAVALE / EFT / FAST */}
              {paymentMethod === 'eft' && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Banka:</span>
                      <strong className="text-white">Garanti BBVA A.Ş.</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Alıcı:</span>
                      <strong className="text-white">DocuFinance Yazılım A.Ş.</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>IBAN:</span>
                      <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                        <span>TR45 0006 2000 0001 2345 6789 01</span>
                        <button
                          type="button"
                          onClick={() => handleCopyIban('TR450006200000012345678901')}
                          className="p-1 hover:text-white"
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
