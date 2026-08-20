import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowUpRight, 
  ClipboardPaste, 
  PlusCircle,
  Files,
  Sparkles,
  Layers,
  Camera,
  FileCheck
} from 'lucide-react';
import { parseFinancialContent } from '../utils/parserEngine';
import { generateDocumentHash } from '../utils/security';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { extractTextWithOcr } from '../utils/ocrEngine';
import { isUBLInvoiceXML, parseUBLInvoiceXML } from '../utils/xmlInvoiceParser';
import { applyRulesToTransactions } from '../utils/rulesEngine';
import { detectDuplicates } from '../utils/duplicateDetector';
import { TRANSLATIONS } from '../utils/i18n';

export default function FileUploadZone({ 
  onDataParsed, 
  isProcessing, 
  setIsProcessing, 
  onError, 
  lang = 'tr', 
  theme = 'dark' 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [batchProgress, setBatchProgress] = useState(null); // { current: 1, total: 5, fileName: '', ocrPercent: null }
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
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  /**
   * Helper to extract text from a single file (PDF, Image with OCR, XML, or Text/CSV)
   */
  const extractFileText = async (file) => {
    const fileNameLower = file.name.toLowerCase();
    const isPdf = fileNameLower.endsWith('.pdf') || file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(fileNameLower);
    const isXml = fileNameLower.endsWith('.xml') || file.type === 'text/xml' || file.type === 'application/xml';

    // 1. Image OCR extraction
    if (isImage) {
      const ocrText = await extractTextWithOcr(file, (percent) => {
        setBatchProgress(prev => prev ? { ...prev, ocrPercent: percent } : null);
      });
      return { text: ocrText, isXmlInvoice: false };
    }

    // 2. PDF parsing (with text extraction and scanned canvas OCR fallback)
    if (isPdf) {
      const { text } = await extractTextFromPdf(file, (pageNum, totalPages) => {
        setBatchProgress(prev => prev ? { ...prev, ocrPercent: Math.round((pageNum / totalPages) * 100) } : null);
      });
      if (!text || text.trim().length === 0) {
        throw new Error('PDF belgesi okunamadı veya boş içerik tespit edildi.');
      }
      return { text, isXmlInvoice: false };
    }

    // 3. Text / XML reader (Only for plain text and XML files)
    const rawText = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });

    if (isXml && isUBLInvoiceXML(rawText)) {
      return { text: rawText, isXmlInvoice: true };
    }

    return { text: rawText, isXmlInvoice: false };
  };

  /**
   * Process one or multiple files (batch merge)
   */
  const processSelectedFiles = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setBatchProgress({ current: 0, total: files.length, fileName: files[0].name, ocrPercent: null });

    try {
      const allParsedResults = [];
      const fileNames = [];
      let combinedRawText = '';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBatchProgress({ current: i + 1, total: files.length, fileName: file.name, ocrPercent: null });
        fileNames.push(file.name);

        const { text: fileText, isXmlInvoice } = await extractFileText(file);
        combinedRawText += `\n--- DOSYA: ${file.name} ---\n` + fileText;

        if (isXmlInvoice) {
          const parsedXml = parseUBLInvoiceXML(fileText, file.name);
          parsedXml.sourceFileName = file.name;
          allParsedResults.push(parsedXml);
        } else {
          const parsed = parseFinancialContent(fileText);
          parsed.sourceFileName = file.name;
          allParsedResults.push(parsed);
        }
      }

      // Single file handling
      if (allParsedResults.length === 1) {
        const singleResult = allParsedResults[0];
        const hash = await generateDocumentHash(combinedRawText);

        const categorizedRows = applyRulesToTransactions(singleResult.rows || []);
        const { rows: auditedRows, duplicateCount } = detectDuplicates(categorizedRows);

        singleResult.rows = auditedRows;
        singleResult.meta.fileName = files[0].name;
        singleResult.meta.fileSize = files[0].size;
        singleResult.meta.documentHash = hash;
        singleResult.meta.duplicateCount = duplicateCount;
        singleResult.meta.isBatch = false;

        onDataParsed(singleResult);
        return;
      }

      // Multi-file (Batch Merge) handling
      let mergedRows = [];
      let primaryBankName = allParsedResults[0]?.meta?.bankName || 'Çoklu Banka Ekstresi';
      let primaryCurrency = allParsedResults[0]?.meta?.currency || 'TRY';

      allParsedResults.forEach((res, fIdx) => {
        const sourceName = fileNames[fIdx];
        (res.rows || []).forEach(row => {
          mergedRows.push({
            ...row,
            sourceFile: sourceName
          });
        });
      });

      // Sort all merged rows chronologically (oldest to newest)
      mergedRows.sort((a, b) => {
        const parseDate = (dStr) => {
          if (!dStr) return 0;
          const parts = dStr.match(/(\d{1,4})/g);
          if (parts && parts.length >= 3) {
            if (parts[0].length === 4) return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`).getTime();
            if (parts[2].length === 4) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          }
          return 0;
        };
        return parseDate(a.date) - parseDate(b.date);
      });

      const categorizedRows = applyRulesToTransactions(mergedRows);
      const { rows: auditedRows, duplicateCount } = detectDuplicates(categorizedRows);

      let totalDebit = 0;
      let totalCredit = 0;
      auditedRows.forEach(r => {
        totalDebit += (r.debit || 0);
        totalCredit += (r.credit || 0);
      });

      const startingBal = allParsedResults[0]?.meta?.startingBalance || 0;
      const endingBal = allParsedResults[allParsedResults.length - 1]?.meta?.endingBalance || (startingBal + totalCredit - totalDebit);
      const hash = await generateDocumentHash(combinedRawText);

      const batchMergedResult = {
        meta: {
          bankName: `${primaryBankName} (Birleşik ${files.length} Belge)`,
          currency: primaryCurrency,
          transactionCount: auditedRows.length,
          startingBalance: startingBal,
          endingBalance: endingBal,
          calculatedEnding: startingBal + totalCredit - totalDebit,
          totalDebit,
          totalCredit,
          netFlow: totalCredit - totalDebit,
          discrepancy: 0,
          isReconciled: true,
          fileName: `${files.length}_Adet_Birlesik_Ekstre.xlsx`,
          fileSize: files.reduce((acc, f) => acc + f.size, 0),
          documentHash: hash,
          isBatch: true,
          batchFileCount: files.length,
          batchFileNames: fileNames,
          duplicateCount
        },
        rows: auditedRows
      };

      onDataParsed(batchMergedResult);

    } catch (err) {
      console.error(err);
      onError(err.message || 'Dosyalar işlenirken bir hata oluştu. Lütfen geçerli ekstreler yükleyin.');
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);
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
      
      const categorizedRows = applyRulesToTransactions(parsedResult.rows || []);
      const { rows: auditedRows, duplicateCount } = detectDuplicates(categorizedRows);

      parsedResult.rows = auditedRows;
      parsedResult.meta.fileName = 'Yapistirilan_Ekstre.txt';
      parsedResult.meta.fileSize = pasteContent.length;
      parsedResult.meta.documentHash = hash;
      parsedResult.meta.duplicateCount = duplicateCount;
      parsedResult.meta.isBatch = false;

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
        bankName: lang === 'tr' ? 'Özel Finansal Tablo' : 'Custom Financial Ledger',
        currency: lang === 'tr' ? 'TRY' : 'USD',
        transactionCount: 1,
        startingBalance: 0,
        endingBalance: 0,
        calculatedEnding: 0,
        totalDebit: 0,
        totalCredit: 0,
        netFlow: 0,
        discrepancy: 0,
        isReconciled: true,
        documentHash: 'custom_blank_' + Date.now(),
        isBatch: false,
        duplicateCount: 0
      },
      rows: [
        {
          id: 'tx_init_1',
          date: new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US'),
          description: lang === 'tr' ? 'İlk Finansal Hareket' : 'Initial Transaction',
          category: 'Genel Giderler',
          accountCode: '770.01',
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
            <span>{t.tabUpload} (PDF, XML, Görsel OCR)</span>
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
          <span>{lang === 'tr' ? 'Sıfırdan Boş Tablo Aç' : 'Open Blank Ledger'}</span>
        </button>
      </div>

      {/* Upload Tab View */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 ${
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
            multiple
            accept=".pdf,.txt,.csv,.xml,.tsv,.json,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {batchProgress && batchProgress.total > 1
                  ? `Toplu Ekstre Ayrıştırılıyor (${batchProgress.current}/${batchProgress.total})...`
                  : batchProgress?.ocrPercent !== null && batchProgress?.ocrPercent !== undefined
                    ? `Görselden Metin Okunuyor (OCR %${batchProgress.ocrPercent})...`
                    : t.processingTitle}
              </p>
              {batchProgress && (
                <p className="text-xs text-emerald-400 font-mono mt-1 max-w-sm truncate">
                  {batchProgress.fileName}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-2">
                Sıfır sunucu güvenliğiyle tarayıcınızda işleniyor
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                isDark 
                  ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border-emerald-500/30' 
                  : 'bg-emerald-50 border-emerald-200 shadow-sm'
              }`}>
                <UploadCloud className="w-10 h-10 text-emerald-500" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-xl sm:text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {t.dropTitle}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PDF • XML • OCR Destekli
                </span>
              </div>

              <p className={`text-xs sm:text-sm mb-5 max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                PDF Banka Ekstreleri, GİB e-Fatura XML veya taranmış dekont fotoğraflarınızı tek seferde bırakın. Kronolojik birleştirip TDHP muhasebe kodlarını otomatik atar.
              </p>

              {/* Feature Highlights Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <span className={`text-[11px] px-3 py-1 rounded-xl border flex items-center gap-1.5 font-medium ${
                  isDark ? 'bg-slate-950/60 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Toplu 12 Aylık PDF
                </span>

                <span className={`text-[11px] px-3 py-1 rounded-xl border flex items-center gap-1.5 font-medium ${
                  isDark ? 'bg-slate-950/60 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                  GİB e-Fatura UBL-XML
                </span>

                <span className={`text-[11px] px-3 py-1 rounded-xl border flex items-center gap-1.5 font-medium ${
                  isDark ? 'bg-slate-950/60 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  Tarayıcı İçi OCR
                </span>

                <span className={`text-[11px] px-3 py-1 rounded-xl border flex items-center gap-1.5 font-medium ${
                  isDark ? 'bg-slate-950/60 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Zero-Knowledge
                </span>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium ${
                isDark ? 'bg-[#090e1a] border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
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
            placeholder="01.08.2026   SHELL AKARYAKIT       -1.450,00   16.750,00
02.08.2026   GELEN EFT - YAZILIM   +35.000,00   51.750,00
04.08.2026   OFİS KİRASI           -12.000,00   39.750,00
05.08.2026   YEMEKSEPETI           -340,00      39.410,00"
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
