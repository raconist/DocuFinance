import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Percent,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { calculateEstimatedTaxes } from '../utils/taxEstimator';
import { TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';

export default function TaxEstimatorModal({ 
  isOpen, 
  onClose, 
  transactions = [], 
  theme = 'dark',
  lang = 'tr' 
}) {
  const [corporateRate, setCorporateRate] = useState(25);
  const [defaultKdv, setDefaultKdv] = useState(20);
  const [downloadToast, setDownloadToast] = useState(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const taxes = calculateEstimatedTaxes(transactions, {
    corporateTaxRate: corporateRate / 100,
    defaultKdvRate: defaultKdv / 100
  });

  const handleExportTaxReport = () => {
    try {
      confetti({ particleCount: 50, spread: 45 });
    } catch (e) {}

    const wb = XLSX.utils.book_new();
    const data = [
      { 'Vergi Kalemi': 'Toplam Gelir (Satış Matrahı + KDV)', 'Tutar (TL)': taxes.totalIncome },
      { 'Vergi Kalemi': 'Toplam Gider & Harcamalar', 'Tutar (TL)': taxes.totalExpense },
      { 'Vergi Kalemi': 'Net Dönem Kârı', 'Tutar (TL)': taxes.netProfit },
      { 'Vergi Kalemi': '---', 'Tutar (TL)': '---' },
      { 'Vergi Kalemi': 'Hesaplanan KDV (%20 Satış)', 'Tutar (TL)': taxes.calculatedKdv },
      { 'Vergi Kalemi': 'İndirilecek KDV (Gider)', 'Tutar (TL)': taxes.deductibleKdv },
      { 'Vergi Kalemi': 'Ödenecek Net KDV', 'Tutar (TL)': taxes.netVatPayable },
      { 'Vergi Kalemi': 'Sonraki Aya Devreden KDV', 'Tutar (TL)': taxes.nextMonthDeferredVat },
      { 'Vergi Kalemi': '---', 'Tutar (TL)': '---' },
      { 'Vergi Kalemi': `Tahmini Geçici / Kurumlar Vergisi (%${corporateRate})`, 'Tutar (TL)': taxes.estimatedCorporateTax },
      { 'Vergi Kalemi': 'Tahmini Stopaj / Muhtasar', 'Tutar (TL)': taxes.estimatedStopaj },
      { 'Vergi Kalemi': 'TOPLAM TAHMİNİ VERGİ YÜKÜMLÜLÜĞÜ', 'Tutar (TL)': taxes.totalTaxLiability }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Tahmini Vergi Raporu');
    XLSX.writeFile(wb, `DocuFinance_Vergi_Simulasyonu_${new Date().toISOString().slice(0, 10)}.xlsx`);

    setDownloadToast('Tahmini Vergi & KDV Raporu Excel olarak indirildi!');
    setTimeout(() => setDownloadToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold font-display">
                  {lang === 'tr' ? 'Otomatik Vergi, KDV & Stopaj Simülatörü' : 'Automated Tax & VAT Estimator'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GİB UYUMLU
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'tr' ? 'Yüklenen ekstre hareketlerinden dönem sonu tahmini vergi ve KDV projeksiyonu' : 'Real-time corporate tax and VAT liability forecast'}
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

        {/* Download Toast */}
        {downloadToast && (
          <div className="p-3 bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadToast}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Rate Controls */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
            isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-bold text-slate-300">⚙️ Vergi Oranları Ayarı:</span>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-slate-400">Kurumlar / Gelir Vergisi:</span>
                <select
                  value={corporateRate}
                  onChange={(e) => setCorporateRate(Number(e.target.value))}
                  className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${
                    isDark ? 'bg-slate-900 border-white/10 text-emerald-400' : 'bg-white border-slate-300 text-emerald-600'
                  }`}
                >
                  <option value={25}>%25 (Kurumlar)</option>
                  <option value={20}>%20 (İndirimli Kurumlar)</option>
                  <option value={15}>%15 (Şahıs 1. Dilim)</option>
                  <option value={30}>%30 (Şahıs Üst Dilim)</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span className="text-slate-400">Genel KDV:</span>
                <select
                  value={defaultKdv}
                  onChange={(e) => setDefaultKdv(Number(e.target.value))}
                  className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${
                    isDark ? 'bg-slate-900 border-white/10 text-emerald-400' : 'bg-white border-slate-300 text-emerald-600'
                  }`}
                >
                  <option value={20}>%20 Standart</option>
                  <option value={10}>%10 Gıda/Hizmet</option>
                  <option value={1}>%1 Temel</option>
                </select>
              </label>
            </div>
          </div>

          {/* 3 Main Tax Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. Net KDV */}
            <div className={`p-5 rounded-2xl border ${
              taxes.netVatPayable > 0 
                ? isDark ? 'bg-slate-950/80 border-rose-500/30' : 'bg-rose-50 border-rose-200'
                : isDark ? 'bg-slate-950/80 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className="text-xs font-bold text-slate-400 block mb-1">🧾 Tahmini Ödenecek KDV (Net)</span>
              <span className={`text-2xl font-extrabold font-mono block ${
                taxes.netVatPayable > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                ₺{taxes.netVatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className="text-[11px] text-slate-400 font-mono mt-2 space-y-0.5">
                <div>Hesaplanan KDV (391): +₺{taxes.calculatedKdv.toLocaleString()}</div>
                <div>İndirilecek KDV (191): -₺{taxes.deductibleKdv.toLocaleString()}</div>
                {taxes.nextMonthDeferredVat > 0 && (
                  <div className="text-emerald-400 font-bold">Devreden KDV: ₺{taxes.nextMonthDeferredVat.toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* 2. Kurumlar / Gelir Vergisi */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-950/80 border-amber-500/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="text-xs font-bold text-slate-400 block mb-1">🏛️ Geçici / Kurumlar Vergisi</span>
              <span className="text-2xl font-extrabold font-mono text-amber-400 block">
                ₺{taxes.estimatedCorporateTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className="text-[11px] text-slate-400 font-mono mt-2 space-y-0.5">
                <div>Dönem Kârı: ₺{taxes.netProfit.toLocaleString()}</div>
                <div>Uygulanan Oran: %{corporateRate}</div>
              </div>
            </div>

            {/* 3. Toplam Vergi Yükümlülüğü */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
            }`}>
              <span className="text-xs font-bold text-emerald-400 block mb-1">💰 Toplam Tahmini Vergi</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400 block">
                ₺{taxes.totalTaxLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 mt-2 block leading-relaxed">
                KDV + Kurumlar + Stopaj toplam nakit ihtiyacınız.
              </span>
            </div>

          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GİB 1 No'lu KDV ve Geçici Vergi Beyannamesi hesaplama mantığı ile uyumludur.</span>
            </div>

            <button
              onClick={handleExportTaxReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Vergi Raporunu İndir (.xlsx)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
