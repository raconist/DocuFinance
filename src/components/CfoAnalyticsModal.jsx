import React from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Building,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

export default function CfoAnalyticsModal({ 
  isOpen, 
  onClose, 
  transactions = [], 
  theme = 'dark',
  lang = 'tr' 
}) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  // Calculate Metrics
  let totalInflow = 0;
  let totalOutflow = 0;
  const categoryMap = {};
  const highValueAnomalies = [];

  transactions.forEach(tx => {
    const amount = Number(tx.amount || tx.tutar || (tx.credit || 0) - (tx.debit || 0)) || 0;
    const cat = tx.category || 'Diğer Giderler';

    if (amount > 0) {
      totalInflow += amount;
    } else {
      const absAmount = Math.abs(amount);
      totalOutflow += absAmount;

      categoryMap[cat] = (categoryMap[cat] || 0) + absAmount;
    }
  });

  const netCashFlow = totalInflow - totalOutflow;
  const avgOutflow = transactions.length > 0 ? (totalOutflow / Math.max(1, transactions.length)) : 0;

  // Detect Anomalies (> 3x average outflow)
  transactions.forEach(tx => {
    const amount = Number(tx.amount || tx.tutar || (tx.credit || 0) - (tx.debit || 0)) || 0;
    if (amount < 0 && Math.abs(amount) > (avgOutflow * 3) && Math.abs(amount) > 5000) {
      highValueAnomalies.push({
        date: tx.date || tx.tarih || '-',
        description: tx.description || tx.aciklama || 'Bilinmeyen İşlem',
        amount: Math.abs(amount),
        category: tx.category || 'Belirtilmemiş'
      });
    }
  });

  // Top Categories sorted
  const sortedCategories = Object.entries(categoryMap)
    .map(([name, total]) => ({
      name,
      total,
      percentage: totalOutflow > 0 ? Math.round((total / totalOutflow) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const categoryColors = [
    'from-emerald-500 to-teal-500',
    'from-cyan-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-purple-500 to-indigo-500',
    'from-rose-500 to-pink-500'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold font-display">
                  {lang === 'tr' ? 'AI CFO & Nakit Akışı Yönetim Paneli' : 'AI CFO & Cash Flow Intelligence'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CANLI ANALİZ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'tr' ? 'Yüklenen tüm ekstre ve faturaların otomatik finansal sağlığı ve gider kırılımı' : 'Real-time financial health, category breakdown, and anomaly detection'}
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
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. Inflow */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{lang === 'tr' ? 'Toplam Nakit Girişi' : 'Total Cash Inflow'}</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-emerald-400 block">
                +₺{totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Satış, POS & Alacak Tahsilatları</span>
            </div>

            {/* 2. Outflow */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{lang === 'tr' ? 'Toplam Nakit Çıkışı' : 'Total Cash Outflow'}</span>
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-rose-400 block">
                -₺{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Tedarikçi, Vergi, Maaş & Operasyon</span>
            </div>

            {/* 3. Net Cash Flow */}
            <div className={`p-5 rounded-2xl border ${
              netCashFlow >= 0 
                ? isDark ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'
                : isDark ? 'bg-rose-950/30 border-rose-500/40' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold">{lang === 'tr' ? 'Net Nakit Pozisyonu' : 'Net Cash Position'}</span>
                <span className={`p-1.5 rounded-lg font-bold ${
                  netCashFlow >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {netCashFlow >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </span>
              </div>
              <span className={`text-2xl font-extrabold font-mono block ${
                netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {netCashFlow >= 0 ? '+' : ''}₺{netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {netCashFlow >= 0 ? '✅ Pozitif Nakit Akışı' : '⚠️ Net Nakit Eksilme'}
              </span>
            </div>

          </div>

          {/* Top 5 Expense Categories */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white">
                  {lang === 'tr' ? 'En Çok Harcama Yapılan İlk 5 Kategori' : 'Top 5 Expense Categories'}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Toplam Çıkışın %{sortedCategories.reduce((acc, c) => acc + c.percentage, 0)}'si</span>
            </div>

            {sortedCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Henüz kategorize edilmiş gider hareketi bulunamadı.</p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map((cat, idx) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${categoryColors[idx % categoryColors.length]}`}></span>
                        <span className="text-slate-200">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-400">%{cat.percentage}</span>
                        <span className="text-emerald-400">₺{cat.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${categoryColors[idx % categoryColors.length]} transition-all duration-500`}
                        style={{ width: `${Math.max(4, cat.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Anomaly Detection */}
          {highValueAnomalies.length > 0 && (
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>AI Anomali & Yüksek Tutarlı Harcama Tespiti ({highValueAnomalies.length} Adet)</span>
              </div>

              <div className="space-y-2">
                {highValueAnomalies.slice(0, 3).map((anom, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{anom.description}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{anom.date} | {anom.category}</span>
                    </div>
                    <span className="font-mono font-extrabold text-amber-400 text-sm">
                      -₺{anom.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Financial Advisory Note */}
          <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
            isDark ? 'bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs text-white">Yapay Zeka CFO Değerlendirmesi:</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                İncelenen dönemde nakit akışınız {netCashFlow >= 0 ? 'sağlıklı pozitif bölgede kalmıştır.' : 'çıkış ağırlıklı seyretmiştir.'}
                {sortedCategories.length > 0 && ` En yüksek gider kalemi %${sortedCategories[0].percentage} ile '${sortedCategories[0].name}' olarak gerçekleşti.`}
                {' '}Tek tıkla tüm bu hareketleri muhasebe fişine dönüştürüp Luca veya Zirve'ye aktarabilirsiniz.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
