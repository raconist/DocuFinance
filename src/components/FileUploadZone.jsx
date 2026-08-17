import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, FileCode, CheckCircle2, Lock, ShieldCheck, AlertCircle, ArrowUpRight, ClipboardPaste, PlusCircle } from 'lucide-react';
import { parseFinancialContent } from '../utils/parserEngine';
import { generateDocumentHash } from '../utils/security';
import { TRANSLATIONS } from '../utils/i18n';

export default function FileUploadZone({ onDataParsed, isProcessing, setIsProcessing, onError, lang = 'tr', theme = 'dark' }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [pasteContent, setPasteContent] = useState('');
  const fileInputRef = useRef(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file) => {
    setIsProcessing(true);
    try {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const rawText = event.target.result;
          const hash = await generateDocumentHash(rawText);
          const parsedResult = parseFinancialContent(rawText);

          parsedResult.meta.fileName = fileName;
          parsedResult.meta.fileSize = file.size;
          parsedResult.meta.documentHash = hash;

          onDataParsed(parsedResult);
        } catch (err) {
          console.error(err);
          onError(err.message || 'Dosya okunamadı. Lütfen geçerli bir ekstre veya metin yükleyin.');
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      onError('Dosya işlenirken bir hata oluştu.');
      setIsProcessing(false);
    }
  };

  const handleProcessPaste = async () => {
    if (!pasteContent.trim()) {
      onError('Lütfen ayrıştırılacak ekstre veya fatura metnini yapıştırın.');
      return;
    }

    setIsProcessing(true);
    try {
      const hash = await generateDocumentHash(pasteContent);
      const parsedResult = parseFinancialContent(pasteContent);
      parsedResult.meta.fileName = 'Yapistirilan_Ekstre.txt';
      parsedResult.meta.fileSize = pasteContent.length;
      parsedResult.meta.documentHash = hash;

      onDataParsed(parsedResult);
    } catch (err) {
      console.error(err);
      onError(err.message || 'Metin ayrıştırılamadı. Lütfen satırların tarih ve tutar içerdiğinden emin olun.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartBlank = () => {
    const blankData = {
      meta: {
        bankName: lang === 'tr' ? 'Özel Finansal Tablo' : lang === 'de' ? 'Benutzerdefinierte Tabelle' : 'Custom Financial Ledger',
        currency: lang === 'tr' ? 'TRY' : lang === 'de' ? 'EUR' : 'USD',
        transactionCount: 1,
        startingBalance: 0,
        endingBalance: 0,
        calculatedEnding: 0,
        totalDebit: 0,
        totalCredit: 0,
        netFlow: 0,
        discrepancy: 0,
        isReconciled: true,
        documentHash: 'custom_blank_' + Date.now()
      },
      rows: [
        {
          id: 'tx_init_1',
          date: new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-US'),
          description: lang === 'tr' ? 'İlk Finansal Hareket' : lang === 'de' ? 'Erste Buchung' : 'Initial Transaction',
          category: 'Genel',
          debit: 0,
          credit: 0,
          amount: 0,
          balance: 0,
          isVerified: true
        }
      ]
    };
    onDataParsed(blankData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Upload / Paste / Blank Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border ${
          isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t.tabUpload}</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'paste'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>{t.tabPaste}</span>
          </button>
        </div>

        {/* Start Blank Table Button */}
        <button
          onClick={handleStartBlank}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all shadow-sm group ${
            isDark 
              ? 'bg-slate-900/90 hover:bg-slate-800 border-emerald-500/40 text-emerald-400 hover:text-emerald-300' 
              : 'bg-white hover:bg-emerald-50/50 border-emerald-300 text-emerald-700'
          }`}
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform text-emerald-500" />
          <span>{lang === 'tr' ? 'Sıfırdan Boş Tablo Aç' : lang === 'de' ? 'Leere Tabelle Öffnen' : 'Open Blank Ledger'}</span>
        </button>
      </div>

      {/* Upload Tab View */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01] shadow-2xl'
              : isDark
                ? 'border-slate-700/80 bg-slate-900/50 hover:border-emerald-500/60 hover:bg-slate-900/90'
                : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50/60 shadow-sm'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.csv,.xml,.png,.jpg,.jpeg"
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{t.processingTitle}</p>
              <p className="text-xs text-slate-400 mt-1">{t.processingSubtitle}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${
                isDark 
                  ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border-emerald-500/30' 
                  : 'bg-emerald-50 border-emerald-200 shadow-sm'
              }`}>
                <UploadCloud className="w-10 h-10 text-emerald-500" />
              </div>

              <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {t.dropTitle}
              </h3>
              <p className={`text-xs sm:text-sm mb-6 max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.dropSubtitle} <br />
                <span className="font-mono text-xs opacity-75">{t.dropSupported}</span>
              </p>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium ${
                isDark ? 'bg-[#090e1a] border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>{t.zeroKnowledgeNote}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Tab View */}
      {activeTab === 'paste' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
          isDark ? 'bg-slate-900/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <label className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {t.pasteLabel}
            </label>
            <span className="text-xs text-slate-400">{t.pasteHint}</span>
          </div>

          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="01.08.2026   MAAŞ ÖDEMELERİ        -28.500,00   16.750,00
02.08.2026   GELEN EFT - YAZILIM   +35.000,00   51.750,00
04.08.2026   OFİS KİRASI           -12.000,00   39.750,00"
            rows={8}
            className={`w-full rounded-2xl border p-4 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y ${
              isDark ? 'bg-slate-950 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setPasteContent('')}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5"
            >
              {t.clearBtn}
            </button>

            <button
              onClick={handleProcessPaste}
              disabled={isProcessing || !pasteContent.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {isProcessing ? t.processingTitle : t.pasteBtn}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
