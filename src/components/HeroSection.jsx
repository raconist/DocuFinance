import React, { useState } from 'react';
import { Shield, Zap, CheckCircle2, FileSpreadsheet, Lock, ArrowRight, Sparkles, Building2, Globe2 } from 'lucide-react';
import { SAMPLE_STATEMENTS } from '../utils/parserEngine';
import { TRANSLATIONS } from '../utils/i18n';

export default function HeroSection({ onSelectSample, onOpenSecurity, lang = 'tr', theme = 'dark' }) {
  const [selectedRegion, setSelectedRegion] = useState('TR');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  const regionSamples = Object.entries(SAMPLE_STATEMENTS).filter(([key, stmt]) => {
    return stmt.region === selectedRegion;
  });

  return (
    <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      
      {/* Soft background glow in dark mode */}
      {isDark && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      )}

      {/* Top pill badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm border ${
        isDark 
          ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        {t.pillBadge}
      </div>

      {/* Main Headline */}
      <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.2] ${
        isDark ? 'text-white' : 'text-slate-950'
      }`}>
        {t.heroTitlePrefix}
        <span className="gradient-text-emerald">{t.heroTitleHighlight}</span>
        {t.heroTitleSuffix}
      </h1>

      {/* Subtitle */}
      <p className={`mt-5 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed ${
        isDark ? 'text-slate-300' : 'text-slate-600'
      }`}>
        {t.heroSubtitle}
      </p>

      {/* Trust Badges with generous spacing */}
      <div className={`mt-8 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs sm:text-sm font-medium ${
        isDark ? 'text-slate-300' : 'text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{t.badgeKvkk}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{t.badgeReconciliation}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{t.badgeExcel}</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-emerald-500 transition-colors" onClick={onOpenSecurity}>
          <Lock className="w-4 h-4 text-emerald-500" />
          <span className="underline decoration-dotted underline-offset-4">{t.badgeEncryption}</span>
        </div>
      </div>

      {/* Region & Bank Demo Selector */}
      <div className={`mt-10 pt-8 border-t max-w-4xl mx-auto ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Globe2 className="w-4 h-4 text-emerald-500" />
            {t.regionSelectTitle}
          </p>

          {/* Region Tabs (Expanded: TR, UK, FR, IT, EU, US, FINTECH) */}
          <div className={`flex flex-wrap items-center justify-center p-1.5 rounded-2xl border text-xs font-semibold gap-1 ${
            isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'TR', label: '🇹🇷 Türkiye' },
              { id: 'UK', label: '🇬🇧 İngiltere (UK)' },
              { id: 'FR', label: '🇫🇷 Fransa' },
              { id: 'IT', label: '🇮🇹 İtalya' },
              { id: 'EU', label: '🇪🇺 Almanya & İsviçre' },
              { id: 'US', label: '🇺🇸 ABD (USA)' },
              { id: 'FINTECH', label: '🌐 FinTech' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedRegion === r.id 
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacious Bank Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {regionSamples.map(([key, sample]) => (
            <button
              key={key}
              onClick={() => onSelectSample(key)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] group text-left ${
                isDark 
                  ? 'bg-slate-900/80 hover:bg-emerald-950/30 border-white/10 hover:border-emerald-500/50 text-slate-200' 
                  : 'bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 text-slate-800 shadow-sm'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isDark ? 'bg-slate-800 group-hover:bg-emerald-500/20' : 'bg-slate-100 group-hover:bg-emerald-100'
              }`}>
                <Building2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="overflow-hidden">
                <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{sample.bank}</div>
                <div className="text-[11px] text-slate-400 font-mono">{sample.currency} Ekstre Demo</div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </section>
  );
}
