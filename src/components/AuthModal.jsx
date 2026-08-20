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
  RefreshCw
} from 'lucide-react';
import { loginUser, loginUserAsync, registerUser, registerUserAsync, upgradeUserToPro, resetUserPassword, resetUserPasswordAsync } from '../utils/authService';
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
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot' | 'license'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityChallenge, setSecurityChallenge] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('corporate'); // 'corporate' | 'individual'
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [licenseCode, setLicenseCode] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDuplicateUser, setIsDuplicateUser] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(lang === 'tr' ? 'Lütfen e-posta ve şifrenizi girin.' : 'Please enter your email and password.');
      return;
    }

    try {
      const user = await loginUserAsync({ email, password });
      confetti({ particleCount: 50, spread: 40 });
      setSuccessMsg(`${t.loginSuccessMsg} ${user.name || user.email}`);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || (lang === 'tr' ? 'Giriş yapılırken bir hata oluştu.' : 'An error occurred during login.'));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg(lang === 'tr' ? 'Lütfen tüm zorunlu alanları doldurun.' : 'Please fill in all required fields.');
      return;
    }

    try {
      const user = await registerUserAsync({
        email,
        password,
        name,
        accountType,
        companyName: companyName.trim(),
        taxNumber: taxNumber.trim()
      });
      confetti({ particleCount: 60, spread: 50 });
      setSuccessMsg(t.registerSuccessMsg);
      setIsDuplicateUser(false);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } catch (err) {
      const isDup = err.message && err.message.includes('zaten kayıtlı');
      setIsDuplicateUser(isDup);
      setErrorMsg(err.message || (lang === 'tr' ? 'Kayıt oluşturulurken bir hata oluştu.' : 'An error occurred during registration.'));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !newPassword) {
      setErrorMsg(lang === 'tr' ? 'Lütfen e-posta adresinizi ve yeni şifrenizi girin.' : 'Please enter your email and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(lang === 'tr' ? 'Girdiğiniz yeni şifreler birbiriyle uyuşmuyor.' : 'New passwords do not match.');
      return;
    }

    try {
      const user = await resetUserPasswordAsync({ 
        email, 
        newPassword, 
        securityChallenge 
      });
      confetti({ particleCount: 50, spread: 40 });
      setSuccessMsg(lang === 'tr' ? 'Şifreniz başarıyla sıfırlandı ve güvenli oturum açıldı!' : 'Password reset successfully!');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || (lang === 'tr' ? 'Şifre sıfırlanırken bir hata oluştu.' : 'Error resetting password.'));
    }
  };

  const handleActivateLicense = (e) => {
    e.preventDefault();
    if (!licenseCode.trim()) {
      setErrorMsg(lang === 'tr' ? 'Lütfen lisans anahtarınızı veya kupon kodunuzu girin.' : 'Please enter your license key or promo code.');
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
                {activeTab === 'login' ? t.authModalLoginTitle : activeTab === 'register' ? t.authModalRegisterTitle : activeTab === 'forgot' ? 'Şifremi Sıfırla' : t.authModalLicenseTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {activeTab === 'forgot' ? 'Kayıtlı e-posta adresiniz için yeni şifre belirleyin' : t.authModalSubtitle}
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
            onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); setIsDuplicateUser(false); }}
            className={`flex-1 py-3 text-center transition-all border-b-2 ${
              activeTab === 'login' 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabLogin}
          </button>

          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); setSuccessMsg(null); setIsDuplicateUser(false); }}
            className={`flex-1 py-3 text-center transition-all border-b-2 ${
              activeTab === 'register' 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabRegister}
          </button>

          <button
            onClick={() => { setActiveTab('forgot'); setErrorMsg(null); setSuccessMsg(null); setIsDuplicateUser(false); }}
            className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'forgot' 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Şifre Sıfırla</span>
          </button>

          <button
            onClick={() => { setActiveTab('license'); setErrorMsg(null); setSuccessMsg(null); setIsDuplicateUser(false); }}
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
              <div>{errorMsg}</div>
              {isDuplicateUser && (
                <div className="mt-2 pt-2 border-t border-rose-500/30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrorMsg(null); setIsDuplicateUser(false); }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Şifrenizi mi unuttunuz? Sıfırlayın</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setErrorMsg(null); setIsDuplicateUser(false); }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-colors"
                  >
                    Giriş Yap
                  </button>
                </div>
              )}
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
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.emailLabel}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@sirket.com"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 font-medium ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.passwordLabel}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrorMsg(null); }}
                    className="text-[11px] font-semibold text-emerald-400 hover:underline"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 font-medium ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
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

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="muhasebe@sirket.com"
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

              {accountType === 'corporate' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.companyNameLabel}</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={t.demoUserCompanyName}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                        isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.taxNumberLabel}</label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="10 Haneli VKN"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                        isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{t.tabRegister}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT / RESET PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Güvenli Şifre Sıfırlama:</strong> Hesabınızı açtığınız yetkili bilgisayardan işlem yapıyorsanız doğrulama otomatik tamamlanır. Başka bir cihazdan işlem yapıyorsanız kayıtlı VKN veya Şirket Adınız istenir.
                </span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kayıtlı E-Posta Adresi</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@sirket.com"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 font-medium ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Güvenlik Doğrulaması (Kayıtlı VKN / Şirket veya Ad Soyad)</span>
                </label>
                <input
                  type="text"
                  value={securityChallenge}
                  onChange={(e) => setSecurityChallenge(e.target.value)}
                  placeholder="Kayıtlı VKN, Şirket Unvanı veya Yetkili Adınız"
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 font-medium ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * Kendi cihazınızdan işlem yapıyorsanız bu alanı boş bırakabilirsiniz.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Yeni Şifre</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 4 karakter"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 font-medium ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Yeni Şifre (Tekrar)</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifreyi tekrar yazın"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 font-medium ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Güvenli Şifreyi Güncelle ve Giriş Yap</span>
              </button>
            </form>
          )}

          {/* TAB 4: LICENSE CODE / PROMO */}
          {activeTab === 'license' && (
            <form onSubmit={handleActivateLicense} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                {t.licenseDescription}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.emailOptionalLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hesap@sirket.com"
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.promoCodeInputLabel}</label>
                <input
                  type="text"
                  value={licenseCode}
                  onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                  placeholder="DOCUPRO-2026-XXXX"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-amber-500 font-mono uppercase tracking-wider ${
                    isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.activateLicenseBtn}</span>
              </button>
            </form>
          )}

          {/* Privacy & Zero Knowledge Guarantee Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sıfır-Bilgi Gizlilik Güvencesi</span>
            </div>
            <span>KVKK & GDPR Uyumlu</span>
          </div>

        </div>

      </div>
    </div>
  );
}
