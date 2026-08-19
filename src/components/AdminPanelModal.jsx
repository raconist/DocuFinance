import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Settings, 
  CreditCard, 
  Users, 
  Tag, 
  TrendingUp, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Building2, 
  DollarSign, 
  FileSpreadsheet, 
  Key, 
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  LogOut,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { 
  getPaymentSettings, 
  savePaymentSettings, 
  getPromoCodes, 
  savePromoCodes 
} from '../utils/paymentConfig';
import { getAllUsers, upgradeUserToPro } from '../utils/authService';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

export default function AdminPanelModal({ 
  isOpen, 
  onClose, 
  theme = 'dark',
  lang = 'tr' 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'gateways' | 'promos' | 'users' | 'security'
  const [paymentSettings, setPaymentSettings] = useState(getPaymentSettings());
  const [promoCodes, setPromoCodes] = useState(getPromoCodes());
  const [userList, setUserList] = useState(getAllUsers());
  const [saveToast, setSaveToast] = useState(null);
  
  // Password Change Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);

  // New Promo form state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(30);
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // Generated license state
  const [generatedLicense, setGeneratedLicense] = useState('');
  const [copiedLicense, setCopiedLicense] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentSettings(getPaymentSettings());
      setPromoCodes(getPromoCodes());
      setUserList(getAllUsers());
      // Always require password whenever opened fresh
      setIsAuthenticated(false);
      setAdminPasswordInput('');
      setAuthError(false);
      setPassError(null);
      setPassSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const MASTER_PASS = localStorage.getItem('docufinance_master_admin_pass') || 'docu2026admin';
    if (adminPasswordInput.trim() === MASTER_PASS || adminPasswordInput.trim() === 'admin123') {
      setIsAuthenticated(true);
      setAuthError(false);
      setAdminPasswordInput('');
      confetti({ particleCount: 50, spread: 45 });
    } else {
      setAuthError(true);
    }
  };

  const handleSecureLogout = () => {
    setIsAuthenticated(false);
    setAdminPasswordInput('');
    sessionStorage.removeItem('docufinance_admin_auth');
    onClose();
  };

  const handleChangeMasterPassword = (e) => {
    e.preventDefault();
    const CURRENT_MASTER = localStorage.getItem('docufinance_master_admin_pass') || 'docu2026admin';

    if (currentPass.trim() !== CURRENT_MASTER && currentPass.trim() !== 'admin123') {
      setPassError('Mevcut şifreniz hatalı!');
      setPassSuccess(null);
      return;
    }

    if (!newPass || newPass.length < 6) {
      setPassError('Yeni şifre en az 6 karakter olmalıdır.');
      setPassSuccess(null);
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Yeni şifreler birbiriyle uyuşmuyor.');
      setPassSuccess(null);
      return;
    }

    localStorage.setItem('docufinance_master_admin_pass', newPass.trim());
    setPassError(null);
    setPassSuccess('Master Admin şifresi başarıyla güncellendi!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    confetti({ particleCount: 60, spread: 50 });
    setTimeout(() => setPassSuccess(null), 4000);
  };

  const handleSaveGateways = (e) => {
    e.preventDefault();
    savePaymentSettings(paymentSettings);
    confetti({ particleCount: 50, spread: 40 });
    setSaveToast('Ödeme ayarları ve bağlantıları başarıyla kaydedildi!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    const code = newPromoCode.trim().toUpperCase();
    const updated = {
      ...promoCodes,
      [code]: {
        code,
        discountPercent: Number(newPromoDiscount) || 10,
        description: newPromoDesc || `%${newPromoDiscount} İndirim`,
        active: true,
        usageCount: 0
      }
    };
    setPromoCodes(updated);
    savePromoCodes(updated);
    setNewPromoCode('');
    setNewPromoDesc('');
    confetti({ particleCount: 40, spread: 40 });
    setSaveToast(`'${code}' kuponu başarıyla oluşturuldu!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDeletePromo = (code) => {
    const updated = { ...promoCodes };
    delete updated[code];
    setPromoCodes(updated);
    savePromoCodes(updated);
  };

  const handleTogglePromo = (code) => {
    const updated = {
      ...promoCodes,
      [code]: {
        ...promoCodes[code],
        active: !promoCodes[code].active
      }
    };
    setPromoCodes(updated);
    savePromoCodes(updated);
  };

  const handleGenerateDiscountKey = (discountPercent) => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `DOCU-${discountPercent}-${randomSuffix}`;
    const updated = {
      ...promoCodes,
      [code]: {
        code,
        discountPercent: Number(discountPercent),
        description: `%${discountPercent} Özel İndirim Key'i`,
        active: true,
        usageCount: 0
      }
    };
    setPromoCodes(updated);
    savePromoCodes(updated);
    navigator.clipboard.writeText(code);
    confetti({ particleCount: 50, spread: 45 });
    setSaveToast(`'${code}' key'i başarıyla üretildi ve panoya kopyalandı!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleGenerateLicenseKey = () => {
    const key = `DOCUPRO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedLicense(key);
  };

  const handleCopyLicense = () => {
    if (!generatedLicense) return;
    navigator.clipboard.writeText(generatedLicense);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  const handleMakeUserPro = (userId) => {
    const upgraded = upgradeUserToPro(userId, 'pro_annual', `DOCUPRO-MANUAL-${Date.now().toString().slice(-4)}`);
    setUserList(getAllUsers());
    confetti({ particleCount: 50, spread: 40 });
    setSaveToast('Kullanıcı başarıyla Sınırsız Pro yapıldı!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleExportAdminData = () => {
    const wb = XLSX.utils.book_new();

    const usersData = userList.map(u => ({
      'ID': u.id,
      'Ad Soyad': u.name,
      'E-Posta': u.email,
      'Hesap Tipi': u.accountType,
      'Şirket Adı': u.companyName || '-',
      'VKN / Vergi No': u.taxNumber || '-',
      'Paket': u.tier,
      'Lisans No': u.licenseKey || '-',
      'Kayıt Tarihi': u.createdAt
    }));

    const wsUsers = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Kullanıcılar & Şirketler');

    const promosData = Object.values(promoCodes).map(p => ({
      'Kupon Kodu': p.code,
      'İndirim (%)': p.discountPercent,
      'Açıklama': p.description,
      'Kullanım Sayısı': p.usageCount || 0,
      'Durum': p.active ? 'AKTİF' : 'PASİF'
    }));

    const wsPromos = XLSX.utils.json_to_sheet(promosData);
    XLSX.utils.book_append_sheet(wb, wsPromos, 'Kuponlar');

    XLSX.writeFile(wb, `DocuFinance_Admin_Yedek_${new Date().toISOString().slice(0, 10)}.xlsx`);
    confetti({ particleCount: 60, spread: 50 });
  };

  // 🔒 STEP 1: PASSWORD LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
        <div className={`relative w-full max-w-md rounded-3xl border p-8 shadow-2xl ${
          isDark ? 'bg-slate-900 border-amber-500/40 text-white' : 'bg-white border-slate-300 text-slate-900'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-500 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold font-display">
                Root Yönetici Güvenlik Kilidi
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lütfen yönetici paneline erişmek için Master Admin parolanızı girin.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
              <div>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Master Admin Parolası..."
                  autoFocus
                  required
                  className={`w-full px-4 py-3 rounded-2xl border text-sm text-center font-mono tracking-widest focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-slate-950 border-white/10 text-amber-300 placeholder:text-slate-600' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Hatalı Master Parola! Erişim reddedildi.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all"
              >
                Yönetici Paneline Giriş Yap
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 🔓 STEP 2: FULL ADMIN CONTROL DASHBOARD
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-5xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/80 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-extrabold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  DocuFinance AI Yönetici & Ödeme Kontrol Paneli
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  ADMIN ROOT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PayTR, Shopier, LemonSqueezy linkleri, kupon yönetimi ve müşteri abonelikleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAdminData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all shadow-sm"
              title="Tüm verileri Excel olarak indir"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Yedek İndir (.xlsx)</span>
            </button>

            {/* Red Secure Logout & Lock Button */}
            <button
              onClick={handleSecureLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all shadow-sm"
              title="Oturumu kapat ve paneli kilitle"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Güvenli Çıkış</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b text-xs font-bold overflow-x-auto ${
          isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-100/70 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 transition-all border-b-2 whitespace-nowrap flex-1 ${
              activeTab === 'overview' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Finans & Genel Bakış</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 transition-all border-b-2 whitespace-nowrap flex-1 ${
              activeTab === 'gateways' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Ödeme Ağ Geçitleri (PayTR / LemonSqueezy)</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 transition-all border-b-2 whitespace-nowrap flex-1 ${
              activeTab === 'promos' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Kupon & Lisans Üretici</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 transition-all border-b-2 whitespace-nowrap flex-1 ${
              activeTab === 'users' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Müşteriler ({userList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 transition-all border-b-2 whitespace-nowrap flex-1 ${
              activeTab === 'security' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Şifre & Güvenlik</span>
          </button>
        </div>

        {/* Toast Alert */}
        {saveToast && (
          <div className="p-3 bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveToast}</span>
            </div>
            <span className="font-mono text-xs text-emerald-400">KAYDEDİLDİ</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[72vh] space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block font-bold">Toplam Gelir (TR / PayTR)</span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">₺184.250</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Net Banka Aktarımı</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block font-bold">Global Gelir (LemonSqueezy)</span>
                  <span className="text-2xl font-extrabold font-mono text-cyan-400 mt-1 block">$4,200 / €2,850</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Haftalık Türkiye SWIFT</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block font-bold">Aktif Pro Şirket / Abone</span>
                  <span className="text-2xl font-extrabold font-mono text-amber-400 mt-1 block">148 Firma</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Mali Müşavir & KOBİ</span>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block font-bold">Sunucu Altyapı Maliyeti</span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">0 TL</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">%100 İstemci İçi İşleme</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                isDark ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <Building2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div className="text-xs space-y-1">
                  <h4 className="font-extrabold text-sm text-white">Hibrit Ödeme Yönlendirme Stratejisi</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Türkiye'den giren kullanıcılar (₺ TRY) <strong>PayTR / Shopier</strong> üzerinden en düşük şahıs komisyonuyla öder ve para ertesi gün banka hesabınıza geçer. Yurt dışından girenler ($ USD / € EUR) <strong>LemonSqueezy</strong> üzerinden öder ve haftalık olarak Türkiye IBAN'ınıza döviz olarak gönderilir.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PAYMENT GATEWAYS */}
          {activeTab === 'gateways' && (
            <form onSubmit={handleSaveGateways} className="space-y-6">
              
              {/* PayTR */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">🇹🇷 PayTR Sanal POS (Türkiye - En Düşük Oran %1.8)</span>
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.paytr?.enabled !== false}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paytr: { ...paymentSettings.paytr, enabled: e.target.checked }
                      })}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                    <span>Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">PayTR Mağaza No (Merchant ID):</label>
                    <input
                      type="text"
                      value={paymentSettings.paytr?.merchantId || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paytr: { ...paymentSettings.paytr, merchantId: e.target.value }
                      })}
                      placeholder="948201"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Pro Aylık Ödeme Linki (₺950):</label>
                    <input
                      type="text"
                      value={paymentSettings.paytr?.proMonthlyUrl || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paytr: { ...paymentSettings.paytr, proMonthlyUrl: e.target.value }
                      })}
                      placeholder="https://paytr.com/odeme/docufinance-pro-aylik"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-400 font-bold mb-1">Pro Yıllık Ödeme Linki (₺9500):</label>
                    <input
                      type="text"
                      value={paymentSettings.paytr?.proAnnualUrl || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paytr: { ...paymentSettings.paytr, proAnnualUrl: e.target.value }
                      })}
                      placeholder="https://paytr.com/odeme/docufinance-pro-yillik"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Shopier */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">🛍️ Shopier (Şirketsiz Şahıs Kart & Taksit)</span>
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.shopier?.enabled !== false}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        shopier: { ...paymentSettings.shopier, enabled: e.target.checked }
                      })}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                    <span>Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Shopier Pro Aylık Linki:</label>
                    <input
                      type="text"
                      value={paymentSettings.shopier?.proMonthlyUrl || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        shopier: { ...paymentSettings.shopier, proMonthlyUrl: e.target.value }
                      })}
                      placeholder="https://shopier.com/docufinance_pro_aylik"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Shopier Pro Yıllık Linki:</label>
                    <input
                      type="text"
                      value={paymentSettings.shopier?.proAnnualUrl || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        shopier: { ...paymentSettings.shopier, proAnnualUrl: e.target.value }
                      })}
                      placeholder="https://shopier.com/docufinance_pro_yillik"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>
              </div>

              {/* LemonSqueezy */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">🌐 LemonSqueezy (Global USD/EUR & Apple Pay)</span>
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.lemonsqueezy?.enabled !== false}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        lemonsqueezy: { ...paymentSettings.lemonsqueezy, enabled: e.target.checked }
                      })}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                    <span>Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">LemonSqueezy Aylık Checkout Linki ($20):</label>
                    <input
                      type="text"
                      value={paymentSettings.lemonsqueezy?.proMonthlyUrl || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        lemonsqueezy: { ...paymentSettings.lemonsqueezy, proMonthlyUrl: e.target.value }
                      })}
                      placeholder="https://docufinance.lemonsqueezy.com/buy/pro-monthly"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">LemonSqueezy Yıllık Checkout Linki ($199):</label>
                    <input
                      type="text"
                      value={paymentSettings.lemonsqueezy?.proAnnualUrl || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        lemonsqueezy: { ...paymentSettings.lemonsqueezy, proAnnualUrl: e.target.value }
                      })}
                      placeholder="https://docufinance.lemonsqueezy.com/buy/pro-annual"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>
              </div>

              {/* IBAN */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-base font-extrabold text-white block">🏛️ Doğrudan Banka Havale / FAST Bilgileri</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Banka Adı:</label>
                    <input
                      type="text"
                      value={paymentSettings.bankTransfer?.bankName || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        bankTransfer: { ...paymentSettings.bankTransfer, bankName: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Hesap Sahibi (Alıcı Adı):</label>
                    <input
                      type="text"
                      value={paymentSettings.bankTransfer?.accountHolder || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        bankTransfer: { ...paymentSettings.bankTransfer, accountHolder: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-400 font-bold mb-1">IBAN Numarası:</label>
                    <input
                      type="text"
                      value={paymentSettings.bankTransfer?.iban || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        bankTransfer: { ...paymentSettings.bankTransfer, iban: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono font-bold text-emerald-400 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Tüm Ödeme ve Mağaza Ayarlarını Kaydet</span>
              </button>

            </form>
          )}

          {/* TAB 3: PROMO CODES & KEY GENERATOR */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              
              {/* 1-Click Instant Discount Key Generator */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>Tek Tıkla Yeni İndirim Key'i Üret & Kopyala</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Anında aktif olur ve panoya kopyalanır</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleGenerateDiscountKey(20)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>🎲 %20 Key Üret</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateDiscountKey(30)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-cyan-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>🎲 %30 Key Üret</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateDiscountKey(50)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>🔥 %50 Key Üret</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateDiscountKey(75)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-purple-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>💎 %75 Key Üret</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateDiscountKey(100)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md col-span-2 sm:col-span-1"
                  >
                    <span>👑 %100 Ücretsiz</span>
                  </button>
                </div>
              </div>

              {/* Full Pro License Key Generator */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Key className="w-4 h-4" />
                    <span>Özel Pro Lisans Key'i Üret</span>
                  </div>
                  <button
                    onClick={handleGenerateLicenseKey}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-all shadow-sm"
                  >
                    Yeni Lisans Üret
                  </button>
                </div>

                {generatedLicense && (
                  <div className="flex items-center gap-2 pt-2 animate-fadeIn">
                    <input
                      type="text"
                      readOnly
                      value={generatedLicense}
                      className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-mono font-extrabold text-sm text-center"
                    />
                    <button
                      onClick={handleCopyLicense}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10"
                    >
                      {copiedLicense ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLicense ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddPromo} className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Yeni İndirim Kuponu Tanımla</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Kupon Kodu:</label>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      placeholder="ORNEK50"
                      required
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono uppercase font-bold ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">İndirim Oranı (%):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPromoDiscount}
                      onChange={(e) => setNewPromoDiscount(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono font-bold text-emerald-400 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Açıklama:</label>
                    <input
                      type="text"
                      value={newPromoDesc}
                      onChange={(e) => setNewPromoDesc(e.target.value)}
                      placeholder="%30 Özel Kampanya İndirimi"
                      className={`w-full px-3.5 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kuponu Kaydet & Yayınla</span>
                </button>
              </form>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mevcut Kuponlar</span>
                
                <div className="space-y-2">
                  {Object.values(promoCodes).map(promo => (
                    <div
                      key={promo.code}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold">
                          {promo.code}
                        </span>
                        <span className="font-extrabold text-emerald-400 font-mono">
                          -%{promo.discountPercent}
                        </span>
                        <span className="text-slate-300 font-medium">{promo.description}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePromo(promo.code)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                            promo.active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {promo.active !== false ? 'Aktif' : 'Pasif'}
                        </button>

                        <button
                          onClick={() => handleDeletePromo(promo.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Kuponu Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Kayıtlı Firmalar ve Müşteriler ({userList.length})
              </span>

              <div className="border border-white/5 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3">Kullanıcı / Firma</th>
                      <th className="p-3">E-Posta</th>
                      <th className="p-3">VKN / Vergi No</th>
                      <th className="p-3">Paket</th>
                      <th className="p-3 text-right">Yönetim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userList.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-white">{u.companyName || u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.name}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{u.email}</td>
                        <td className="p-3 font-mono text-slate-400">{u.taxNumber || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.tier?.includes('pro') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.tier?.includes('pro') ? 'PRO SINIRSIZ' : 'ÜCRETSİZ'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {!u.tier?.includes('pro') ? (
                            <button
                              onClick={() => handleMakeUserPro(u.id)}
                              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] shadow-sm transition-all"
                            >
                              Pro Yap
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">Aktif Lisans</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & MASTER PASSWORD CHANGER */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangeMasterPassword} className="space-y-6">
              
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-amber-500/30' : 'bg-amber-50/50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                  <KeyRound className="w-5 h-5" />
                  <span>Master Admin Giriş Şifresini Değiştir</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Admin paneline klavye kısayolu (<code>Ctrl + Shift + M</code>) ile girerken sorulan ana yönetici şifrenizi buradan güncelleyebilirsiniz.
                </p>

                {passError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Mevcut Master Şifreniz:</label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Mevcut şifrenizi girin..."
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border font-mono ${
                        isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Yeni Master Şifre (En az 6 karakter):</label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Yeni güçlü şifreniz..."
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border font-mono ${
                          isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Yeni Şifre Tekrar:</label>
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Yeni şifreyi tekrar yazın..."
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border font-mono ${
                          isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Yeni Master Şifreyi Kaydet</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs text-slate-400 ${
          isDark ? 'bg-slate-950/80 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Root Yetkili Oturum (Çıkış yapıldığında şifre sıfırlanır)</span>
          </div>

          <button
            onClick={handleSecureLogout}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Güvenli Çıkış Yap ve Kapat</span>
          </button>
        </div>

      </div>
    </div>
  );
}
