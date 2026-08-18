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

  const isDark = theme === 'dark';

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    try {
      const user = loginUser({ email, password });
      confetti({ particleCount: 50, spread: 40 });
      setSuccessMsg(`Hoş geldiniz, ${user.name || user.email}!`);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Giriş yapılırken bir hata oluştu.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      const user = registerUser({
        email,
        password,
        name,
        accountType,
        companyName,
        taxNumber
      });
      confetti({ particleCount: 60, spread: 50 });
      setSuccessMsg('Hesabınız başarıyla oluşturuldu!');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Kayıt oluşturulurken bir hata oluştu.');
    }
  };

  const handleActivateLicense = (e) => {
    e.preventDefault();
    if (!licenseCode.trim()) {
      setErrorMsg('Lütfen lisans anahtarınızı veya kupon kodunuzu girin.');
      return;
    }

    const promo = validatePromoCode(licenseCode);
    if (promo && promo.isValid) {
      const activeUser = loginUser({ email: email || 'pro_user@sirket.com', password: 'password' });
      const upgraded = upgradeUserToPro(activeUser.id, 'pro_monthly', promo.code);
      confetti({ particleCount: 80, spread: 60 });
      setSuccessMsg(`Tebrikler! ${promo.description} ile Pro hesabınız aktif edildi!`);
      setTimeout(() => {
        onAuthSuccess(upgraded);
        onClose();
      }, 1200);
    } else if (licenseCode.toUpperCase().startsWith('DOCUPRO-') || licenseCode.length >= 8) {
      const activeUser = loginUser({ email: email || 'pro_user@sirket.com', password: 'password' });
      const upgraded = upgradeUserToPro(activeUser.id, 'pro_annual', licenseCode.toUpperCase());
      confetti({ particleCount: 80, spread: 60 });
      setSuccessMsg('Pro Kurumsal Lisansınız başarıyla tanımlandı!');
      setTimeout(() => {
        onAuthSuccess(upgraded);
        onClose();
      }, 1200);
    } else {
      setErrorMsg('Geçersiz lisans kodu veya kupon. (Örn: MUHASEBE100 veya LAUNCH50)');
    }
  };

  // 1-Click Demo Quick Login
  const handleQuickDemoLogin = (type = 'corporate') => {
    const demoEmail = type === 'corporate' ? 'muhasebe@sirketim.com' : 'ahmet.yilmaz@gmail.com';
    const demoUser = registerUser({
      email: demoEmail,
      password: 'demo_password_123',
      name: type === 'corporate' ? 'Mali Müşavir Can Erdem' : 'Ahmet Yılmaz',
      accountType: type,
      companyName: type === 'corporate' ? 'Erdem & Ortakları Mali Müşavirlik A.Ş.' : '',
      taxNumber: type === 'corporate' ? '3480981245' : ''
    });
    
    // Make Pro by default for demonstration
    const upgraded = upgradeUserToPro(demoUser.id, 'pro_annual', 'DOCUPRO-DEMO2026');
    confetti({ particleCount: 70, spread: 50 });
    setSuccessMsg('Kurumsal Pro Hesabı ile giriş yapıldı!');
    setTimeout(() => {
      onAuthSuccess(upgraded);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
      }`}>
        
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {activeTab === 'login' ? 'Hesabınıza Giriş Yapın' : activeTab === 'register' ? 'Ücretsiz Hesap Oluşturun' : 'Lisans & Pro Aktivasyonu'}
              </h2>
              <p className="text-xs text-slate-400">
                Şirket veya bireysel finansal geçmişinizi yönetin
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

        {/* Tab Switcher */}
        <div className={`flex border-b text-xs font-bold ${
          isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'login'
                ? 'border-emerald-500 text-emerald-400 bg-white/5 font-extrabold'
                : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'register'
                ? 'border-emerald-500 text-emerald-400 bg-white/5 font-extrabold'
                : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            Kayıt Ol
          </button>
          <button
            onClick={() => { setActiveTab('license'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'license'
                ? 'border-amber-500 text-amber-400 bg-white/5 font-extrabold'
                : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            Lisans / Pro Aç
          </button>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-950 border-b border-rose-500/40 text-rose-300 text-xs font-bold animate-fadeIn">
            {errorMsg}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-Posta Adresi:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@sirketiniz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Şifre:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all mt-2"
              >
                Giriş Yap
              </button>

              {/* Fast 1-Click Demo Login */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('corporate')}
                  className="w-full py-2 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tek Tıkla Kurumsal Pro Demo Hesabıyla Giriş Yap</span>
                </button>
              </div>
            </form>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Account Type Selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('corporate')}
                  className={`flex-1 p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    accountType === 'corporate'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Şirket / Müşavir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`flex-1 p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    accountType === 'individual'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Bireysel</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Ad Soyad:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {accountType === 'corporate' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Firma Adı:
                    </label>
                    <input
                      type="text"
                      placeholder="Şirket / Ofis Adı"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Vergi No:
                    </label>
                    <input
                      type="text"
                      placeholder="Vergi No / VKN"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  E-Posta:
                </label>
                <input
                  type="email"
                  required
                  placeholder="ornek@sirket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Şifre:
                </label>
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all mt-2"
              >
                Kayıt Ol & Başla
              </button>
            </form>
          )}

          {/* LICENSE & PRO TAB */}
          {activeTab === 'license' && (
            <form onSubmit={handleActivateLicense} className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>Ödeme Sonrası Lisans Anahtarı veya Kupon</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Stripe, LemonSqueezy veya Shopier üzerinden satın aldığınız lisans kodunu veya mali müşavir kuponunu girerek anında sınırsız Pro hesabınızı aktif edin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-Posta Adresiniz:
                </label>
                <input
                  type="email"
                  required
                  placeholder="Lisansın tanımlanacağı e-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Lisans Anahtarı veya Kupon Kodu:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: MUHASEBE100 veya DOCUPRO-XXXXXX"
                  value={licenseCode}
                  onChange={(e) => setLicenseCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs border border-amber-500/40 bg-slate-950 text-amber-400 focus:outline-none focus:border-amber-400 font-mono font-bold uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all mt-2"
              >
                Pro Hesabı Anında Aktif Et
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
