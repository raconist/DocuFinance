import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Eye,
  ArrowRight,
  FileText,
  Calendar,
  Layers,
  FolderOpen
} from 'lucide-react';
import { logoutUser } from '../utils/authService';
import { getAllStatementsFromLocalDB } from '../utils/dbStorage';
import { formatCurrency } from '../utils/parserEngine';
import { exportToExcel } from '../utils/exportEngine';
import { TRANSLATIONS } from '../utils/i18n';

export default function AccountDashboardModal({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  onOpenPricing,
  onSelectStatement,
  theme = 'dark',
  lang = 'tr' 
}) {
  const [downloadToast, setDownloadToast] = useState(null);
  const [statements, setStatements] = useState([]);
  const [isLoadingStatements, setIsLoadingStatements] = useState(false);
  const [expandedStatementId, setExpandedStatementId] = useState(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load statements from DB when modal is opened
  useEffect(() => {
    if (isOpen) {
      loadStatements();
    }
  }, [isOpen, user]);

  const loadStatements = async () => {
    setIsLoadingStatements(true);
    try {
      const records = await getAllStatementsFromLocalDB(user?.id || null);
      setStatements(records || []);
      // If there's only 1 statement, auto expand it so the user can immediately see the transactions
      if (records && records.length === 1) {
        setExpandedStatementId(records[0].id);
      }
    } catch (e) {
      console.error('Error loading statements:', e);
    } finally {
      setIsLoadingStatements(false);
    }
  };

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

  const handleOpenInStudio = (stmtData) => {
    if (onSelectStatement && stmtData) {
      onSelectStatement(stmtData);
      onClose();
    }
  };

  const handleQuickExport = (stmt, e) => {
    e.stopPropagation();
    exportToExcel(stmt.data, {
      fileName: `${stmt.bankName}_${new Date(stmt.createdAt).toISOString().slice(0, 10)}`,
      currency: stmt.currency
    });
  };

  const toggleExpand = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedStatementId(prev => (prev === id ? null : id));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-3xl my-auto rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b shrink-0 flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-md shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg sm:text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
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
            title="Kapat (ESC)"
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
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
              <div 
                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer hover:border-emerald-500/40 ${
                  isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => {
                  const el = document.getElementById('processed-documents-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="flex justify-center mb-1 text-cyan-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold font-mono text-white block">
                  {user.stats?.totalParsedStatements ?? statements.length}
                </span>
                <span className="text-[11px] text-slate-400">{t.statsParsedStatements} ({t.unitsCount})</span>
              </div>

              <div 
                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer hover:border-emerald-500/40 ${
                  isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => {
                  const el = document.getElementById('processed-documents-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="flex justify-center mb-1 text-emerald-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold font-mono text-emerald-400 block">
                  {user.stats?.totalTransactionsProcessed ?? (statements.reduce((acc, s) => acc + (s.transactionCount || 0), 0))}
                </span>
                <span className="text-[11px] text-slate-400">{t.statsProcessedRows} ({t.rowsUnit})</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-center mb-1 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold font-mono text-amber-400 block">
                  ~{user.stats?.hoursSaved ?? 0.1} {t.hoursUnit}
                </span>
                <span className="text-[11px] text-slate-400">{t.statsSavedTime}</span>
              </div>
            </div>
          </div>

          {/* Processed Documents & Interactive Transactions Viewer Section */}
          <div id="processed-documents-section" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                <span>İşlenen Dökümanlar & Hesap Hareketleri ({statements.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Detayları görmek için dökümana tıklayın
              </span>
            </div>

            {isLoadingStatements ? (
              <div className="p-8 rounded-2xl border border-white/5 bg-slate-950/40 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span>Kayıtlı işlemler taranıyor...</span>
              </div>
            ) : statements.length === 0 ? (
              <div className={`p-6 rounded-2xl border text-center ${
                isDark ? 'bg-slate-950/40 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
                <p className="text-xs font-bold text-white mb-1">Henüz Kayıtlı İşlem Bulunamadı</p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Bir banka ekstresi veya fatura yüklediğinizde, yapılan tüm işlemler ve satır detayları burada görüntülenecektir.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {statements.map((stmt) => {
                  const isExpanded = expandedStatementId === stmt.id;
                  const rows = stmt.data?.rows || [];
                  const totalCredit = stmt.totalCredit || 0;
                  const totalDebit = stmt.totalDebit || 0;

                  return (
                    <div 
                      key={stmt.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? isDark ? 'bg-slate-950/90 border-emerald-500/50 shadow-lg' : 'bg-slate-50 border-emerald-400 shadow-md'
                          : isDark ? 'bg-slate-950/50 border-white/5 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Document Card Header */}
                      <div 
                        onClick={() => toggleExpand(stmt.id)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {stmt.bankName || 'Banka Ekstresi'}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/10 font-mono">
                                {stmt.transactionCount || rows.length} Hareket
                              </span>
                              {stmt.isReconciled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  ✓ Mutabık
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono flex-wrap">
                              <span className="text-slate-400 flex items-center gap-1 font-sans">
                                <FileText className="w-3 h-3 text-slate-500" />
                                <span className="truncate max-w-[140px]">{stmt.fileName || 'Ekstre_Belgesi.pdf'}</span>
                              </span>
                              <span className="text-slate-500">|</span>
                              <span className="text-emerald-400 font-bold">+{formatCurrency(totalCredit, stmt.currency)}</span>
                              <span className="text-rose-400 font-bold">-{formatCurrency(totalDebit, stmt.currency)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenInStudio(stmt.data)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-sm hover:scale-105 transition-all"
                            title="Bu ekstredeki tüm işlemleri ana tabloda aç ve düzenle"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Tabloda Aç</span>
                          </button>

                          <button
                            onClick={(e) => handleQuickExport(stmt, e)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors"
                            title="Excel İndir"
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                          </button>

                          <button
                            onClick={(e) => toggleExpand(stmt.id, e)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors"
                            title={isExpanded ? 'Detayları Gizle' : 'İşlem Detaylarını Gör'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Transactions Detail Table */}
                      {isExpanded && (
                        <div className={`border-t p-4 space-y-3 animate-fadeIn ${
                          isDark ? 'border-white/10 bg-slate-950/80' : 'border-slate-200 bg-white'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Dökümandaki Finansal İşlem Kalemleri ({rows.length})</span>
                            </span>
                            <button
                              onClick={() => handleOpenInStudio(stmt.data)}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                            >
                              <span>Tabloya Aktar & Düzenle</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-white/10 max-h-60 overflow-y-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className={`sticky top-0 z-10 ${
                                isDark ? 'bg-slate-900 text-slate-300 border-b border-white/10' : 'bg-slate-100 text-slate-700 border-b border-slate-200'
                              }`}>
                                <tr>
                                  <th className="p-2.5">Tarih</th>
                                  <th className="p-2.5">Açıklama</th>
                                  <th className="p-2.5">Kategori / TDHP</th>
                                  <th className="p-2.5 text-right">Alacak (Gelir)</th>
                                  <th className="p-2.5 text-right">Borç (Gider)</th>
                                  <th className="p-2.5 text-right">Bakiye</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 font-mono">
                                {rows.map((r, idx) => (
                                  <tr 
                                    key={idx} 
                                    className={isDark ? 'hover:bg-slate-900/50 text-slate-300' : 'hover:bg-slate-50 text-slate-800'}
                                  >
                                    <td className="p-2.5 whitespace-nowrap text-slate-400">{r.date || '-'}</td>
                                    <td className="p-2.5 font-sans font-medium text-slate-200 max-w-[200px] truncate" title={r.description}>
                                      {r.description || '-'}
                                    </td>
                                    <td className="p-2.5 font-sans whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/10">
                                        {r.accountCode ? `${r.accountCode} - ${r.category}` : (r.category || 'Genel')}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-right whitespace-nowrap text-emerald-400 font-bold">
                                      {r.credit ? `+${formatCurrency(r.credit, stmt.currency)}` : '-'}
                                    </td>
                                    <td className="p-2.5 text-right whitespace-nowrap text-rose-400 font-bold">
                                      {r.debit ? `-${formatCurrency(r.debit, stmt.currency)}` : '-'}
                                    </td>
                                    <td className="p-2.5 text-right whitespace-nowrap font-bold text-slate-400">
                                      {r.balance !== undefined ? formatCurrency(r.balance, stmt.currency) : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
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
        <div className={`p-4 border-t shrink-0 flex items-center justify-between ${
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
            className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${
              isDark ? 'border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
            }`}
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}

