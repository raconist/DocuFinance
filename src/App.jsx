import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FileUploadZone from './components/FileUploadZone';
import DataStudio from './components/DataStudio';
import PricingModal from './components/PricingModal';
import SecurityModal from './components/SecurityModal';
import HistoryModal from './components/HistoryModal';
import ProgrammaticSeoDirectory from './components/ProgrammaticSeoDirectory';
import { SAMPLE_STATEMENTS, parseFinancialContent } from './utils/parserEngine';
import { generateDocumentHash } from './utils/security';
import { saveStatementToLocalDB } from './utils/dbStorage';
import { TRANSLATIONS } from './utils/i18n';
import { ShieldCheck, Heart, FileSpreadsheet, Lock, AlertCircle } from 'lucide-react';

export default function App() {
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState('app');
  const [isProUser, setIsProUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lang, setLang] = useState('tr');
  const [theme, setTheme] = useState('dark');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isDark = theme === 'dark';

  // Toggle Theme & sync HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Return to clean home screen
  const handleGoHome = () => {
    setParsedData(null);
    setCurrentView('app');
    setErrorMessage(null);
  };

  const handleSelectSample = async (sampleKey) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const sample = SAMPLE_STATEMENTS[sampleKey];
      if (!sample) return;

      const hash = await generateDocumentHash(sample.text);
      const result = parseFinancialContent(sample.text);
      result.meta.fileName = sample.name;
      result.meta.documentHash = hash;

      await saveStatementToLocalDB(result);

      setParsedData(result);
      setCurrentView('app');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Örnek ekstre yüklenirken hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataParsed = async (data) => {
    await saveStatementToLocalDB(data);
    setParsedData(data);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'bg-[#070b13] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Top Navbar */}
      <Navbar
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSelectBankPage={(view) => setCurrentView(view ? 'seo' : 'app')}
        onGoHome={handleGoHome}
        hasActiveData={Boolean(parsedData)}
        currentView={currentView}
        lang={lang}
        onLangChange={(l) => setLang(l)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        
        {/* Error Toast */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white font-bold text-xs px-2 py-1"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* View 1: SEO Directory View */}
        {currentView === 'seo' ? (
          <ProgrammaticSeoDirectory
            onTestSample={(sampleKey) => handleSelectSample(sampleKey)}
            onSelectBank={(bank) => {
              if (bank.sampleKey) handleSelectSample(bank.sampleKey);
            }}
            onGoHome={handleGoHome}
          />
        ) : (
          /* View 2: App Core View */
          <div>
            {!parsedData ? (
              <div className="space-y-8">
                <HeroSection
                  onSelectSample={handleSelectSample}
                  onOpenSecurity={() => setIsSecurityOpen(true)}
                  lang={lang}
                  theme={theme}
                />
                
                <FileUploadZone
                  onDataParsed={handleDataParsed}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  onError={(err) => setErrorMessage(err)}
                  lang={lang}
                  theme={theme}
                />

                {/* Bottom Trust & Feature Highlights */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    
                    <div className={`p-6 rounded-3xl border transition-all ${
                      isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 font-extrabold text-sm">
                        1
                      </div>
                      <h4 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {lang === 'tr' ? 'Dosyayı Yükleyin veya Yapıştırın' : lang === 'de' ? 'Datei Hochladen oder Einfügen' : 'Upload or Paste Statement'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'tr' ? 'PDF, e-Fatura XML veya internet bankacılığı kopyasını bırakın.' : lang === 'de' ? 'Ziehen Sie PDF-Kontoauszüge oder XML-Rechnungen hierher.' : 'Drop any PDF, e-invoice XML or raw internet banking text.'}
                      </p>
                    </div>

                    <div className={`p-6 rounded-3xl border transition-all ${
                      isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 font-extrabold text-sm">
                        2
                      </div>
                      <h4 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {lang === 'tr' ? 'Otomatik Bakiye Mutabakatı' : lang === 'de' ? 'Automatische Saldenabstimmung' : 'Auto Balance Reconciliation'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'tr' ? 'Açılış bakiyesi, giren, çıkan ve kapanış tutarı kuruşu kuruşuna doğrulanır.' : lang === 'de' ? 'Anfangs-, Einnahmen-, Ausgaben- und Endsalden werden centgenau geprüft.' : 'Starting balance, inflow, outflow and ending balances reconciled to the penny.'}
                      </p>
                    </div>

                    <div className={`p-6 rounded-3xl border transition-all ${
                      isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 font-extrabold text-sm">
                        3
                      </div>
                      <h4 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {lang === 'tr' ? 'Formüllü Excel (.xlsx) İndirin' : lang === 'de' ? 'Formel-fähiges Excel Herunterladen' : 'Export Formula-Ready Excel'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'tr' ? 'Logo, Mikro, Zirve, Luca ve Excel\'e hazır biçimli döküm anında elinizde.' : lang === 'de' ? 'Kompatibel mit DATEV, Lexware, Excel und Buchhaltungssoftware.' : 'Ready for QuickBooks, Xero, ERPs and financial auditors.'}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* Active Interactive Data Grid Studio */
              <DataStudio
                parsedData={parsedData}
                onReset={handleGoHome}
                onOpenPricing={() => setIsPricingOpen(true)}
                isProUser={isProUser}
                lang={lang}
                theme={theme}
              />
            )}
          </div>
        )}

      </main>

      {/* Modern Footer */}
      <footer className={`border-t py-10 text-xs transition-colors duration-300 ${
        isDark ? 'border-white/5 bg-[#060911] text-slate-500' : 'border-slate-200 bg-white text-slate-500 shadow-inner'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <span className={`font-bold font-display text-sm ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              DocuFinance.ai
            </span>
            <span className="text-slate-400">|</span>
            <span>© 2026 {lang === 'tr' ? 'Tüm Hakları Saklıdır.' : 'All rights reserved.'}</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <button onClick={handleGoHome} className="hover:text-emerald-500 transition-colors">
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </button>
            <button onClick={() => setIsHistoryOpen(true)} className="hover:text-emerald-500 transition-colors">
              {t.historyBtn}
            </button>
            <button onClick={() => setIsSecurityOpen(true)} className="hover:text-emerald-500 transition-colors">
              {t.zeroKnowledgeBadge}
            </button>
            <button onClick={() => setCurrentView('seo')} className="hover:text-emerald-500 transition-colors">
              {t.banksBtn}
            </button>
            <button onClick={() => setIsPricingOpen(true)} className="hover:text-emerald-500 transition-colors">
              {t.pricingBtn}
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>KVKK & GDPR Compliant FinTech Engine</span>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onUpgradeSuccess={(plan) => {
          setIsProUser(true);
        }}
        lang={lang}
      />

      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectStatement={(data) => {
          setParsedData(data);
          setCurrentView('app');
        }}
      />

    </div>
  );
}
