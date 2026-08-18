import React, { useState } from 'react';
import { Building2, FileSpreadsheet, ArrowRight, ShieldCheck, HelpCircle, CheckCircle2, ChevronRight, Zap, ArrowLeft, Globe } from 'lucide-react';
import { SAMPLE_STATEMENTS } from '../utils/parserEngine';

export const BANK_SEO_DATA = [
  // --- 🇹🇷 TÜRKİYE ---
  {
    id: 'garanti',
    title: 'Garanti BBVA PDF Ekstre Excel (.xlsx) Çevirme',
    slug: 'garanti-ekstre-excel',
    bank: 'Garanti BBVA',
    region: '🇹🇷 Türkiye',
    searchKeyword: 'Garanti bankası ekstre excel çevirme',
    description: 'Garanti BBVA ticari ve bireysel hesap ekstrelerini anında formüllü Excel (.xlsx) ve CSV formatına aktarın. Borç, alacak ve bakiye mutabakatı otomatik hesaplanır.',
    sampleKey: 'garanti',
    faq: [
      { q: 'Garanti BBVA PDF ekstreleri şifreli mi işleniyor?', a: 'Evet, DocuFinance AI istemci taraflı Zero-Knowledge mimarisi ile çalışır. Ekstreniz hiçbir sunucuya yüklenmez.' },
      { q: 'Garanti İnternet Şubesi ekstre formatı destekleniyor mu?', a: 'Evet, hem web şubesi hem de Garanti Kurumsal PDF dökümleri tam uyumludur.' }
    ]
  },
  {
    id: 'isbankasi',
    title: 'Türkiye İş Bankası Hesap Hareketleri Excel Dönüştürücü',
    slug: 'is-bankasi-hesap-hareketleri-excel',
    bank: 'Türkiye İş Bankası',
    region: '🇹🇷 Türkiye',
    searchKeyword: 'İş bankası hesap dökümü excel aktarma',
    description: 'İş Bankası ticari hesap dökümlerini, çek/senet hareketlerini ve POS cirolarını 2 saniyede Excel formatına dönüştürün.',
    sampleKey: 'isbankasi',
    faq: [
      { q: 'İş Bankası vadeli/vadesiz hesap formatı ayrıştırılabilir mi?', a: 'Evet, tarih, işlem tanımı, borç ve alacak sütunları otomatik tespit edilir.' }
    ]
  },

  // --- 🇬🇧 UNITED KINGDOM ---
  {
    id: 'hsbc_uk',
    title: 'HSBC UK Commercial Bank Statement to Excel & QBO',
    slug: 'hsbc-uk-statement-to-excel',
    bank: 'HSBC UK',
    region: '🇬🇧 United Kingdom',
    searchKeyword: 'convert HSBC UK statement to excel csv qbo',
    description: 'Convert HSBC UK Business Current Accounts and PDF statements into formatted Microsoft Excel, CSV, and QuickBooks (.QBO) feeds with HMRC VAT reconciliation.',
    sampleKey: 'hsbc_uk',
    faq: [
      { q: 'Is HSBC UK Faster Payments and BACS recognized?', a: 'Yes, our UK engine detects BACS, CHAPS, Faster Payments, and HMRC tax deductions automatically.' }
    ]
  },
  {
    id: 'barclays',
    title: 'Barclays Bank Statement to Excel Converter',
    slug: 'barclays-bank-statement-to-excel',
    bank: 'Barclays Bank UK',
    region: '🇬🇧 United Kingdom',
    searchKeyword: 'Barclays PDF statement to Excel converter',
    description: 'Instantly convert Barclays Business and Personal PDF bank statements into clean Excel spreadsheets ready for Xero, QuickBooks, and accountant audit.',
    sampleKey: 'barclays',
    faq: [
      { q: 'Can I export Barclays statements to QuickBooks QBO?', a: 'Yes, 1-click native .QBO / .OFX bank feed export is fully supported.' }
    ]
  },
  {
    id: 'lloyds',
    title: 'Lloyds Bank PDF Statement to Excel (.xlsx)',
    slug: 'lloyds-bank-statement-to-excel',
    bank: 'Lloyds Bank',
    region: '🇬🇧 United Kingdom',
    searchKeyword: 'Lloyds business statement converter',
    description: 'Turn multi-page Lloyds Bank commercial PDF statements into formula-ready Excel workbooks with automated balance proofing.',
    sampleKey: 'lloyds',
    faq: [
      { q: 'Does it support multi-month batch processing?', a: 'Yes, drag & drop up to 12 months of Lloyds PDFs to merge them chronologically.' }
    ]
  },

  // --- 🇫🇷 FRANCE ---
  {
    id: 'bnpparibas',
    title: 'BNP Paribas Relevé de Compte PDF en Excel (.xlsx)',
    slug: 'bnp-paribas-releve-compte-excel',
    bank: 'BNP Paribas',
    region: '🇫🇷 France',
    searchKeyword: 'convertir relevé de compte BNP Paribas en Excel',
    description: 'Convertissez instantanément vos relevés bancaires professionnels BNP Paribas PDF en feuilles Excel (.xlsx) et CSV formatées avec contrôle de solde.',
    sampleKey: 'bnpparibas',
    faq: [
      { q: 'Les virements SEPA et prélèvements URSSAF sont-ils reconnus ?', a: 'Oui, le moteur français classe automatiquement les charges URSSAF, loyers et virements clients.' }
    ]
  },
  {
    id: 'socgen',
    title: 'Société Générale Extrait de Compte en Excel',
    slug: 'societe-generale-releve-excel',
    bank: 'Société Générale',
    region: '🇫🇷 France',
    searchKeyword: 'convertir extrait de compte Société Générale excel',
    description: 'Générez des fichiers Excel propres et catégorisés à partir de vos extraits de compte Société Générale pour votre expert-comptable.',
    sampleKey: 'socgen',
    faq: [
      { q: 'Mes données bancaires restent-elles confidentielles ?', a: 'Oui, architecture 100% Zero-Knowledge conforme au RGPD. Vos données ne quittent jamais votre navigateur.' }
    ]
  },
  {
    id: 'qonto',
    title: 'Qonto Business Relevé Bancaire en Excel & CSV',
    slug: 'qonto-releve-excel-csv',
    bank: 'Qonto Business',
    region: '🇫🇷 France',
    searchKeyword: 'convertir relevé Qonto en excel',
    description: 'Exportez et analysez vos transactions professionnelles Qonto en format Excel et comptable universel.',
    sampleKey: 'qonto',
    faq: [
      { q: 'Prend-il en charge les cartes Qonto multiples ?', a: 'Oui, toutes les sous-cartes et dépenses d\'équipe sont consolidées avec leur solde.' }
    ]
  },

  // --- 🇮🇹 ITALY ---
  {
    id: 'intesa',
    title: 'Intesa Sanpaolo Estratto Conto PDF in Excel (.xlsx)',
    slug: 'intesa-sanpaolo-estratto-conto-excel',
    bank: 'Intesa Sanpaolo',
    region: '🇮🇹 Italia',
    searchKeyword: 'convertire estratto conto Intesa Sanpaolo in Excel',
    description: 'Converti gli estratti conto bancari aziendali Intesa Sanpaolo in fogli di calcolo Excel (.xlsx) e CSV con quadratura automatica del saldo.',
    sampleKey: 'intesa',
    faq: [
      { q: 'Riconosce i modelli F24 e i bonifici SEPA?', a: 'Sì, le imposte F24, i contributi INPS e le spese operative vengono categorizzate automaticamente.' }
    ]
  },
  {
    id: 'unicredit',
    title: 'UniCredit Movimenti Conto Corrente in Excel',
    slug: 'unicredit-estratto-conto-excel',
    bank: 'UniCredit Bank',
    region: '🇮🇹 Italia',
    searchKeyword: 'convertire movimenti UniCredit in Excel',
    description: 'Trasforma gli estratti conto PDF UniCredit in tabelle Excel pronte per la contabilità aziendale e i commercialisti.',
    sampleKey: 'unicredit',
    faq: [
      { q: 'I dati bancari sono al sicuro?', a: 'Sì, elaborazione Zero-Knowledge conforme al GDPR. I file non vengono mai caricati su server terzi.' }
    ]
  },

  // --- 🇩🇪 GERMANY & 🇪🇸 SPAIN & 🇨🇭 SWITZERLAND ---
  {
    id: 'deutschebank',
    title: 'Deutsche Bank AG Kontoauszug in Excel & DATEV CSV',
    slug: 'deutsche-bank-kontoauszug-excel-datev',
    bank: 'Deutsche Bank',
    region: '🇩🇪 Deutschland',
    searchKeyword: 'Deutsche Bank Kontoauszug in Excel DATEV umwandeln',
    description: 'Wandeln Sie Deutsche Bank Geschäftskonto PDF-Auszüge in formel-fähige Excel-Tabellen und DATEV-kompatible Buchungsformate um.',
    sampleKey: 'deutschebank',
    faq: [
      { q: 'Werden Anfangs- und Endsalden automatisch abgeglichen?', a: 'Ja, die mathematische Saldenabstimmung prüft Cent-genau alle Buchungen.' }
    ]
  },
  {
    id: 'santander',
    title: 'Banco Santander Extracto de Cuenta en Excel (.xlsx)',
    slug: 'santander-extracto-cuenta-excel',
    bank: 'Banco Santander',
    region: '🇪🇸 España',
    searchKeyword: 'convertir extracto Banco Santander a Excel',
    description: 'Convierte extractos bancarios PDF de Banco Santander en hojas de cálculo Microsoft Excel y CSV para gestorías y contabilidad.',
    sampleKey: 'santander',
    faq: [
      { q: '¿Es compatible con el software de contabilidad español?', a: 'Sí, exporta datos con formato numérico europeo y conciliación de saldo bancario.' }
    ]
  },
  {
    id: 'ubs',
    title: 'UBS Switzerland Statement to Excel (CHF/EUR)',
    slug: 'ubs-switzerland-statement-to-excel',
    bank: 'UBS Switzerland',
    region: '🇨🇭 Schweiz',
    searchKeyword: 'convert UBS Swiss bank statement to Excel',
    description: 'Export multi-currency Swiss Franc (CHF) and EUR UBS corporate bank statements into structured Excel workbooks.',
    sampleKey: 'ubs',
    faq: [
      { q: 'Supports Swiss Franc (CHF) formatting?', a: 'Yes, full Swiss number formatting and multi-currency ledger support.' }
    ]
  },

  // --- 🇺🇸 USA ---
  {
    id: 'chase',
    title: 'JPMorgan Chase Bank Statement to Excel & CSV Converter',
    slug: 'chase-bank-statement-to-excel',
    bank: 'JPMorgan Chase',
    region: '🇺🇸 United States',
    searchKeyword: 'convert Chase bank statement to excel',
    description: 'Instantly convert JPMorgan Chase Checking, Savings & Credit Card PDF statements into clean, formula-ready Microsoft Excel and CSV files.',
    sampleKey: 'chase',
    faq: [
      { q: 'Does this support scanned Chase PDF statements?', a: 'Yes, our client OCR engine extracts date, description, withdrawals, deposits, and balances accurately.' }
    ]
  }
];

export default function ProgrammaticSeoDirectory({ onSelectBank, onTestSample, onGoHome }) {
  const [selectedBankId, setSelectedBankId] = useState(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Back Navigation */}
      <div className="mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-500" />
          <span>← Ana Sayfaya Dön</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>Avrupa, Birleşik Krallık, ABD ve Türkiye Banka Kataloğu</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
          Tüm Bankalar İçin Özel Ekstre Dönüştürme
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          İngiliz (Barclays, HSBC, Lloyds), Fransız (BNP Paribas, SocGen, Qonto), İtalyan (Intesa, UniCredit), Alman (Deutsche Bank) ve Türk banka formatlarına özel ayrıştırma motoru.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {BANK_SEO_DATA.map((bank) => (
          <div
            key={bank.id}
            onClick={() => {
              setSelectedBankId(bank.id);
              if (bank.sampleKey) onTestSample(bank.sampleKey);
            }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/50 hover:bg-slate-850 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    {bank.region}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
                  %99.8 Doğruluk
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                {bank.bank}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {bank.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Örnek Ekstreyi Canlı Test Et</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
