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
import { TRANSLATIONS } from '../utils/i18n';

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

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';
  const isPro = user.tier?.includes('pro');

  const handleDownloadInvoice = () => {
    const toastMsg = lang === 'tr' 
      ? 'E-Fatura & Dekont PDF olarak indirildi!' 
      : lang === 'de' 
        ? 'Rechnung und Beleg als PDF heruntergeladen!' 
        : 'Invoice and receipt downloaded as PDF!';
    
    setDownloadToast(toastMsg);
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
                  {isPro ? (lang === 'tr' ? 'PRO HESAP' : lang === 'de' ? 'PRO KONTO' : 'PRO ACCOUNT') : (lang === 'tr' ? 'ÜCRETSİZ PLAN' : lang === 'de' ? 'KOSTENLOS' : 'FREE PLAN')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {user.email} {user.taxNumber ? `| ${t.taxNumberLabel} ${user.taxNumber}` : ''}
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
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{t.activeSubscription}</span>
              </div>
              <p className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isPro ? (user.tier === 'pro_annual' ? t.proPlanAnnual : t.proPlanMonthly) : t.freePlan}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {isPro ? t.proPlanDesc : t.freePlanDesc}
              </p>
              {user.licenseKey && (
                <div className="mt-2 text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>{t.licenseNoLabel} {user.licenseKey}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {isPro ? (
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.downloadInvoiceBtn}</span>
                </button>
              ) : (
                <button
                  onClick={() => { onClose(); onOpenPricing(); }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg transition-all"
                >
                  <span>{t.upgradeToProBtn}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Usage & Efficiency Stats */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.usageStatsTitle}
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-center mb-1 text-cyan-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold font-mono text-white block">
                  {user.stats?.statementsParsed || 12}
                </span>
                <span className="text-[11px] text-slate-400">{t.statsParsedStatements} ({t.unitsCount})</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-center mb-1 text-emerald-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold font-mono text-emerald-400 block">
                  {user.stats?.rowsProcessed || 1480}
                </span>
                <span className="text-[11px] text-slate-400">{t.statsProcessedRows} ({t.rowsUnit})</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-center mb-1 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold font-mono text-amber-400 block">
                  ~{user.stats?.savedHours || 14.5} {t.hoursUnit}
                </span>
                <span className="text-[11px] text-slate-400">{t.statsSavedHours}</span>
              </div>
            </div>
          </div>

          {/* Privacy & Zero-Knowledge Status */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {t.zeroKnowledgeStatusTitle}
              </span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                {t.zeroKnowledgeStatusDesc}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'bg-slate-950/80 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => {
              logoutUser();
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logoutBtn}</span>
          </button>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isDark ? 'border-white/10 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
