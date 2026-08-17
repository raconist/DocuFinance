import React, { useState, useEffect } from 'react';
import { X, Database, FileSpreadsheet, Trash2, Download, ArrowRight, CheckCircle2, Clock, HardDrive, Cloud, AlertCircle } from 'lucide-react';
import { getAllStatementsFromLocalDB, deleteStatementFromLocalDB, clearAllStatementsFromLocalDB } from '../utils/dbStorage';
import { formatCurrency } from '../utils/parserEngine';
import { exportToExcel } from '../utils/exportEngine';
import { isSupabaseConfigured } from '../utils/supabase';

export default function HistoryModal({ isOpen, onClose, onSelectStatement }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on open
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const records = await getAllStatementsFromLocalDB();
      setHistoryList(records);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteStatementFromLocalDB(id);
    await loadHistory();
  };

  const handleClearAll = async () => {
    if (window.confirm('Tüm yerel ekstre geçmişini silmek istediğinize emin misiniz?')) {
      await clearAllStatementsFromLocalDB();
      await loadHistory();
    }
  };

  const handleQuickExport = (stmt, e) => {
    e.stopPropagation();
    exportToExcel(stmt.data, {
      fileName: `${stmt.bankName}_${new Date(stmt.createdAt).toISOString().slice(0, 10)}`,
      currency: stmt.currency
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#090d16] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col justify-between">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                Kayıtlı Ekstrelerim & Veritabanı
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                  {historyList.length} Ekstre
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tarayıcınızın yerel IndexedDB belleğinde saklanan şifreli ekstre geçmişi.
              </p>
            </div>
          </div>

          {/* Database mode badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0d1527] border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
              <HardDrive className="w-3 h-3" />
              <span>İstemci IndexedDB: Aktif</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
              isSupabaseConfigured 
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-900 border-white/10 text-slate-400'
            }`}>
              <Cloud className="w-3 h-3" />
              <span>Bulut PostgreSQL: {isSupabaseConfigured ? 'Bağlı' : 'Hazır (Opsiyonel)'}</span>
            </span>
          </div>
        </div>

        {/* Statements List Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[280px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span>Veritabanı Yükleniyor...</span>
            </div>
          ) : historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Henüz Kayıtlı Ekstre Yok</h3>
              <p className="text-xs max-w-sm">
                Bir banka ekstresi veya fatura yüklediğinizde, verileriniz otomatik olarak bu güvenli yerel veritabanına kaydedilir.
              </p>
            </div>
          ) : (
            historyList.map((stmt) => (
              <div
                key={stmt.id}
                onClick={() => {
                  onSelectStatement(stmt.data);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5 sm:mt-0">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {stmt.bankName}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {stmt.transactionCount} Satır
                      </span>
                      {stmt.isReconciled && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          %100 Mutabakat
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                      <span className="flex items-center gap-1 text-slate-500 font-sans">
                        <Clock className="w-3 h-3" />
                        {new Date(stmt.createdAt).toLocaleDateString('tr-TR')} {new Date(stmt.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-emerald-400 font-semibold">+{formatCurrency(stmt.totalCredit, stmt.currency)}</span>
                      <span className="text-rose-400 font-semibold">-{formatCurrency(stmt.totalDebit, stmt.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => handleQuickExport(stmt, e)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
                    title="Excel (.xlsx) Olarak İndir"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Excel</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(stmt.id, e)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 border border-white/10 transition-colors"
                    title="Bu kaydı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-1.5 text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Clear All */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Kayıtlar sadece bu tarayıcıda saklanır (Sıfır Sunucu İzi)</span>
          </div>

          {historyList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
            >
              Tüm Geçmişi Temizle
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
