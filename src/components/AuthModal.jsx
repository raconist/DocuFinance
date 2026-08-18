import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Building2, 
  Mail, 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { loginUser, registerUser, upgradeUserToPro } from '../utils/authService';
import { validatePromoCode } from '../utils/paymentConfig';
import { TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  theme = 'dark',
  lang = 'tr' 
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'license'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('corporate'); // 'corporate' | 'individual'
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [licenseCode, setLicenseCode] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(lang === 'tr' ? 'Lütfen e-posta ve şifrenizi girin.' : lang === 'de' ? 'Bitte geben Sie E-Mail und Passwort ein.' : 'Please enter your email and password.');
      return;
    }

    try {
      const user = loginUser({ email, password });
      confetti({ particleCount: 50, spread: 40 });
      setSuccessMsg(`${t.loginSuccessMsg} ${user.name || user.email}`);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(lang === 'tr' ? 'Giriş yapılırken bir hata oluştu.' : lang === 'de' ? 'Fehler bei der Anmeldung.' : 'An error occurred during login.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg(lang === 'tr' ? 'Lütfen tüm zorunlu alanları doldurun.' : lang === 'de' ? 'Bitte füllen Sie alle Pflichtfelder aus.' : 'Please fill in all required fields.');
      return;
    }

    try {
      const user = registerUser({
        email,
        password,
        name,
        accountType,
        companyName: companyName || (accountType === 'corporate' ? t.demoUserCompanyName : ''),
        taxNumber: taxNumber || (accountType === 'corporate' ? (lang === 'tr' ? '4892019482' : 'DE318492019') : '')
      });
      confetti({ particleCount: 60, spread: 50 });
      setSuccessMsg(t.registerSuccessMsg);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(lang === 'tr' ? 'Kayıt oluşturulurken bir hata oluştu.' : lang === 'de' ? 'Fehler bei der Registrierung.' : 'An error occurred during registration.');
    }
  };

  const handleActivateLicense = (e) => {
    e.preventDefault();
    if (!licenseCode.trim()) {
      setErrorMsg(lang === 'tr' ? 'Lütfen lisans anahtarınızı veya kupon kodunuzu girin.' : lang === 'de' ? 'Bitte geben Sie Ihren Lizenzschlüssel ein.' : 'Please enter your license key or promo code.');
      return;
    }

    const promo = validatePromoCode(licenseCode);
    if (promo && promo.isValid) {
      const activeUser = loginUser({ email: email || 'pro_user@sirket.com', password: 'password' });
      const upgraded = upgradeUserToPro(activeUser.id, 'pro_monthly', promo.code);
      confetti({ particleCount: 80, spread: 60 });
      setSuccessMsg(`✓ ${t.proActivatedMsg} (${promo.description})`);
      setTimeout(() => {
        onAuthSuccess(upgraded);
        onClose();
      }, 1200);
    } else if (licenseCode.toUpperCase().startsWith('DOCUPRO-') || licenseCode.length >= 8) {
      const activeUser = loginUser({ email: email || 'pro_user@sirket.com', password: 'password' });
      const upgraded = upgradeUserToPro(activeUser.id, 'pro_annual', licenseCode.toUpperCase());
      confetti({ particleCount: 80, spread: 60 });
      setSuccessMsg(`✓ ${t.proActivatedMsg}`);
      setTimeout(() => {
        onAuthSuccess(upgraded);
        onClose();
      }, 1200);
    } else {
      setErrorMsg(t.promoErrorMsg);
    }
  };

  // 1-Click Demo Quick Login localized to active language
  const handleQuickDemoLogin = (type = 'corporate') => {
    const demoEmail = type === 'corporate' 
      ? (lang === 'tr' ? 'muhasebe@erdem-musavirlik.com' : lang === 'de' ? 'kontakt@weber-steuerberater.de' : 'cpa@reynolds-advisory.com')
      : (lang === 'tr' ? 'ahmet.yilmaz@bireysel.com' : lang === 'de' ? 'm.schmidt@privat.de' : 'david.miller@personal.com');

    const demoName = type === 'corporate' ? t.demoUserCorporateName : t.demoUserIndividualName;
    const demoCompany = type === 'corporate' ? t.demoUserCompanyName : '';
    const demoTax = type === 'corporate' ? (lang === 'tr' ? '4892019482' : lang === 'de' ? 'DE318492019' : 'US-89201948') : '';

    const user = registerUser({
      email: demoEmail,
      password: 'demopassword123',
      name: demoName,
      accountType: type,
      companyName: demoCompany,
      taxNumber: demoTax
    });

    const upgraded = upgradeUserToPro(user.id, 'pro_annual', `DOCUPRO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    confetti({ particleCount: 60, spread: 50 });
    setSuccessMsg(`${t.loginSuccessMsg} ${demoName}`);
    setTimeout(() => {
      onAuthSuccess(upgraded);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {activeTab === 'login' ? t.authModalLoginTitle : activeTab === 'register' ? t.authModalRegisterTitle : t.authModalLicenseTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.authModalSubtitle}
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

        {/* Tab Navigation */}
        <div className={`flex border-b text-xs font-bold ${
          isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-100/70 border-slate-200'
        }`}>
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-center transition-all border-b-2 ${
              activeTab === 'login' 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabLogin}
          </button>

          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-center transition-all border-b-2 ${
              activeTab === 'register' 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabRegister}
          </button>

          <button
            onClick={() => { setActiveTab('license'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'license' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.tabLicense}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          
          {/* Notification Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-medium animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@sirket.com"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{t.tabLogin}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Account Type Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/40 border border-white/5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAccountType('corporate')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    accountType === 'corporate' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t.accountTypeCorporate}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    accountType === 'individual' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t.accountTypeIndividual}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.nameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={accountType === 'corporate' ? t.demoUserCorporateName : t.demoUserIndividualName}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {accountType === 'corporate' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.companyLabel}</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={t.demoUserCompanyName}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                        isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.taxNumberLabel}</label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder={lang === 'tr' ? '4892019482' : 'DE318492019'}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                        isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="iletisim@sirketiniz.com"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.passwordLabel}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{t.tabRegister}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: LICENSE KEY ACTIVATION */}
          {activeTab === 'license' && (
            <form onSubmit={handleActivateLicense} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs">
                <span className="font-extrabold block mb-1">🎁 {t.licenseNoticeTitle}</span>
                <span className="text-[11px] text-amber-200/80 leading-relaxed">
                  {t.licenseNoticeDesc}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.licenseKeyLabel}</label>
                <input
                  type="text"
                  value={licenseCode}
                  onChange={(e) => setLicenseCode(e.target.value)}
                  placeholder="DOCUPRO-XXXXXX veya MUHASEBE100"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-slate-950 border-white/10 text-amber-300 placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-amber-700'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.activateProBtn}</span>
              </button>
            </form>
          )}

          {/* Demo Quick Login Shortcut */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('corporate')}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all hover:scale-[1.01] flex items-center justify-center gap-2 ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border-emerald-500/30' 
                  : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{t.demoCorporateBtn}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs text-slate-400 ${
          isDark ? 'bg-slate-950/80 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Knowledge AES-256</span>
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
