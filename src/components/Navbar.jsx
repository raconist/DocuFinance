import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  FileSpreadsheet, 
  Database, 
  Sun, 
  Moon, 
  Home, 
  User,
  Building2,
  ChevronRight,
  LogIn,
  Settings
} from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

export default function Navbar({ 
  onOpenSecurity, 
  onOpenPricing, 
  onOpenHistory, 
  onOpenAuth,
  onOpenAccount,
  onOpenAdmin,
  currentUser,
  onSelectBankPage, 
  onGoHome,
  currentView,
  hasActiveData,
  lang = 'tr',
  onLangChange,
  theme = 'dark',
  onToggleTheme 
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';
  const isPro = currentUser?.tier?.includes('pro');

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 backdrop-blur-xl ${
      isDark 
        ? 'border-white/10 bg-[#070b13]/85 text-white' 
        : 'border-slate-200/80 bg-white/90 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Home Navigation */}
        <div className="flex items-center gap-4 cursor-pointer select-none" onClick={onGoHome}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isDark ? 'bg-[#0a1122]' : 'bg-white'}`}>
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-display text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                DocuFinance<span className="text-emerald-500">.ai</span>
              </span>
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAdmin();
                }}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full border cursor-pointer hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
                title="Yönetici Girişi (Gizli)"
              >
                v2.8 Pro
              </span>
            </div>
            <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Direct Home / Ana Sayfa Button */}
          <button
            onClick={onGoHome}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              !hasActiveData && currentView === 'app'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-extrabold'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title="Ana Sayfaya Dön"
          >
            <Home className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">{t.homeBtn}</span>
          </button>

          {/* Directory of Supported Banks Button */}
          <button
            onClick={() => onSelectBankPage(currentView !== 'seo')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              currentView === 'seo'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-extrabold'
                : isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span className="hidden md:inline">{t.supportedBanksBtn}</span>
          </button>

          {/* Security & Zero-Knowledge Guarantee */}
          <button
            onClick={onOpenSecurity}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-emerald-500/30 text-emerald-400' 
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.securityModalTitle}</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="flex items-center rounded-xl p-0.5 border border-white/10 bg-slate-900/90 text-xs font-bold text-slate-400">
            {['tr', 'en', 'de'].map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className={`px-2 py-1 rounded-lg uppercase text-[11px] font-extrabold transition-colors ${
                  lang === l ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* History / DB Trigger */}
          <button
            onClick={onOpenHistory}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all group ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-200' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
            }`}
            title="Kayıtlı Ekstrelerim ve Yerel DB Geçmişi"
          >
            <Database className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline">{t.historyBtn}</span>
          </button>

          {/* User Account or Login Button */}
          {currentUser ? (
            <button
              onClick={onOpenAccount}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isPro 
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50' 
                  : isDark ? 'bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-xs">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <span className="max-w-[100px] truncate hidden sm:inline">
                {currentUser.companyName || currentUser.name}
              </span>
              {isPro && (
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                  PRO
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-200' 
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-500" />
              <span>{t.loginBtn}</span>
            </button>
          )}

          {/* Pricing Button */}
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span className="hidden sm:inline">{t.pricingBtn}</span>
            <span className="sm:hidden">Pro</span>
          </button>

        </div>

      </div>
    </header>
  );
}
