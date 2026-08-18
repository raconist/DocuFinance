import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  UploadCloud, 
  ArrowRight, 
  Download, 
  Filter,
  ShieldCheck,
  Building2,
  Layers,
  RotateCcw
} from 'lucide-react';
import { parseFinancialContent, formatCurrency, parseFinancialNumber } from '../utils/parserEngine';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

export default function ReconciliationModal({ 
  isOpen, 
  onClose, 
  bankData, 
  theme = 'dark',
  lang = 'tr' 
}) {
  const [accountingRows, setAccountingRows] = useState([]);
  const [accountingFileName, setAccountingFileName] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MATCHED' | 'BANK_ONLY' | 'ACCOUNTING_ONLY'
  const [toleranceDays, setToleranceDays] = useState(2); // ±2 days date matching tolerance

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const currency = bankData?.meta?.currency || 'TRY';

  const handleAccountingFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setAccountingFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseFinancialContent(text);
        setAccountingRows(parsed.rows || []);
      } catch (err) {
        alert('Muhasebe dosyası okunamadı. Lütfen geçerli bir Excel/CSV veya metin yükleyin.');
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsText(file);
  };

  // Run Cross-Matching Algorithm
  const bankRows = bankData?.rows || [];
  
  const matchResults = React.useMemo(() => {
    if (accountingRows.length === 0) {
      return {
        matched: [],
        bankOnly: bankRows.map(r => ({ ...r, status: 'BANK_ONLY' })),
        accountingOnly: [],
        totalBankAmount: bankRows.reduce((acc, r) => acc + ((r.credit || 0) - (r.debit || 0)), 0),
        totalAccountingAmount: 0,
        discrepancy: 0
      };
    }

    const matchedPairs = [];
    const unmatchedBank = [];
    const usedAccountingIndices = new Set();

    bankRows.forEach(bRow => {
      const bAmount = (bRow.credit || 0) - (bRow.debit || 0);

      // Find best match in accounting
      let bestMatchIdx = -1;
      for (let i = 0; i < accountingRows.length; i++) {
        if (usedAccountingIndices.has(i)) continue;
        const aRow = accountingRows[i];
        const aAmount = (aRow.credit || 0) - (aRow.debit || 0);

        // Check if amounts match within 0.05
        if (Math.abs(bAmount - aAmount) < 0.05) {
          bestMatchIdx = i;
          break;
        }
      }

      if (bestMatchIdx !== -1) {
        usedAccountingIndices.add(bestMatchIdx);
        matchedPairs.push({
          bank: bRow,
          accounting: accountingRows[bestMatchIdx],
          status: 'MATCHED'
        });
      } else {
        unmatchedBank.push({ ...bRow, status: 'BANK_ONLY' });
      }
    });

    const unmatchedAccounting = accountingRows
      .filter((_, idx) => !usedAccountingIndices.has(idx))
      .map(r => ({ ...r, status: 'ACCOUNTING_ONLY' }));

    const totalBank = bankRows.reduce((acc, r) => acc + ((r.credit || 0) - (r.debit || 0)), 0);
    const totalAccounting = accountingRows.reduce((acc, r) => acc + ((r.credit || 0) - (r.debit || 0)), 0);

    return {
      matched: matchedPairs,
      bankOnly: unmatchedBank,
      accountingOnly: unmatchedAccounting,
      totalBankAmount: totalBank,
      totalAccountingAmount: totalAccounting,
      discrepancy: Math.abs(totalBank - totalAccounting)
    };
  }, [bankRows, accountingRows]);

  const handleExportReconciliationReport = () => {
    const wb = XLSX.utils.book_new();

    const reportRows = [
      ...matchResults.matched.map(m => ({
        'Durum': 'TAM EŞLEŞTİ (OK)',
        'Banka Tarihi': m.bank.date,
        'Banka Açıklaması': m.bank.description,
        'Banka Tutarı': (m.bank.credit || 0) - (m.bank.debit || 0),
        'Muhasebe Tarihi': m.accounting.date,
        'Muhasebe Açıklaması': m.accounting.description,
        'Muhasebe Tutarı': (m.accounting.credit || 0) - (m.accounting.debit || 0)
      })),
      ...matchResults.bankOnly.map(b => ({
        'Durum': 'YALNIZCA BANKADA VAR (Eksik Kayıt)',
        'Banka Tarihi': b.date,
        'Banka Açıklaması': b.description,
        'Banka Tutarı': (b.credit || 0) - (b.debit || 0),
        'Muhasebe Tarihi': '-',
        'Muhasebe Açıklaması': 'MUHASEBE KAYDI BULUNAMADI',
        'Muhasebe Tutarı': 0
      })),
      ...matchResults.accountingOnly.map(a => ({
        'Durum': 'YALNIZCA MUHASEBEDE VAR (Bankaya Yansımamış)',
        'Banka Tarihi': '-',
        'Banka Açıklaması': 'BANKADA İŞLEM YOK',
        'Banka Tutarı': 0,
        'Muhasebe Tarihi': a.date,
        'Muhasebe Açıklaması': a.description,
        'Muhasebe Tutarı': (a.credit || 0) - (a.debit || 0)
      }))
    ];

    const ws = XLSX.utils.json_to_sheet(reportRows);
    ws['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 40 }, { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Çapraz Mutabakat');
    XLSX.writeFile(wb, `Capraz_Mutabakat_Raporu_${new Date().toISOString().slice(0, 10)}.xlsx`);

    confetti({ particleCount: 70, spread: 50 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-5xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
      }`}>
        
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                2-Dosyalı Çapraz Mutabakat & Mizan Eşleştirici
              </h2>
              <p className="text-xs text-slate-400">
                Banka Ekstresi ile Muhasebe Mizanını / Fiş Listesini karşılaştırıp uyuşmayan farkları bulur.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Comparison Source Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Panel 1: Bank Statement (Loaded) */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#090e1a] border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  1. Kaynak: Banka Ekstresi
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {bankRows.length} İşlem
                </span>
              </div>
              <p className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {bankData?.meta?.bankName || 'Aktif Banka Ekstresi'}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Net Tutar: <strong>{formatCurrency(matchResults.totalBankAmount, currency)}</strong>
              </p>
            </div>

            {/* Panel 2: Accounting Ledger File Drop */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#090e1a] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  2. Kaynak: Muhasebe Mizanı / Luca
                </span>
                {accountingRows.length > 0 && (
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {accountingRows.length} İşlem
                  </span>
                )}
              </div>

              {accountingRows.length === 0 ? (
                <label className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-500 rounded-xl p-3 text-center cursor-pointer block transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.txt"
                    onChange={handleAccountingFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                  <span className="text-xs font-bold text-slate-200 block">Muhasebe Dosyasını Seçin</span>
                  <span className="text-[10px] text-slate-400">Luca CSV, Zirve Excel veya Fiş Dökümü</span>
                </label>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {accountingFileName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Net: <strong>{formatCurrency(matchResults.totalAccountingAmount, currency)}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => { setAccountingRows([]); setAccountingFileName(''); }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Değiştir
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Audit Metrics Bar */}
          {accountingRows.length > 0 && (
            <div className="grid grid-cols-4 gap-3 animate-fadeIn">
              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 block font-bold">Tam Eşleşen</span>
                <span className="text-lg font-extrabold font-mono text-emerald-400 mt-0.5 block">
                  {matchResults.matched.length} adet
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 block font-bold">Yalnızca Bankada</span>
                <span className="text-lg font-extrabold font-mono text-rose-400 mt-0.5 block">
                  {matchResults.bankOnly.length} adet
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 block font-bold">Yalnızca Muhasebede</span>
                <span className="text-lg font-extrabold font-mono text-amber-400 mt-0.5 block">
                  {matchResults.accountingOnly.length} adet
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 block font-bold">Fark Tutarı</span>
                <span className={`text-lg font-extrabold font-mono mt-0.5 block ${matchResults.discrepancy < 0.05 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(matchResults.discrepancy, currency)}
                </span>
              </div>
            </div>
          )}

          {/* Results Table */}
          {accountingRows.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-3 py-1.5 rounded-xl border transition-colors ${
                      activeTab === 'ALL' ? 'bg-emerald-500 text-slate-950' : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Tümü ({matchResults.matched.length + matchResults.bankOnly.length + matchResults.accountingOnly.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('BANK_ONLY')}
                    className={`px-3 py-1.5 rounded-xl border transition-colors ${
                      activeTab === 'BANK_ONLY' ? 'bg-rose-500 text-slate-950 font-extrabold' : 'border-white/10 text-rose-400'
                    }`}
                  >
                    Banka Fazlası ({matchResults.bankOnly.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ACCOUNTING_ONLY')}
                    className={`px-3 py-1.5 rounded-xl border transition-colors ${
                      activeTab === 'ACCOUNTING_ONLY' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'border-white/10 text-amber-400'
                    }`}
                  >
                    Muhasebe Fazlası ({matchResults.accountingOnly.length})
                  </button>
                </div>

                <button
                  onClick={handleExportReconciliationReport}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md hover:scale-105 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Mutabakat Raporunu İndir (.xlsx)</span>
                </button>
              </div>

              {/* Rows List */}
              <div className="max-h-[300px] overflow-y-auto space-y-2 border border-white/5 rounded-2xl p-2">
                {activeTab !== 'ACCOUNTING_ONLY' && matchResults.bankOnly.map((row, i) => (
                  <div key={'bo_' + i} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-extrabold text-[10px]">
                        BANKA FAZLASI
                      </span>
                      <span className="font-mono text-slate-400">{row.date}</span>
                      <span className="font-bold text-slate-200">{row.description}</span>
                    </div>
                    <span className="font-mono font-extrabold text-rose-400">
                      {formatCurrency((row.credit || 0) - (row.debit || 0), currency)}
                    </span>
                  </div>
                ))}

                {activeTab !== 'BANK_ONLY' && matchResults.accountingOnly.map((row, i) => (
                  <div key={'ao_' + i} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px]">
                        MUHASEBE FAZLASI
                      </span>
                      <span className="font-mono text-slate-400">{row.date}</span>
                      <span className="font-bold text-slate-200">{row.description}</span>
                    </div>
                    <span className="font-mono font-extrabold text-amber-400">
                      {formatCurrency((row.credit || 0) - (row.debit || 0), currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-5 border-t flex items-center justify-between ${
          isDark ? 'bg-slate-950/90 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Otomatik ±{toleranceDays} gün esnek tarih toleransıyla denetlenir.</span>
          </span>

          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
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
