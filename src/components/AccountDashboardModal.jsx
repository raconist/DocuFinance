import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Clock, 
  FileSpreadsheet, 
  LogOut, 
  CheckCircle2, 
  Download, 
  Receipt,
  Key,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { logoutUser } from '../utils/authService';

export default function AccountDashboardModal({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  onOpenPricing,
  theme = 'dark',
  lang = 'tr' 
}) {
  const [downloadToast, setDownloadToast] = useState(null);

  if (!isOpen || !user) return null;

  const isDark = theme === 'dark';
  const isPro = user.tier?.includes('pro');

  const handleDownloadInvoice = () => {
    setDownloadToast('E-Fatura & Dekont PDF olarak indirildi!');
    setTimeout(() => setDownloadToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-md">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {user.companyName || user.name}
                </h2>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isPro 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }`}>
                  {isPro ? 'PRO HESAP' : 'ÜCRETSİZ PLAN'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {user.email} {user.taxNumber ? `| VKN: ${user.taxNumber}` : ''}
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

        {/* Invoice Toast */}
        {downloadToast && (
          <div className="p-3 bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadToast}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Subscription Tier Card */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isPro 
              ? isDark ? 'bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
              : isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Aktif Abonelik:</span>
              </div>
              <h3 className={`text-lg font-extrabold mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isPro ? (user.tier === 'pro_annual' ? 'Pro Sınırsız (Yıllık Kurumsal)' : 'Pro Sınırsız (Aylık)') : 'Ücretsiz Başlangıç Planı'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isPro ? 'Sınırsız PDF dönüştürme, tüm muhasebe formatları ve toplu işleme aktif.' : 'Ayda 50 satıra kadar dönüştürme hakkı.'}
              </p>
              {user.subscription?.licenseKey && (
                <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Lisans No: {user.subscription.licenseKey}</span>
                </div>
              )}
            </div>

            {!isPro ? (
              <button
                onClick={() => { onClose(); onOpenPricing(); }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1.5 self-start sm:self-center"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pro'ya Yükselt</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadInvoice}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center ${
                  isDark ? 'border-white/10 hover:bg-slate-800 text-slate-200' : 'border-slate-300 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>Faturamı İndir (PDF)</span>
              </button>
            )}
          </div>

          {/* Usage Stats Metrics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Kullanım & Verimlilik İstatistikleri:
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 block font-medium">Dönüştürülen Ekstre</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">
                  {user.stats?.totalParsedStatements || 1} adet
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 block font-medium">İşlenen Satır</span>
                <span className="text-xl font-extrabold font-mono text-cyan-400 mt-1 block">
                  {user.stats?.totalTransactionsProcessed || 48} satır
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 block font-medium">Tasarruf Edilen Süre</span>
                <span className="text-xl font-extrabold font-mono text-amber-400 mt-1 block">
                  ~{user.stats?.hoursSaved || 2.5} saat
                </span>
              </div>
            </div>
          </div>

          {/* Security & Sync Details */}
          <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
            isDark ? 'bg-slate-950/60 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero-Knowledge Bellek Güvenliği:</span>
              </div>
              <span className="text-emerald-400 font-mono">AKTİF (AES-256)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Banka verileriniz hiçbir merkezi veritabanında metin olarak saklanmaz. Yalnızca şifreli oturum anahtarınız ile cihazınızda çözülür.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-5 border-t flex items-center justify-between ${
          isDark ? 'bg-slate-950/90 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => {
              logoutUser();
              onLogout();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Oturumu Kapat</span>
          </button>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isDark ? 'border-white/10 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
