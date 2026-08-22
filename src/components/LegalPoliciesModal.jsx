import React, { useState } from 'react';
import { X, FileText, Shield, RefreshCw, Mail, CheckCircle2, Globe, Building, Scale, AlertCircle } from 'lucide-react';

export default function LegalPoliciesModal({ isOpen, onClose, initialTab = 'terms', lang = 'tr', theme = 'dark' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const tabs = [
    { id: 'terms', label: lang === 'tr' ? 'Kullanım Şartları' : lang === 'de' ? 'Nutzungsbedingungen' : 'Terms of Service', icon: FileText },
    { id: 'privacy', label: lang === 'tr' ? 'Gizlilik Politikası (KVKK/GDPR)' : lang === 'de' ? 'Datenschutz' : 'Privacy Policy', icon: Shield },
    { id: 'refund', label: lang === 'tr' ? 'İade & İptal Politikası' : lang === 'de' ? 'Rückerstattung' : 'Refund & Cancellation', icon: RefreshCw },
    { id: 'contact', label: lang === 'tr' ? 'İletişim & Yasal Bilgi' : lang === 'de' ? 'Impressum / Kontakt' : 'Contact & Legal', icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all ${
        isDark ? 'bg-[#090d16] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isDark ? 'border-white/10 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {lang === 'tr' ? 'Yasal Politikalar & Şeffaflık' : 'Legal Compliance & Policies'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'tr' ? 'DocuFinance.ai — Global FinTech & Gizlilik Standartları' : 'DocuFinance.ai — Global Privacy & Financial Compliance Standards'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className={`flex border-b overflow-x-auto no-scrollbar px-4 pt-2 gap-2 ${
          isDark ? 'border-white/10 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm leading-relaxed">
          
          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <span className="font-bold">Last Updated:</span> January 2026 | Effective immediately for all DocuFinance users worldwide.
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">1. Acceptance of Terms</h3>
                <p className="text-slate-300">
                  By accessing and using DocuFinance (the "Service"), available via web and desktop interfaces, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our Service. DocuFinance operates as an independent client-side financial document parsing utility.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">2. Description of Service</h3>
                <p className="text-slate-300">
                  DocuFinance provides automated client-side parsing of financial documents (bank statements, receipts, credit card slips, and invoices) into structured formats including Excel (.xlsx), CSV, and accounting software templates (Luca, Logo, Zirve, QuickBooks).
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">3. User Responsibility & Account Security</h3>
                <p className="text-slate-300">
                  Users are responsible for ensuring that they have the legal right to process any uploaded financial documents. While DocuFinance employs zero-knowledge architecture (processing files entirely within the user's local browser memory), users remain responsible for the accuracy of accounting entries generated.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">4. Subscriptions & Payments</h3>
                <p className="text-slate-300">
                  Pro subscriptions and Single Passes are billed in advance on a recurring or one-time basis. Payments are processed securely via certified Merchant of Record partners (including Lemon Squeezy, Polar, or Shopier) who handle tax compliance, invoicing, and PCI-DSS requirements.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">5. Disclaimer of Warranties & Limitation of Liability</h3>
                <p className="text-slate-300">
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DocuFinance is not a certified public accounting firm (CPA) or tax advisor. Output spreadsheets should be verified against official bank records prior to formal tax filing.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Zero-Knowledge Architecture:</span> Your financial statements, transactions, IBANs, and account balances are processed <strong>100% locally in your browser memory (RAM)</strong>. We do not store or transmit your documents to any remote server.
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">1. Data We Do NOT Collect</h3>
                <p className="text-slate-300">
                  We explicitly do NOT upload, inspect, train AI models on, or store your bank statement PDFs, CSVs, balance amounts, vendor names, or invoice contents. All parsing algorithms run locally on the client's device using WebAssembly and Javascript engines.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">2. Information We Collect (Minimal Essential Data)</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li><strong>Account Information:</strong> If you register an account, your email address and authentication hash.</li>
                  <li><strong>Billing Information:</strong> Transaction status, license keys, and subscription tiers handled directly by our payment processor. We never store credit card numbers.</li>
                  <li><strong>Anonymized Analytics:</strong> Aggregated page view counts and performance metrics without any personally identifiable information (PII).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">3. GDPR & KVKK Compliance</h3>
                <p className="text-slate-300">
                  In accordance with GDPR (EU Regulation 2016/679) and Turkish KVKK (Law No. 6698), users have the right to request deletion of their account credentials at any time. Because document data is never transmitted to our servers, there is no personal financial data stored to delete.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">4. Data Security</h3>
                <p className="text-slate-300">
                  Our web application is served exclusively over HTTPS with TLS 1.3 encryption. Local storage uses AES-GCM-256 bit encryption keys generated per session.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION */}
          {activeTab === 'refund' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 text-slate-300 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  14-Day Money-Back Guarantee
                </div>
                We want you to be 100% satisfied with DocuFinance. If the software does not successfully parse your bank statement or meet your accounting workflow needs, we will refund your payment.
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">1. Refund Eligibility</h3>
                <p className="text-slate-300">
                  You are eligible for a full refund within <strong>14 days of your purchase date</strong> for any monthly or annual Pro subscription, provided you have contacted our support team with your order number.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">2. How to Request a Refund</h3>
                <p className="text-slate-300">
                  Simply send an email to <span className="text-emerald-400 font-semibold">support@docufinance.site</span> (or reply directly to your purchase receipt email from Lemon Squeezy) with:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
                  <li>Your order number / email address used during purchase.</li>
                  <li>A brief description of why you'd like a refund (e.g., format compatibility or feature request).</li>
                </ul>
                <p className="text-slate-300 mt-2">
                  Refunds are processed within 2-5 business days back to your original payment method.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-emerald-400 mb-2">3. Subscription Cancellation</h3>
                <p className="text-slate-300">
                  You can cancel your subscription at any time with a single click from your Customer Portal link provided in your receipt, or through our Account Dashboard. Once cancelled, you will retain access until the end of your current billing period with zero unexpected renewals.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT & LEGAL */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
                    <Mail className="w-4 h-4" />
                    Customer Support & Inquiries
                  </div>
                  <p className="text-xs text-slate-300 mb-2">For technical help, format requests, or refund assistance:</p>
                  <a href="mailto:support@docufinance.site" className="text-sm font-semibold text-emerald-400 hover:underline">
                    support@docufinance.site
                  </a>
                  <p className="text-[11px] text-slate-400 mt-1">Average response time: &lt; 12 hours</p>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
                    <Building className="w-4 h-4" />
                    Operator & Project Information
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Project:</strong> DocuFinance AI<br />
                    <strong>Developer:</strong> Independent Software Product<br />
                    <strong>Location:</strong> Istanbul / Turkey<br />
                    <strong>Official Domain:</strong> docufinance.site
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'} text-xs text-slate-400`}>
                <p>
                  <strong>Merchant of Record Notice:</strong> Our order process and global VAT/GST invoicing are conducted by our Merchant of Record partners (such as Lemon Squeezy / Polar / Paddle), who act as the Merchant of Record for all orders. They provide all customer service inquiries and handle returns.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-white/10 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>SSL/TLS 256-bit Secured • GDPR Compliant • Zero-Knowledge</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-all shadow-md shadow-emerald-500/20"
          >
            {lang === 'tr' ? 'Kapat' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
