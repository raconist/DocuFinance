import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FileUploadZone from './components/FileUploadZone';
import DataStudio from './components/DataStudio';
import PricingModal from './components/PricingModal';
import SecurityModal from './components/SecurityModal';
import HistoryModal from './components/HistoryModal';
import AuthModal from './components/AuthModal';
import AccountDashboardModal from './components/AccountDashboardModal';
import AdminPanelModal from './components/AdminPanelModal';
import ProgrammaticSeoDirectory from './components/ProgrammaticSeoDirectory';
import SupportWidget from './components/SupportWidget';
import { SAMPLE_STATEMENTS, parseFinancialContent } from './utils/parserEngine';
import { generateDocumentHash } from './utils/security';
import { saveStatementToLocalDB } from './utils/dbStorage';
import { getCurrentUser, incrementUserStats } from './utils/authService';
import { TRANSLATIONS } from './utils/i18n';
import { ShieldCheck, Heart, FileSpreadsheet, Lock, AlertCircle } from 'lucide-react';

export default function App() {
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [currentView, setCurrentView] = useState('app');
  const [isProUser, setIsProUser] = useState(() => Boolean(getCurrentUser()?.tier?.includes('pro')));
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

  // Secret Admin Access via Collision-Free Shortcuts: Ctrl + Shift + M OR Alt + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ctrl + Shift + M (or Cmd + Shift + M) -> (M = Master / Manager)
      const isCtrlShiftM = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'M' || e.key === 'm');
      // 2. Alt + Shift + A -> (A = Admin)
      const isAltShiftA = e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a');
      // 3. Ctrl + Alt + A
      const isCtrlAltA = (e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'A' || e.key === 'a');

      if (isCtrlShiftM || isAltShiftA || isCtrlAltA) {
        e.preventDefault();
        e.stopPropagation();
        setIsAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Return to clean home screen
  const handleGoHome = () => {
    setParsedData(null);
    setCurrentView('app');
    setErrorMessage(null);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user?.tier?.includes('pro')) {
      setIsProUser(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProUser(false);
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
      incrementUserStats(result.rows?.length || 1);
      setCurrentUser(getCurrentUser());

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
    incrementUserStats(data.rows?.length || 1);
    setCurrentUser(getCurrentUser());
    setParsedData(data);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'bg-[#070b13] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Top Navbar with Auth & Account Triggers */}
      <Navbar
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentUser={currentUser}
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
      <main className="flex-1 pb-20 w-full flex flex-col items-center justify-start">
        
        {/* Error Toast */}
        {errorMessage && (
          <div className="w-full max-w-3xl mx-auto px-4 pt-6">
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
          <div className="w-full flex justify-center">
            <ProgrammaticSeoDirectory
              onTestSample={(sampleKey) => handleSelectSample(sampleKey)}
              onSelectBank={(bank) => {
                if (bank.sampleKey) handleSelectSample(bank.sampleKey);
              }}
              onGoHome={handleGoHome}
            />
          </div>
        ) : (
          /* View 2: App Core View */
          <div className="w-full flex flex-col items-center">
            {!parsedData ? (
              <div className="w-full flex flex-col items-center space-y-8">
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
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    
                    <div className={`p-6 rounded-3xl border transition-all ${
                      isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 font-extrabold text-sm">
                        1
                      </div>
                      <h4 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {lang === 'tr' ? 'Tek veya Toplu 12 Aylık Ekstre Yükleyin' : 'Upload Single or 12-Month Batch Statements'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'tr' ? 'PDF, e-Fatura XML veya internet bankacılığı kopyasını bırakın. Çoklu dosyaları kronolojik birleştirir.' : 'Drop PDFs, e-invoices or bank text. Merges multi-month files chronologically.'}
                      </p>
                    </div>

                    <div className={`p-6 rounded-3xl border transition-all ${
                      isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 font-extrabold text-sm">
                        2
                      </div>
                      <h4 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {lang === 'tr' ? 'Akıllı TDHP (770/600) & Mutabakat' : 'Smart TDHP Codes & Auto Balance Audit'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'tr' ? 'Akaryakıt, yemek, kira, maaş harcamalarını Tekdüzen Hesap Kodlarıyla otomatik eşleştirir.' : 'Auto-maps transactions to Turkish / GAAP accounting codes and verifies opening/closing balances.'}
                      </p>
                    </div>

                    <div className={`p-6 rounded-3xl border transition-all ${
                      isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 font-extrabold text-sm">
                        3
                      </div>
                      <h4 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {lang === 'tr' ? 'Luca, Zirve, Logo & Excel İndirin' : 'Export to Luca, Zirve, Logo & QuickBooks'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'tr' ? 'Muhasebe programınızın beklediği birebir CSV/Excel formatında saniyeler içinde dışa aktarın.' : 'Export directly to accounting software templates without manual column tweaking.'}
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
          const current = getCurrentUser();
          if (current) {
            setCurrentUser({ ...current });
          }
        }}
        lang={lang}
        theme={theme}
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

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        theme={theme}
        lang={lang}
      />

      <AccountDashboardModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        onOpenPricing={() => setIsPricingOpen(true)}
        theme={theme}
        lang={lang}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        theme={theme}
        lang={lang}
      />

      {/* Floating 24/7 WhatsApp & Live Support Widget */}
      <SupportWidget theme={theme} lang={lang} />

    </div>
  );
}
