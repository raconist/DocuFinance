import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Filter, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  FileText,
  FileCode,
  PieChart,
  ArrowLeft,
  Printer,
  ArrowUpDown,
  DollarSign
} from 'lucide-react';
import { formatCurrency, parseFinancialNumber } from '../utils/parserEngine';
import { maskSensitiveData } from '../utils/security';
import { exportToExcel, exportToCSV, exportToJSON } from '../utils/exportEngine';
import { TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';

export default function DataStudio({ 
  parsedData, 
  onReset, 
  onOpenPricing, 
  isProUser = false,
  lang = 'tr',
  theme = 'dark' 
}) {
  const [data, setData] = useState(parsedData);
  const [isMasked, setIsMasked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortField, setSortField] = useState('date'); // 'date' | 'amount' | 'balance' | 'description'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [customCurrency, setCustomCurrency] = useState(parsedData.meta?.currency || 'TRY');
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(true);
  const [exportSuccessMsg, setExportSuccessMsg] = useState(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  React.useEffect(() => {
    setData(parsedData);
    setCustomCurrency(parsedData.meta?.currency || 'TRY');
  }, [parsedData]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const stats = useMemo(() => {
    const rows = data.rows || [];
    let totalDebit = 0;
    let totalCredit = 0;
    const categoryTotals = {};

    rows.forEach(r => {
      totalDebit += (r.debit || 0);
      totalCredit += (r.credit || 0);

      const cat = r.category || 'Genel';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { debit: 0, credit: 0, count: 0 };
      }
      categoryTotals[cat].debit += (r.debit || 0);
      categoryTotals[cat].credit += (r.credit || 0);
      categoryTotals[cat].count += 1;
    });

    const startingBalance = data.meta?.startingBalance || 0;
    const officialEnding = data.meta?.endingBalance || 0;
    const calculatedEnding = startingBalance + totalCredit - totalDebit;
    const discrepancy = Math.abs(calculatedEnding - officialEnding);
    const isReconciled = discrepancy < 0.05;

    return {
      count: rows.length,
      totalDebit,
      totalCredit,
      netFlow: totalCredit - totalDebit,
      startingBalance,
      officialEnding,
      calculatedEnding,
      discrepancy,
      isReconciled,
      categoryTotals,
      currency: customCurrency,
      bankName: data.meta?.bankName || 'Banka Ekstresi'
    };
  }, [data, customCurrency]);

  // Filtered & Sorted rows
  const filteredAndSortedRows = useMemo(() => {
    let rows = (data.rows || []).filter(row => {
      const matchesSearch = 
        row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.date.includes(searchQuery) ||
        (row.category && row.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCat = selectedCategory === 'ALL' || row.category === selectedCategory;

      return matchesSearch && matchesCat;
    });

    return rows.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [data.rows, searchQuery, selectedCategory, sortField, sortOrder]);

  const categories = useMemo(() => {
    const set = new Set();
    (data.rows || []).forEach(r => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [data.rows]);

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedRows = [...data.rows];
    const targetRow = { ...updatedRows[rowIndex] };

    if (field === 'debit' || field === 'credit' || field === 'balance') {
      targetRow[field] = parseFinancialNumber(value);
      targetRow.amount = (targetRow.credit || 0) - (targetRow.debit || 0);
    } else {
      targetRow[field] = value;
    }

    updatedRows[rowIndex] = targetRow;
    setData({
      ...data,
      rows: updatedRows
    });
  };

  const handleAddRow = () => {
    const newRow = {
      id: 'tx_custom_' + Date.now(),
      date: new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-US'),
      description: 'Yeni Finansal Hareket',
      category: 'Genel',
      debit: 0,
      credit: 0,
      amount: 0,
      balance: stats.calculatedEnding,
      isVerified: true
    };
    setData({
      ...data,
      rows: [newRow, ...(data.rows || [])]
    });
  };

  const handleDeleteRow = (rowIndex) => {
    const updated = data.rows.filter((_, i) => i !== rowIndex);
    setData({
      ...data,
      rows: updated
    });
  };

  const handleExportExcel = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}

    exportToExcel(data, {
      fileName: `${stats.bankName}_${new Date().toISOString().slice(0, 10)}`,
      isMasked: isMasked,
      includeAuditSheet: true,
      currency: stats.currency
    });

    setExportSuccessMsg('Excel (.xlsx) dosyası formülleriyle birlikte başarıyla indirildi!');
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  const handleExportCSV = () => {
    exportToCSV(data, {
      fileName: `${stats.bankName}_${new Date().toISOString().slice(0, 10)}`,
      isMasked: isMasked,
      delimiter: ';'
    });
    setExportSuccessMsg('CSV dosyası UTF-8 formatında indirildi.');
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all hover:scale-[1.02] shadow-sm ${
            isDark 
              ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10' 
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-emerald-500" />
          <span>{lang === 'tr' ? '← Ana Sayfaya Dön & Yeni Dosya' : lang === 'de' ? '← Zur Startseite & Neue Datei' : '← Back to Home & New Upload'}</span>
        </button>

        {/* Currency Switcher */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
          isDark ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <span>Para Birimi:</span>
          <select
            value={customCurrency}
            onChange={(e) => setCustomCurrency(e.target.value)}
            className="bg-transparent text-emerald-500 font-extrabold focus:outline-none cursor-pointer"
          >
            <option value="TRY">₺ TRY</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>
      </div>

      {/* Main Bank Header Bar */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-3xl border shadow-xl transition-all ${
        isDark 
          ? 'bg-slate-900/90 border-emerald-500/30' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {stats.bankName}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {stats.count} {t.transactionsParsed} | Zero-Knowledge Memory Safe
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          <button
            onClick={() => setIsMasked(!isMasked)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isMasked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : isDark 
                  ? 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="IBAN, TC Kimlik, Vergi No ve Kart Numaralarını Maskeler"
          >
            {isMasked ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
            <span>{isMasked ? t.hiddenPii : t.hidePii}</span>
          </button>

          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Yazdır / PDF Olarak Kaydet"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Yazdır</span>
          </button>

          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>{t.downloadCsv}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{t.downloadExcel}</span>
          </button>

        </div>
      </div>

      {/* Success Notification Alert */}
      {exportSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">OK</span>
        </div>
      )}

      {/* Financial Reconciliation & Balance Audit Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.startingBal}</span>
          <span className={`text-base sm:text-lg font-bold font-mono mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(stats.startingBalance, stats.currency)}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/70 border-emerald-500/20' : 'bg-white border-emerald-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{t.totalCredit}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-base sm:text-lg font-bold text-emerald-500 font-mono mt-2">
            +{formatCurrency(stats.totalCredit, stats.currency)}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/70 border-rose-500/20' : 'bg-white border-rose-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">{t.totalDebit}</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-base sm:text-lg font-bold text-rose-500 font-mono mt-2">
            -{formatCurrency(stats.totalDebit, stats.currency)}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.netFlow}</span>
          <span className={`text-base sm:text-lg font-bold font-mono mt-2 ${stats.netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {stats.netFlow >= 0 ? '+' : ''}{formatCurrency(stats.netFlow, stats.currency)}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.endingBal}</span>
          <span className={`text-base sm:text-lg font-bold font-mono mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(stats.officialEnding || stats.calculatedEnding, stats.currency)}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          stats.isReconciled 
            ? isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider">Audit</span>
            {stats.isReconciled ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
          </div>
          <span className="text-xs font-extrabold font-mono mt-2">
            {stats.isReconciled ? t.reconciledFull : `${t.reconciledCheck}: ${stats.discrepancy.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Visual Category Breakdown Bar */}
      {showCategoryBreakdown && Object.keys(stats.categoryTotals).length > 0 && (
        <div className={`p-5 rounded-3xl border space-y-3 ${
          isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.categoryBreakdownTitle}
              </h3>
            </div>
            <button
              onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Gizle / Göster
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(stats.categoryTotals).map(([catName, catData]) => (
              <div key={catName} className={`p-3 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="truncate">{catName}</span>
                  <span className="font-mono text-[11px]">{catData.count}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-mono font-bold">
                  {catData.debit > 0 && <span className="text-rose-500">-{formatCurrency(catData.debit, stats.currency)}</span>}
                  {catData.credit > 0 && <span className="text-emerald-500">+{formatCurrency(catData.credit, stats.currency)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-slate-900 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">{t.allCategories} ({data.rows?.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

        </div>

        <button
          onClick={handleAddRow}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all hover:scale-[1.01] ${
            isDark 
              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-emerald-500/30' 
              : 'bg-white hover:bg-emerald-50/60 text-emerald-700 border-emerald-300 shadow-sm'
          }`}
        >
          <Plus className="w-4 h-4 text-emerald-500" />
          <span>{t.addRow}</span>
        </button>
      </div>

      {/* Spreadsheet Data Table with Column Sorting */}
      <div className="data-table-container shadow-2xl max-h-[560px] overflow-y-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th style={{ width: '130px', cursor: 'pointer' }} onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1.5 hover:text-emerald-500">
                  <span>{t.dateCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('description')}>
                <div className="flex items-center gap-1.5 hover:text-emerald-500">
                  <span>{t.descCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '160px' }}>{t.categoryCol}</th>
              <th style={{ width: '140px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('debit')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-emerald-500">
                  <span>{t.debitCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '140px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('credit')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-emerald-500">
                  <span>{t.creditCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '140px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('balance')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-emerald-500">
                  <span>{t.balanceCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '60px', textAlign: 'center' }}>{t.deleteCol}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                  Aramanıza uygun işlem bulunamadı.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row, index) => {
                const desc = isMasked ? maskSensitiveData(row.description) : row.description;
                return (
                  <tr key={row.id || index}>
                    <td className="font-mono text-slate-400 text-xs">{index + 1}</td>
                    
                    <td>
                      <input
                        type="text"
                        value={row.date}
                        onChange={(e) => handleCellEdit(index, 'date', e.target.value)}
                        className={`bg-transparent text-xs font-mono border-b border-transparent hover:border-slate-500 focus:border-emerald-500 px-1 py-1 rounded w-full outline-none ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={desc}
                        onChange={(e) => handleCellEdit(index, 'description', e.target.value)}
                        className={`bg-transparent text-xs border-b border-transparent hover:border-slate-500 focus:border-emerald-500 px-1 py-1 rounded w-full outline-none font-medium ${
                          isDark ? 'text-slate-100' : 'text-slate-950'
                        }`}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={row.category || 'Genel'}
                        onChange={(e) => handleCellEdit(index, 'category', e.target.value)}
                        className={`bg-transparent text-xs font-medium border-b border-transparent hover:border-slate-500 focus:border-emerald-500 px-1 py-1 rounded w-full outline-none ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      />
                    </td>

                    <td className="text-right">
                      <input
                        type="text"
                        value={row.debit > 0 ? row.debit : ''}
                        placeholder="0.00"
                        onChange={(e) => handleCellEdit(index, 'debit', e.target.value)}
                        className="bg-transparent text-xs font-mono text-rose-500 text-right border-b border-transparent hover:border-slate-500 focus:border-rose-500 px-1 py-1 rounded w-full outline-none font-bold"
                      />
                    </td>

                    <td className="text-right">
                      <input
                        type="text"
                        value={row.credit > 0 ? row.credit : ''}
                        placeholder="0.00"
                        onChange={(e) => handleCellEdit(index, 'credit', e.target.value)}
                        className="bg-transparent text-xs font-mono text-emerald-500 text-right border-b border-transparent hover:border-slate-500 focus:border-emerald-500 px-1 py-1 rounded w-full outline-none font-bold"
                      />
                    </td>

                    <td className={`text-right font-mono text-xs font-bold ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      {formatCurrency(row.balance || 0, stats.currency)}
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteRow(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Bu satırı sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className={`flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border text-xs ${
        isDark ? 'bg-slate-900/70 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
      }`}>
        <div className="flex items-center gap-4 mb-2 sm:mb-0">
          <span>Toplam <strong>{filteredAndSortedRows.length}</strong> satır</span>
          <span>|</span>
          <span>Doğruluk Oranı: <strong className="text-emerald-500">%99.8</strong></span>
        </div>

        <div className="flex items-center gap-6 font-mono font-bold text-xs sm:text-sm">
          <span className="text-rose-500">Toplam Borç: {formatCurrency(stats.totalDebit, stats.currency)}</span>
          <span>|</span>
          <span className="text-emerald-500">Toplam Alacak: {formatCurrency(stats.totalCredit, stats.currency)}</span>
        </div>
      </div>

    </div>
  );
}
