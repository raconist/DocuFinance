import React, { useState } from 'react';
import { Building2, FileSpreadsheet, ArrowRight, ShieldCheck, HelpCircle, CheckCircle2, ChevronRight, Zap, ArrowLeft } from 'lucide-react';
import { SAMPLE_STATEMENTS } from '../utils/parserEngine';

export const BANK_SEO_DATA = [
  {
    id: 'garanti',
    title: 'Garanti BBVA PDF Ekstre Excel (.xlsx) Çevirme',
    slug: 'garanti-ekstre-excel',
    bank: 'Garanti BBVA',
    region: 'TR',
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
    region: 'TR',
    searchKeyword: 'İş bankası hesap dökümü excel aktarma',
    description: 'İş Bankası ticari hesap dökümlerini, çek/senet hareketlerini ve POS cirolarını 2 saniyede Excel formatına dönüştürün.',
    sampleKey: 'isbankasi',
    faq: [
      { q: 'İş Bankası vadeli/vadesiz hesap formatı ayrıştırılabilir mi?', a: 'Evet, tarih, işlem tanımı, borç ve alacak sütunları otomatik tespit edilir.' }
    ]
  },
  {
    id: 'chase',
    title: 'JPMorgan Chase Bank Statement to Excel & CSV Converter',
    slug: 'chase-bank-statement-to-excel',
    bank: 'JPMorgan Chase',
    region: 'GLOBAL',
    searchKeyword: 'convert Chase bank statement to excel',
    description: 'Instantly convert JPMorgan Chase Checking, Savings & Credit Card PDF statements into clean, formula-ready Microsoft Excel and CSV files.',
    sampleKey: 'chase',
    faq: [
      { q: 'Does this support scanned Chase PDF statements?', a: 'Yes, our heuristic parser extracts date, description, withdrawals, deposits, and balances accurately.' }
    ]
  },
  {
    id: 'efatura',
    title: 'e-Fatura ve e-Arşiv Fatura PDF/XML Excel Tablo Çıkarıcı',
    slug: 'efatura-excel-aktarma',
    bank: 'GİB e-Fatura / e-Arşiv',
    region: 'TR',
    searchKeyword: 'e fatura excel aktarma programı',
    description: 'GİB e-Fatura ve e-Arşiv dökümlerindeki kalemleri, matrahı, KDV oranlarını ve genel toplamları otomatik tablo olarak Excel’e aktarın.',
    sampleKey: 'efatura',
    faq: [
      { q: 'Toplu e-fatura aktarımı yapabilir miyim?', a: 'Evet, Pro sürümde çoklu fatura yükleyip tek bir Excel çalışma kitabında birleştirebilirsiniz.' }
    ]
  }
];

export default function ProgrammaticSeoDirectory({ onSelectBank, onTestSample, onGoHome }) {
  const [selectedBankId, setSelectedBankId] = useState(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
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
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5" />
          <span>Desteklenen Bankalar & Entegrasyonlar</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
          Tüm Bankalar İçin Özel Ekstre Dönüştürme
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Banka formatınıza özel optimize edilmiş ayrıştırma kuralları ile %99.8 doğruluk oranı.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {BANK_SEO_DATA.map((bank) => (
          <div
            key={bank.id}
            onClick={() => {
              setSelectedBankId(bank.id);
              if (bank.sampleKey) onTestSample(bank.sampleKey);
            }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                  {bank.region}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                {bank.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {bank.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Hemen Canlı Dene</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* SEO FAQs & Guide Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          Sıkça Sorulan Sorular (SEO & Kullanım)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/5">
            <h4 className="text-xs font-bold text-white mb-1">
              Banka ekstrelerimi yüklediğimde verilerim güvende mi?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evet. DocuFinance AI istemci taraflı (Zero-Knowledge) çalışır. Dosyalarınız hiçbir uzak sunucuya aktarılmaz, doğrudan bilgisayarınızın tarayıcı belleğinde işlenir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/5">
            <h4 className="text-xs font-bold text-white mb-1">
              Çıktı Excel dosyasında formüller bulunuyor mu?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evet. Oluşturulan <code className="text-emerald-400">.xlsx</code> dosyasında toplam borç, toplam alacak ve mutabakat için otomatik Excel formülleri (<code className="text-emerald-400">=SUM</code>) eklenir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/5">
            <h4 className="text-xs font-bold text-white mb-1">
              Hassas verileri (IBAN, TC Kimlik No) gizleyebilir miyim?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evet. Tek tıkla "Hassas Veriyi Gizle (PII)" seçeneğini açarak ekstredeki tüm IBAN ve kimlik numaralarını maskeleyebilirsiniz.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/5">
            <h4 className="text-xs font-bold text-white mb-1">
              Hangi muhasebe programlarıyla uyumludur?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              İndirilen Excel ve CSV dosyaları Logo, Mikro, Zirve, Luca, Paraşüt, QuickBooks ve Xero gibi tüm popüler muhasebe yazılımlarına doğrudan aktarılabilir.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
