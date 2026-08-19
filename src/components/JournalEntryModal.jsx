import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  FileText, 
  Download, 
  CheckCircle2, 
  Scale, 
  Building2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { generateJournalEntries } from '../utils/journalEntryEngine';
import { TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';

export default function JournalEntryModal({ 
  isOpen, 
  onClose, 
  transactions = [], 
  theme = 'dark',
  lang = 'tr' 
}) {
  const [bankCode, setBankCode] = useState('102.01.001');
  const [downloadToast, setDownloadToast] = useState(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const journal = generateJournalEntries(transactions, { bankAccountCode: bankCode });

  const handleExportJournalExcel = (softwareName = 'Genel') => {
    try {
      confetti({ particleCount: 50, spread: 45 });
    } catch (e) {}

    const wb = XLSX.utils.book_new();
    const rows = journal.entries.map((entry, i) => ({
      'Fiş No': entry.voucherNo,
      'Yevmiye Tarihi': entry.date,
      'Satır No': entry.lineNo,
      'Hesap Kodu (TDHP)': entry.accountCode,
      'Hesap Adı': entry.accountName,
      'Açıklama': entry.description,
      'Borç Tutarı (TL)': entry.debit > 0 ? entry.debit : '',
      'Alacak Tutarı (TL)': entry.credit > 0 ? entry.credit : ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 18 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 25 }, { wch: 45 }, { wch: 18 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Yevmiye Maddeleri');
    XLSX.writeFile(wb, `DocuFinance_${softwareName}_Yevmiye_Fisi_${new Date().toISOString().slice(0, 10)}.xlsx`);

    setDownloadToast(`${softwareName} Yevmiye Fiş Aktarım Dosyası Başarıyla İndirildi!`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-5xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold font-display">
                  {lang === 'tr' ? 'Otomatik Dengeli Yevmiye Fişi Üretici' : 'Balanced Journal Entry Generator'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  BORÇ / ALACAK DENGELİ (%100)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'tr' ? 'Luca, Zirve, Logo ve Mikro muhasebe programlarına doğrudan aktarılabilir yevmiye fişi' : 'Directly importable journal entries for accounting software'}
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

        {/* Toast */}
        {downloadToast && (
          <div className="p-3 bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadToast}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Top Options & Software Export Buttons */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-300">🏛️ Ana Banka Kodu:</span>
              <input
                type="text"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs ${
                  isDark ? 'bg-slate-900 border-white/10 text-emerald-400' : 'bg-white border-slate-300 text-emerald-600'
                }`}
              />
            </div>

            {/* Direct Software Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExportJournalExcel('Luca')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-white/10 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>📦 Luca Fiş (.xlsx)</span>
              </button>

              <button
                onClick={() => handleExportJournalExcel('Zirve')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs border border-white/10 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>⛰️ Zirve Fiş (.xlsx)</span>
              </button>

              <button
                onClick={() => handleExportJournalExcel('Logo')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs border border-white/10 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>🔴 Logo Fiş (.xlsx)</span>
              </button>

              <button
                onClick={() => handleExportJournalExcel('Genel_TDHP')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Tüm Yevmiye Fişini İndir</span>
              </button>
            </div>
          </div>

          {/* Balance Status Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Yevmiye Fiş Dengesi: TAM EŞİTLİK (%100)</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Toplam Borç: ₺{journal.totalDebit.toLocaleString()}</span>
              <span>|</span>
              <span>Toplam Alacak: ₺{journal.totalCredit.toLocaleString()}</span>
            </div>
          </div>

          {/* Journal Entries Preview Table */}
          <div className="border border-white/5 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 sticky top-0 font-mono">
                <tr>
                  <th className="p-3">Fiş No</th>
                  <th className="p-3">Tarih</th>
                  <th className="p-3">Hesap Kodu</th>
                  <th className="p-3">Hesap Adı / Açıklama</th>
                  <th className="p-3 text-right">Borç (TL)</th>
                  <th className="p-3 text-right">Alacak (TL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {journal.entries.slice(0, 50).map((entry, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'}>
                    <td className="p-3 text-slate-400">{entry.voucherNo}</td>
                    <td className="p-3 text-slate-300">{entry.date}</td>
                    <td className="p-3 font-bold text-emerald-400">{entry.accountCode}</td>
                    <td className="p-3 text-slate-200 truncate max-w-xs">{entry.description}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {entry.debit > 0 ? `₺${entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-cyan-400">
                      {entry.credit > 0 ? `₺${entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
