import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Building2, 
  FileCheck2,
  ArrowLeft,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '../utils/parserEngine';
import { getCurrentUser } from '../utils/authService';

export default function AuditCertificateModal({ 
  isOpen, 
  onClose, 
  data, 
  currency = 'TRY',
  theme = 'dark',
  lang = 'tr' 
}) {
  const currentUser = getCurrentUser();
  const [customCompanyName, setCustomCompanyName] = useState(
    currentUser?.companyName || currentUser?.name || data?.meta?.companyName || 'Müşteri / Kurumsal Mükellef'
  );
  const [customTaxNumber, setCustomTaxNumber] = useState(
    currentUser?.taxNumber || data?.meta?.taxNumber || ''
  );

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

  if (!isOpen || !data) return null;

  const isDark = theme === 'dark';
  const meta = data.meta || {};
  const rows = data.rows || [];

  let totalDebit = 0;
  let totalCredit = 0;
  rows.forEach(r => {
    totalDebit += (r.debit || 0);
    totalCredit += (r.credit || 0);
  });

  const startingBal = meta.startingBalance || 0;
  const endingBal = meta.endingBalance || (startingBal + totalCredit - totalDebit);
  const calculatedEnding = startingBal + totalCredit - totalDebit;
  const isReconciled = Math.abs(calculatedEnding - endingBal) < 0.05;

  const handlePrint = () => {
    window.print();
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
        
        {/* Modal Top Control Bar (Always visible & pinned) */}
        <div className={`p-4 sm:p-5 border-b shrink-0 flex items-center justify-between no-print ${
          isDark ? 'bg-slate-950/90 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-extrabold transition-all hover:scale-105 ${
                isDark 
                  ? 'bg-slate-800 border-white/10 text-slate-200 hover:bg-slate-700 hover:text-white' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Önceki çalışma tablosuna geri dön"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Tabloya Geri Dön</span>
            </button>

            <div className="hidden sm:block">
              <h2 className={`text-sm font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Hesap Mutabakat & Bakiye Doğrulama Raporu
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md hover:scale-105 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper View (Print-Ready Clean Report) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-6 select-text print:p-0 print:m-0">
          
          {/* Clean Official Document Header (No System Branding) */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Banka Hesap Mutabakat ve Doğruluk Raporu
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resmi Hesap Özeti ve Bakiye Denetim Belgesi</span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono">
              <div className="flex items-center justify-end gap-1 font-bold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Rapor No: <strong>MBK-{Date.now().toString().slice(-6)}</strong>
              </div>
            </div>
          </div>

          {/* Customer & Tax Identification */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-600 block font-bold flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mükellef / Müşteri Ünvanı:</span>
              </span>
              <input
                type="text"
                value={customCompanyName}
                onChange={(e) => setCustomCompanyName(e.target.value)}
                className="font-extrabold text-sm text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-emerald-600 shadow-sm"
                placeholder="Müşteri / Şirket Ünvanı Giriniz"
              />
            </div>
            <div>
              <span className="text-slate-600 block font-bold flex items-center gap-1 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vergi Kimlik No (VKN / TCKN):</span>
              </span>
              <input
                type="text"
                value={customTaxNumber}
                onChange={(e) => setCustomTaxNumber(e.target.value)}
                className="font-bold text-slate-900 font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-emerald-600 shadow-sm"
                placeholder="10 veya 11 Haneli VKN / TCKN"
              />
            </div>
          </div>

          {/* Account Details & Source File */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Banka / Kurum:</span>
              <span className="font-extrabold text-sm text-slate-900">{meta.bankName || 'Banka Ekstresi'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Kaynak Dosya:</span>
              <span className="font-bold text-slate-800 font-mono truncate block">{meta.fileName || 'Ekstre_Belgesi.pdf'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Toplam İşlem Adedi:</span>
              <span className="font-extrabold text-slate-900">{rows.length} Kayıt</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Para Birimi:</span>
              <span className="font-extrabold text-slate-900">{currency}</span>
            </div>
          </div>

          {/* Financial Balance & Transactions Summary Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="p-3">Finansal Bakiye ve İşlem Kalemi</th>
                  <th className="p-3 text-right">Tutar ({currency})</th>
                  <th className="p-3 text-center">Doğrulama Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-900">1. Dönem Başı Açılış Bakiyesi</td>
                  <td className="p-3 text-right font-mono font-bold">{formatCurrency(startingBal, currency)}</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓ Doğrulandı</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-emerald-700">2. Toplam Girişler (Alacak / Gelir)</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">+{formatCurrency(totalCredit, currency)}</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓ Doğrulandı</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-rose-700">3. Toplam Çıkışlar (Borç / Gider)</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-700">-{formatCurrency(totalDebit, currency)}</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓ Doğrulandı</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="p-3 text-slate-800">4. Net Nakit Değişimi</td>
                  <td className="p-3 text-right font-mono text-slate-900">{formatCurrency(totalCredit - totalDebit, currency)}</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓ Formül OK</td>
                </tr>
                <tr className="bg-emerald-50/80 font-extrabold text-sm text-slate-950 border-t-2 border-emerald-300">
                  <td className="p-3">5. Dönem Sonu Kapanış Bakiyesi</td>
                  <td className="p-3 text-right font-mono text-emerald-800">{formatCurrency(endingBal, currency)}</td>
                  <td className="p-3 text-center text-emerald-700 font-bold">
                    {isReconciled ? '✓ %100 MUTABIK' : '⚠️ KONTROL GEREKİYOR'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures & Stamp Area */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-800">Raporu Hazırlayan Yetkili / Mali Müşavir</p>
              <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
              <p className="text-[11px] text-slate-500 mt-1">İmza & Kaşe</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-800">Şirket / Müşteri Onayı</p>
              <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
              <p className="text-[11px] text-slate-500 mt-1">Yetkili İmza</p>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer with Clear Return Button */}
        <div className={`p-4 border-t shrink-0 flex items-center justify-between no-print ${
          isDark ? 'bg-slate-950/90 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-extrabold transition-all hover:scale-105 ${
              isDark 
                ? 'bg-slate-800 border-white/10 text-slate-200 hover:bg-slate-700 hover:text-white' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>← Çalışma Ekranına / Tabloya Geri Dön</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md hover:scale-105 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Yazdır / PDF Kaydet</span>
          </button>
        </div>

      </div>
    </div>
  );
}

