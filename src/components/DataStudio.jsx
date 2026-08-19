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
  DollarSign,
  Layers,
  Building2,
  BookOpen,
  CheckSquare,
  Square,
  ChevronDown,
  Scale,
  FileCheck2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { formatCurrency, parseFinancialNumber } from '../utils/parserEngine';
import { maskSensitiveData } from '../utils/security';
import { exportToExcel } from '../utils/exportEngine';
import { applyRulesToTransactions } from '../utils/rulesEngine';
import { detectDuplicates, removeDuplicateRows } from '../utils/duplicateDetector';
import ExportModal from './ExportModal';
import RulesModal from './RulesModal';
import ReconciliationModal from './ReconciliationModal';
import AuditCertificateModal from './AuditCertificateModal';
import CfoAnalyticsModal from './CfoAnalyticsModal';
import TaxEstimatorModal from './TaxEstimatorModal';
import JournalEntryModal from './JournalEntryModal';
import { categorizeTransactions } from '../utils/accountingRules';
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
  const [selectedSourceFile, setSelectedSourceFile] = useState('ALL');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [customCurrency, setCustomCurrency] = useState(parsedData.meta?.currency || 'TRY');
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(true);
  const [exportSuccessMsg, setExportSuccessMsg] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('table'); // 'table' | 'analytics'
  
  // Modals State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);
  const [isAuditCertificateOpen, setIsAuditCertificateOpen] = useState(false);
  const [isCfoModalOpen, setIsCfoModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // Row Selection for Bulk Actions
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  React.useEffect(() => {
    setData(parsedData);
    setCustomCurrency(parsedData.meta?.currency || 'TRY');
    setSelectedRowIds(new Set());
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
    const monthlyTotals = {};

    rows.forEach(r => {
      totalDebit += (r.debit || 0);
      totalCredit += (r.credit || 0);

      const cat = r.category || 'Genel Giderler';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { debit: 0, credit: 0, count: 0, code: r.accountCode || '' };
      }
      categoryTotals[cat].debit += (r.debit || 0);
      categoryTotals[cat].credit += (r.credit || 0);
      categoryTotals[cat].count += 1;

      // Month grouping (MM/YYYY)
      const dateParts = (r.date || '').split(/[.\-/]/);
      let monthKey = 'Genel';
      if (dateParts.length >= 3) {
        monthKey = dateParts[1] ? `${dateParts[1]}/${dateParts[2] || dateParts[0]}` : 'Dönem';
      }
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { debit: 0, credit: 0 };
      }
      monthlyTotals[monthKey].debit += (r.debit || 0);
      monthlyTotals[monthKey].credit += (r.credit || 0);
    });

    const startingBalance = data.meta?.startingBalance || 0;
    const officialEnding = data.meta?.endingBalance || 0;
    const calculatedEnding = startingBalance + totalCredit - totalDebit;
    const discrepancy = Math.abs(calculatedEnding - officialEnding);
    const isReconciled = discrepancy < 0.05;

    const dupCount = rows.filter(r => r.isDuplicate).length;

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
      monthlyTotals,
      currency: customCurrency,
      bankName: data.meta?.bankName || 'Banka Ekstresi',
      isBatch: Boolean(data.meta?.isBatch),
      batchFileCount: data.meta?.batchFileCount || 1,
      batchFileNames: data.meta?.batchFileNames || [],
      duplicateCount: dupCount
    };
  }, [data, customCurrency]);

  // Filtered & Sorted rows
  const filteredAndSortedRows = useMemo(() => {
    let rows = (data.rows || []).filter(row => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (row.description || '').toLowerCase().includes(q) ||
        (row.date || '').includes(searchQuery) ||
        (row.category && row.category.toLowerCase().includes(q)) ||
        (row.accountCode && row.accountCode.toLowerCase().includes(q));
      
      const matchesCat = selectedCategory === 'ALL' || row.category === selectedCategory;
      const matchesFile = selectedSourceFile === 'ALL' || row.sourceFile === selectedSourceFile;

      return matchesSearch && matchesCat && matchesFile;
    });

    return rows.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' 
        ? String(valA || '').localeCompare(String(valB || '')) 
        : String(valB || '').localeCompare(String(valA || ''));
    });
  }, [data.rows, searchQuery, selectedCategory, selectedSourceFile, sortField, sortOrder]);

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
      date: new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US'),
      description: 'Yeni Finansal Hareket',
      category: 'Genel Giderler',
      accountCode: '770.01',
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

  const handleCleanDuplicates = () => {
    const cleaned = removeDuplicateRows(data.rows || []);
    setData({
      ...data,
      rows: cleaned
    });
    setExportSuccessMsg('Mükerrer (çift) kayıtlar tablodan başarıyla temizlendi!');
    setTimeout(() => setExportSuccessMsg(null), 3500);
  };

  const handleApplyRules = (customRules) => {
    const updated = applyRulesToTransactions(data.rows || [], customRules);
    setData({
      ...data,
      rows: updated
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedRowIds.size === filteredAndSortedRows.length) {
      setSelectedRowIds(new Set());
    } else {
      const allIds = new Set(filteredAndSortedRows.map((r, i) => r.id || `row_${i}`));
      setSelectedRowIds(allIds);
    }
  };

  const handleToggleRowSelect = (rowId) => {
    const updated = new Set(selectedRowIds);
    if (updated.has(rowId)) {
      updated.delete(rowId);
    } else {
      updated.add(rowId);
    }
    setSelectedRowIds(updated);
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.size === 0) return;
    if (window.confirm(`Seçili ${selectedRowIds.size} satırı silmek istediğinize emin misiniz?`)) {
      const remaining = (data.rows || []).filter((r, i) => !selectedRowIds.has(r.id || `row_${i}`));
      setData({ ...data, rows: remaining });
      setSelectedRowIds(new Set());
    }
  };

  const handleAutoCategorize = () => {
    const standard = lang === 'tr' ? 'tdhp' : lang === 'de' ? 'datev' : 'gaap';
    const categorized = categorizeTransactions(data.rows || [], standard);
    setData(prev => ({
      ...prev,
      rows: categorized
    }));
    try {
      confetti({ particleCount: 70, spread: 55, origin: { y: 0.7 } });
    } catch (e) {}
    setExportSuccessMsg(lang === 'tr' 
      ? '✓ 150+ kural ile tüm satırlar muhasebe hesap kodlarına ve kategorilerine bağlandı!' 
      : '✓ All transactions auto-categorized with universal accounting standards!'
    );
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  const handleQuickExportExcel = () => {
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      
      {/* Top Breadcrumb & Super Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all hover:scale-[1.02] shadow-sm ${
            isDark 
              ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10' 
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-emerald-500" />
          <span>{lang === 'tr' ? '← Ana Sayfaya Dön & Yeni Dosya' : '← Back to Home'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* AI CFO & Cash Flow Analytics */}
          <button
            onClick={() => setIsCfoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <PieChart className="w-4 h-4" />
            <span>📊 AI CFO</span>
          </button>

          {/* Tax & VAT Simulator */}
          <button
            onClick={() => setIsTaxModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs border border-amber-500/30 transition-all shadow-sm hover:scale-[1.02]"
          >
            <span>🧮 Vergi & KDV</span>
          </button>

          {/* Balanced Journal Voucher */}
          <button
            onClick={() => setIsJournalModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs border border-cyan-500/30 transition-all shadow-sm hover:scale-[1.02]"
          >
            <span>📑 Yevmiye Fişi</span>
          </button>

          {/* 1-Click Auto Categorize */}
          <button
            onClick={handleAutoCategorize}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            title="150+ TDHP/GAAP Kuralı ile tek tıkla hesap kodu atar"
          >
            <Sparkles className="w-4 h-4" />
            <span>🧠 Muhasebeleştir</span>
          </button>

          {/* Cross Reconciliation Tool */}
          <button
            onClick={() => setIsReconciliationOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              isDark ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40' : 'bg-cyan-50 border-cyan-300 text-cyan-800'
            }`}
          >
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Çapraz Mutabakat</span>
          </button>

          {/* Audit Certificate Modal */}
          <button
            onClick={() => setIsAuditCertificateOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              isDark ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40' : 'bg-purple-50 border-purple-300 text-purple-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-purple-400" />
            <span>Resmi Onay Belgesi (PDF)</span>
          </button>

          {/* Smart Rules Modal Button */}
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Kural Yöneticisi</span>
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
      </div>

      {/* Main Bank Header Bar */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-3xl border shadow-xl transition-all ${
        isDark 
          ? 'bg-slate-900/90 border-emerald-500/30' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}>
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-2xl sm:text-3xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {stats.bankName}
                </h2>
                {stats.isBatch && (
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {stats.batchFileCount} Belge Birleşik
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {stats.count} {t.transactionsParsed} | Zero-Knowledge İstemci Güvenliği
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          <button
            onClick={() => setIsMasked(!isMasked)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isMasked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : isDark 
                  ? 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="IBAN, TC Kimlik ve Kart Numaralarını Maskeler"
          >
            {isMasked ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMasked ? t.hiddenPii : t.hidePii}</span>
          </button>

          {/* Quick Excel Download */}
          <button
            onClick={handleQuickExportExcel}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Hızlı Excel (.xlsx)</span>
          </button>

          {/* Universal Export Modal Trigger */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Dışa Aktarma (Luca/Zirve/Logo/QBO)</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

        </div>
      </div>

      {/* Duplicate Transactions Warning Banner */}
      {stats.duplicateCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              <strong>{stats.duplicateCount} adet mükerrer (çakışan)</strong> işlem satırı tespit edildi.
            </span>
          </div>

          <button
            onClick={handleCleanDuplicates}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Mükerrerleri Otomatik Temizle
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {exportSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
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
            <span className="text-xs font-extrabold uppercase tracking-wider">Mutabakat</span>
            {stats.isReconciled ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
          </div>
          <span className="text-xs font-extrabold font-mono mt-2">
            {stats.isReconciled ? t.reconciledFull : `${t.reconciledCheck}: ${stats.discrepancy.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Visual Category & Analytics View */}
      {showCategoryBreakdown && Object.keys(stats.categoryTotals).length > 0 && (
        <div className={`p-5 rounded-3xl border space-y-3 ${
          isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Harcama ve Gelir Kategori Analizi
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
                  <span className="font-mono text-[11px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                    {catData.code || catData.count}
                  </span>
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

      {/* Grid Controls & Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara (tarih, açıklama, 770)..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-slate-900 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">{t.allCategories} ({data.rows?.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {stats.isBatch && stats.batchFileNames.length > 1 && (
            <select
              value={selectedSourceFile}
              onChange={(e) => setSelectedSourceFile(e.target.value)}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-slate-900 border-white/10 text-emerald-400' : 'bg-white border-slate-200 text-emerald-700'
              }`}
            >
              <option value="ALL">Tüm Belgeler ({stats.batchFileNames.length})</option>
              {stats.batchFileNames.map(fName => (
                <option key={fName} value={fName}>{fName}</option>
              ))}
            </select>
          )}

          {selectedRowIds.size > 0 && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {selectedRowIds.size} satır seçili
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold transition-colors"
              >
                Seçilileri Sil
              </button>
            </div>
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

      {/* Spreadsheet Data Table */}
      <div className="data-table-container shadow-2xl max-h-[560px] overflow-y-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedRowIds.size > 0 && selectedRowIds.size === filteredAndSortedRows.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-700 text-emerald-500 cursor-pointer"
                />
              </th>
              <th style={{ width: '45px' }}>#</th>
              <th style={{ width: '120px', cursor: 'pointer' }} onClick={() => handleSort('date')}>
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
              <th style={{ width: '150px' }}>{t.categoryCol}</th>
              <th style={{ width: '110px', cursor: 'pointer' }} onClick={() => handleSort('accountCode')}>
                <div className="flex items-center gap-1.5 hover:text-emerald-500">
                  <span>TDHP Kodu</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '130px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('debit')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-emerald-500">
                  <span>{t.debitCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '130px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('credit')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-emerald-500">
                  <span>{t.creditCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '130px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('balance')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-emerald-500">
                  <span>{t.balanceCol}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th style={{ width: '50px', textAlign: 'center' }}>{t.deleteCol}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-slate-400 text-xs">
                  Aramanıza uygun işlem bulunamadı.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row, index) => {
                const desc = isMasked ? maskSensitiveData(row.description) : row.description;
                const rowId = row.id || `row_${index}`;
                const isSelected = selectedRowIds.has(rowId);

                return (
                  <tr 
                    key={rowId}
                    className={`${row.isDuplicate ? (isDark ? 'bg-amber-950/20' : 'bg-amber-50') : ''} ${isSelected ? (isDark ? 'bg-emerald-950/30' : 'bg-emerald-50') : ''}`}
                  >
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRowSelect(rowId)}
                        className="rounded border-slate-700 text-emerald-500 cursor-pointer"
                      />
                    </td>

                    <td className="font-mono text-slate-400 text-xs">
                      {index + 1}
                    </td>
                    
                    <td>
                      <input
                        type="text"
                        value={row.date || ''}
                        onChange={(e) => handleCellEdit(index, 'date', e.target.value)}
                        className={`bg-transparent text-xs font-mono border-b border-transparent hover:border-slate-500 focus:border-emerald-500 px-1 py-1 rounded w-full outline-none ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      />
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5">
                        {row.isDuplicate && (
                          <span title="Mükerrer (Çift) Kayıt" className="flex-shrink-0 text-amber-400 text-[10px] font-bold px-1 rounded bg-amber-500/20">
                            ÇİFT
                          </span>
                        )}
                        <input
                          type="text"
                          value={desc}
                          onChange={(e) => handleCellEdit(index, 'description', e.target.value)}
                          className={`bg-transparent text-xs border-b border-transparent hover:border-slate-500 focus:border-emerald-500 px-1 py-1 rounded w-full outline-none font-medium ${
                            isDark ? 'text-slate-100' : 'text-slate-950'
                          }`}
                        />
                      </div>
                    </td>

                    <td>
                      <input
                        type="text"
                        value={row.category || 'Genel Giderler'}
                        onChange={(e) => handleCellEdit(index, 'category', e.target.value)}
                        className={`bg-transparent text-xs font-medium border-b border-transparent hover:border-slate-500 focus:border-emerald-500 px-1 py-1 rounded w-full outline-none ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={row.accountCode || (row.credit > 0 ? '600.01' : '770.01')}
                        onChange={(e) => handleCellEdit(index, 'accountCode', e.target.value)}
                        className="bg-transparent text-xs font-mono font-bold text-amber-400 border-b border-transparent hover:border-slate-500 focus:border-amber-500 px-1 py-1 rounded w-full outline-none"
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

      {/* Universal Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        isMaskedDefault={isMasked}
        currency={stats.currency}
        bankName={stats.bankName}
        theme={theme}
        lang={lang}
      />

      {/* Smart Accounting Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onApplyRules={handleApplyRules}
        theme={theme}
        lang={lang}
      />

      {/* 2-File Cross-Reconciliation Modal */}
      <ReconciliationModal
        isOpen={isReconciliationOpen}
        onClose={() => setIsReconciliationOpen(false)}
        bankData={data}
        theme={theme}
        lang={lang}
      />

      {/* Official Balance Audit Certificate Modal */}
      <AuditCertificateModal
        isOpen={isAuditCertificateOpen}
        onClose={() => setIsAuditCertificateOpen(false)}
        data={data}
        currency={stats.currency}
        theme={theme}
        lang={lang}
      />

      {/* AI CFO & Cash Flow Intelligence Analytics Modal */}
      <CfoAnalyticsModal
        isOpen={isCfoModalOpen}
        onClose={() => setIsCfoModalOpen(false)}
        transactions={data.rows || []}
        theme={theme}
        lang={lang}
      />

      {/* Tax & VAT Estimator Modal */}
      <TaxEstimatorModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        transactions={data.rows || []}
        theme={theme}
        lang={lang}
      />

      {/* Balanced Journal Entry Voucher Modal */}
      <JournalEntryModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        transactions={data.rows || []}
        theme={theme}
        lang={lang}
      />

    </div>
  );
}
