import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  ArrowLeft, 
  Globe, 
  Lock, 
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  Layers,
  FileCheck2,
  Cpu
} from 'lucide-react';
import { SAMPLE_STATEMENTS } from '../utils/parserEngine';
import { updatePageSeo, generateBankSeoSchemas } from '../utils/seoHelper';

export const BANK_SEO_DATA = [
  // --- 🇹🇷 MUHASEBE PROGRAMI & VERGİ ENTEGRASYONLARI ---
  {
    id: 'luca_aktarim',
    title: 'Luca Muhasebe Banka Ekstresi ve Fiş Aktarımı (XML / Excel / CSV)',
    slug: 'luca-ekstre-fis-aktarim-programi',
    bank: 'Luca Mali Müşavir Paketi',
    region: '🇹🇷 Türkiye',
    category: 'Muhasebe Yazılımı',
    searchKeyword: 'luca ekstre fiş aktarım programı excel xml',
    description: 'Tüm bankaların PDF ekstrelerini 2 saniyede Luca Muhasebe sistemine doğrudan aktarılabilir Yevmiye Fişi ve Borç/Alacak dengeli Excel formatına dönüştürün.',
    sampleKey: 'garanti',
    highlights: [
      '150+ TDHP Kuralı ile 102, 770, 320, 600 otomatik hesap kodları',
      'Luca Fiş Aktarım XML ve Dengeli Excel formatı desteği',
      '50 adede kadar aylık ekstreyi tek seferde konsolide etme',
      '%100 İstemci taraflı Zero-Knowledge veri güvenliği'
    ],
    howToSteps: [
      { title: '1. Banka PDF Ekstresini Seçin', desc: 'Garanti, İş Bankası, Ziraat veya dilediğiniz bankanın PDF hesap özetini yükleyin.' },
      { title: '2. Otomatik TDHP Kodlaması', desc: 'Yapay zeka motorumuz tüm satırları Luca hesap planına (102, 770, 360, vb.) otomatik atar.' },
      { title: '3. Luca Uyumlu İndirin', desc: 'Tek tıkla Luca Muhasebe Yazılımına doğrudan aktarılacak dosyayı indirin.' }
    ],
    faq: [
      { q: 'Luca formatında borç ve alacak hesap kodları otomatik gelir mi?', a: 'Evet, 150+ TDHP kuralı ile 102 (Banka), 770 (Genel Yönetim), 320 (Satıcılar) ve 600 (Satışlar) hesap kodları otomatik doldurulur.' },
      { q: 'Toplu 12 aylık ekstreler Luca\'ya tek seferde aktarılabilir mi?', a: 'Evet, 50 adede kadar PDF tek seferde yüklenip tek bir konsolide Luca fişine dönüştürülebilir.' },
      { q: 'Mali Müşavirler için veri gizliliği nasıl sağlanıyor?', a: 'Zero-Knowledge mimarimiz sayesinde müşterilerinizin finansal verileri bilgisayarınızdan asla çıkmaz, sunucuya yüklenmez.' }
    ]
  },
  {
    id: 'zirve_aktarim',
    title: 'Zirve Muhasebe Banka Ekstresi Excel ve Fiş Aktarımı',
    slug: 'zirve-ekstre-excel-aktarma',
    bank: 'Zirve Yazılım',
    region: '🇹🇷 Türkiye',
    category: 'Muhasebe Yazılımı',
    searchKeyword: 'zirve finansman ekstre excel aktarma fiş oluşturma',
    description: 'Zirve Müşavir ve Finansman programları için PDF banka ekstrelerini formüllü Excel fiş aktarım şablonuna çevirin.',
    sampleKey: 'isbankasi',
    highlights: [
      'Zirve Fiş Aktarım Şablonu ile %100 uyumlu sütun yapısı',
      'Matematiksel bakiye ve kuruş doğrulaması',
      'Otomatik açıklama temizleme ve cari hesap eşleştirme'
    ],
    howToSteps: [
      { title: '1. Ekstre Yükleme', desc: 'Zirveye aktarılacak PDF banka ekstresini sürükleyin.' },
      { title: '2. Otomatik Ayrıştırma', desc: 'Tarih, Evrak No, Açıklama, Borç ve Alacak tutarları hatasız ayrıştırılır.' },
      { title: '3. Zirve Excel İndirme', desc: 'Zirve Fiş Girişi menüsünden Excelden Fiş Aktar diyerek anında içeri alın.' }
    ],
    faq: [
      { q: 'Zirve Fiş Aktarım Excel şablonu ile birebir uyumlu mudur?', a: 'Evet, Zirve\'nin beklediği Tarih, Fiş No, Hesap Kodu, Borç ve Alacak sütun yapısıyla %100 uyumludur.' },
      { q: 'Çek ve senet hareketleri ayrışıyor mu?', a: 'Evet, açıklamadaki çek/senet referans numaraları bağımsız sütunlarda listelenir.' }
    ]
  },
  {
    id: 'logo_aktarim',
    title: 'Logo GO 3 / Tiger Banka Ekstresi Aktarım Motoru',
    slug: 'logo-banka-ekstresi-aktarma',
    bank: 'Logo Yazılım',
    region: '🇹🇷 Türkiye',
    category: 'Muhasebe Yazılımı',
    searchKeyword: 'logo go3 tiger banka ekstresi excel aktarım',
    description: 'Logo muhasebe programları için banka hareketlerini otomatik TDHP kodlarıyla eşleştirip Excel ve XML fiş dökümü alın.',
    sampleKey: 'garanti',
    highlights: [
      'Logo GO 3, Tiger 3 ve Wings uyumlu aktarım formatı',
      'Virman, havale ve EFT hareketlerinin dengeli muhasebeleşmesi',
      'Hızlı ve güvenli yerel tarayıcı içi işleme'
    ],
    howToSteps: [
      { title: '1. PDF Seçimi', desc: 'Logo sistemine işlenecek banka ekstresini panele yükleyin.' },
      { title: '2. Veri Doğrulama', desc: 'Giriş ve çıkış bakiyelerinin eşitliği otomatik kontrol edilir.' },
      { title: '3. Dışa Aktarma', desc: 'Logo uyumlu Excel/CSV formatında anında indirin.' }
    ],
    faq: [
      { q: 'Logo banka fişi oluştururken virman ve havaleler ayrışır mı?', a: 'Evet, gelen ve giden transferler ayrı Borç/Alacak satırları olarak dengeli üretilir.' }
    ]
  },
  {
    id: 'kdv_simulator',
    title: 'Otomatik KDV, Geçici Vergi ve Stopaj Hesaplama Aracı',
    slug: 'muhasebe-kdv-hesaplama-ve-ekstre-aktarma',
    bank: 'Gelir İdaresi (GİB)',
    region: '🇹🇷 Türkiye',
    category: 'Vergi & KDV',
    searchKeyword: 'aylık tahmini kdv hesaplama gelir gider stopaj',
    description: 'Banka ekstrelerinizdeki ve faturalarınızdaki gelir/gider dengesinden bu ay çıkacak tahmini KDV ve Geçici Vergi tutarını anında hesaplayın.',
    sampleKey: 'garanti',
    highlights: [
      '1 No\'lu KDV Beyannamesi hesaplama mantığı ile tam uyum',
      '%20, %10 ve %1 KDV matrah ayrıştırması',
      'Dönem sonu tahmini Geçici/Kurumlar Vergisi simülasyonu'
    ],
    howToSteps: [
      { title: '1. Ekstre veya Faturaları Yükleyin', desc: 'Aylık hareketlerinizi sisteme aktarın.' },
      { title: '2. Vergi Simülatörünü Açın', desc: 'Yapay zeka gelir ve giderlerinizi KDV matrahlarına göre gruplar.' },
      { title: '3. Vergi Raporunu İndirin', desc: 'Dönem sonu çıkacak KDV ve vergi yükünüzü Excel olarak kaydedin.' }
    ],
    faq: [
      { q: 'Hesaplanan KDV ve İndirilecek KDV nasıl hesaplanır?', a: 'Giderlerinizdeki %20/%10 KDV ile satışlarınızdaki KDV karşılaştırılarak net ödenecek KDV bulunur.' },
      { q: 'Stopaj ve Muhtasar dahil mi?', a: 'Evet, kira ve serbest meslek ödemelerindeki stopaj payları otomatik ayrıştırılır.' }
    ]
  },
  {
    id: 'e_fatura_kdv',
    title: 'GİB e-Fatura & e-Arşiv XML İndirilecek KDV Listesi Çıkarma',
    slug: 'e-fatura-indirilecek-kdv-listesi-cikarma',
    bank: 'GİB e-Fatura / e-Arşiv',
    region: '🇹🇷 Türkiye',
    category: 'e-Fatura / e-Arşiv',
    searchKeyword: 'gib e fatura xml indirilecek kdv listesi excel ba bs',
    description: 'Yüzlerce e-Fatura ve e-Arşiv XML dosyasını tek tıkla GİB formatında İndirilecek KDV Listesi ve Ba-Bs mutabakat tablosuna dönüştürün.',
    sampleKey: 'garanti',
    highlights: [
      'UBL-TR 2.1 e-Fatura & e-Arşiv XML desteği',
      'GİB İndirilecek KDV Listesi standart Excel tablosu',
      'Otomatik Ba-Bs VKN/TCKN bazında mutabakat özeti'
    ],
    howToSteps: [
      { title: '1. XML Faturaları Sürükleyin', desc: 'Toplu e-Fatura veya e-Arşiv XML dosyalarını bırakın.' },
      { title: '2. Matrah & KDV Ayrıştırması', desc: 'Sistem satıcı VKN, unvan, matrah ve KDV tutarlarını listeler.' },
      { title: '3. GİB Formatında İndirin', desc: 'Beyanname eki İndirilecek KDV Excel tablosunu anında alın.' }
    ],
    faq: [
      { q: 'KDV Tevkifatı ve matrah ayrıştırması yapılıyor mu?', a: 'Evet, XML içerisindeki matrah, vergi oranı, KDV tutarı ve tevkifat otomatik listelenir.' }
    ]
  },

  // --- 🇹🇷 TÜRKİYE BANKALARI ---
  {
    id: 'garanti',
    title: 'Garanti BBVA PDF Ekstre Excel (.xlsx) Çevirme',
    slug: 'garanti-bankasi-ekstre-excel-cevirme',
    bank: 'Garanti BBVA',
    region: '🇹🇷 Türkiye',
    category: 'Türk Bankaları',
    searchKeyword: 'Garanti bankası ekstre excel çevirme',
    description: 'Garanti BBVA ticari ve bireysel hesap ekstrelerini anında formüllü Excel (.xlsx) ve CSV formatına aktarın. Borç, alacak ve bakiye mutabakatı otomatik hesaplanır.',
    sampleKey: 'garanti',
    highlights: [
      'Garanti Kurumsal İnternet ve Mobil PDF ekstre desteği',
      'POS bloke çözüm ve ticari kredi hareketleri ayrıştırma',
      'Luca, Zirve ve Logo doğrudan aktarım desteği'
    ],
    howToSteps: [
      { title: '1. Garanti Ekstresini Yükleyin', desc: 'Garanti BBVA internet bankacılığından aldığınız PDF ekstreyi yükleyin.' },
      { title: '2. Canlı Önizleme & Düzenleme', desc: 'Tüm hareketler kuruşu kuruşuna tabloya dökülür.' },
      { title: '3. Excel Olarak İndirin', desc: 'Formüllü .xlsx veya muhasebe formatında anında bilgisayarınıza kaydedin.' }
    ],
    faq: [
      { q: 'Garanti BBVA PDF ekstreleri şifreli mi işleniyor?', a: 'Evet, DocuFinance AI istemci taraflı Zero-Knowledge mimarisi ile çalışır. Ekstreniz hiçbir sunucuya yüklenmez.' },
      { q: 'Garanti İnternet Şubesi ekstre formatı destekleniyor mu?', a: 'Evet, hem web şubesi hem de Garanti Kurumsal PDF dökümleri tam uyumludur.' }
    ]
  },
  {
    id: 'isbankasi',
    title: 'Türkiye İş Bankası Hesap Hareketleri Excel Dönüştürücü',
    slug: 'is-bankasi-hesap-ozeti-excel-aktarma',
    bank: 'Türkiye İş Bankası',
    region: '🇹🇷 Türkiye',
    category: 'Türk Bankaları',
    searchKeyword: 'İş bankası hesap dökümü excel aktarma',
    description: 'İş Bankası ticari hesap dökümlerini, çek/senet hareketlerini ve POS cirolarını 2 saniyede Excel formatına dönüştürün.',
    sampleKey: 'isbankasi',
    highlights: [
      'İşCep ve Ticari İnternet Şubesi PDF formatı uyumu',
      'Çoklu sayfa desteği ve kesintisiz bakiye doğrulaması',
      'Formüllü bakiye sütunu ile hatasız kontrol'
    ],
    howToSteps: [
      { title: '1. İş Bankası PDF Yükleyin', desc: 'Hesap hareketleri dökümünüzü sürükleyip bırakın.' },
      { title: '2. Otomatik Analiz', desc: 'Borç, Alacak ve Bakiye alanları otomatik ayrıştırılır.' },
      { title: '3. Excel İndir', desc: 'Temiz ve düzenli Excel tablosunu hemen indirin.' }
    ],
    faq: [
      { q: 'İş Bankası vadeli/vadesiz hesap formatı ayrıştırılabilir mi?', a: 'Evet, tarih, işlem tanımı, borç ve alacak sütunları otomatik tespit edilir.' }
    ]
  },
  {
    id: 'akbank',
    title: 'Akbank PDF Ekstre Excel ve CSV Dönüştürücü',
    slug: 'akbank-ekstre-pdf-to-excel-donusturucu',
    bank: 'Akbank',
    region: '🇹🇷 Türkiye',
    category: 'Türk Bankaları',
    searchKeyword: 'akbank ekstre excel çevirme pdf to xlsx',
    description: 'Akbank ticari cari ve bireysel hesap ekstrelerini anında Excel, CSV ve Luca formatlarına aktarın.',
    sampleKey: 'akbank',
    highlights: [
      'Akbank Direkt Kurumsal PDF tam uyumu',
      'POS ve kredi kartı ticari harcama dökümleri',
      'Sıfır bilgi garantili yerel işlem'
    ],
    howToSteps: [
      { title: '1. PDF Yükleyin', desc: 'Akbank hesap özetinizi yükleyin.' },
      { title: '2. Ayrıştırma', desc: 'Hareketler ve bakiyeler otomatik hesaplanır.' },
      { title: '3. İndirme', desc: 'Tek tıkla Excel dosyanızı alın.' }
    ],
    faq: [
      { q: 'Akbank kurumsal ekstrelerde sayfa sınırlaması var mı?', a: 'Hayır, 100+ sayfalık Akbank ekstrelerini dahi tek tıkla işleyebilirsiniz.' }
    ]
  },
  {
    id: 'yapikredi',
    title: 'Yapı Kredi Hesap Özeti Excel & Luca/Zirve Aktarımı',
    slug: 'yapi-kredi-ekstre-luca-zirve-aktarim',
    bank: 'Yapı Kredi',
    region: '🇹🇷 Türkiye',
    category: 'Türk Bankaları',
    searchKeyword: 'yapı kredi ekstre excel çevirme',
    description: 'Yapı Kredi Bankası hesap hareketlerini ve ticari ekstrelerini formüllü Excel formatına dönüştürün.',
    sampleKey: 'yapikredi',
    highlights: [
      'Yapı Kredi Kurumsal İnternet PDF desteği',
      'Worldcard ticari kart ekstreleri ayrıştırması',
      'Hatasız borç/alacak mutabakatı'
    ],
    howToSteps: [
      { title: '1. Yükleyin', desc: 'Yapı Kredi PDF dosyasını bırakın.' },
      { title: '2. İnceleyin', desc: 'Canlı Data Studio üzerinde düzenleyin.' },
      { title: '3. İndirin', desc: 'Excel ve muhasebe formatlarını alın.' }
    ],
    faq: [
      { q: 'Yapı Kredi ekstrelerindeki POS kesintileri ayrışıyor mu?', a: 'Evet, komisyon ve bsmv tutarları ayrı sütunlarda ayrıştırılır.' }
    ]
  },
  {
    id: 'ziraat',
    title: 'Ziraat Bankası Dekont ve Ekstre Excel Çevirici',
    slug: 'ziraat-bankasi-dekont-ve-ekstre-excel',
    bank: 'Ziraat Bankası',
    region: '🇹🇷 Türkiye',
    category: 'Türk Bankaları',
    searchKeyword: 'ziraat bankası ekstre excel aktarma',
    description: 'Ziraat Bankası kamu, ticari ve bireysel hesap ekstrelerini formüllü Excel ve muhasebe fişine dönüştürün.',
    sampleKey: 'ziraat',
    highlights: [
      'Ziraat Kurumsal PDF ekstre şablonuna %100 uyum',
      'Vergi ve harç ödemelerinin otomatik kodlanması',
      'Kamu hakediş ve tahsilat kayıtlarının ayrıştırılması'
    ],
    howToSteps: [
      { title: '1. Ziraat PDF Ekleyin', desc: 'Ziraat ekstrenizi yükleyin.' },
      { title: '2. Ayrıştırma', desc: 'Yapay zeka saniyeler içinde tabloya döker.' },
      { title: '3. Excel İndirin', desc: 'Dosyanızı hemen indirin.' }
    ],
    faq: [
      { q: 'Ziraat Bankası dekontları destekleniyor mu?', a: 'Evet, hem toplu ekstreler hem de tekil dekontlar desteklenmektedir.' }
    ]
  },

  // --- 🇺🇸 GLOBAL & QUICKBOOKS / XERO ---
  {
    id: 'quickbooks_qbo',
    title: 'PDF Bank Statement to QuickBooks (.QBO) & Xero Converter',
    slug: 'quickbooks-bank-statement-converter',
    bank: 'QuickBooks & Xero',
    region: '🇺🇸 Global (USA/UK)',
    category: 'Global Accounting',
    searchKeyword: 'convert PDF bank statement to QuickBooks QBO OFX Xero CSV',
    description: 'Transform unscannable or multi-page bank PDF statements into native QuickBooks Web Connect (.QBO) and Xero CSV files with 100% balance reconciliation.',
    sampleKey: 'chase',
    highlights: [
      'Direct .QBO / .OFX bank feed export for QuickBooks Desktop & Online',
      'Clean Xero 2-column & 3-column CSV mapping',
      'Zero-knowledge client-side encryption compliant with AICPA SOC2 & GDPR'
    ],
    howToSteps: [
      { title: '1. Upload PDF Statement', desc: 'Drop any US or UK bank statement PDF.' },
      { title: '2. Automatic Categorization', desc: 'Our engine reconciles deposits, withdrawals and balances.' },
      { title: '3. Export to .QBO / Excel', desc: 'Import directly into QuickBooks Banking menu.' }
    ],
    faq: [
      { q: 'Does QuickBooks Online accept these files?', a: 'Yes, .QBO (OFX) is the native direct import format supported by all QuickBooks desktop and online versions.' }
    ]
  },

  // --- 🇩🇪 GERMANY & DATEV ---
  {
    id: 'datev_konverter',
    title: 'DATEV Bank-Buchungsstapel Konverter (SKR03 / SKR04)',
    slug: 'datev-bank-buchungen-konvertieren',
    bank: 'DATEV eG (Germany)',
    region: '🇩🇪 Deutschland',
    category: 'German Accounting',
    searchKeyword: 'DATEV bank buchungsstapel ascii csv konvertieren skr03 skr04',
    description: 'Konvertieren Sie PDF-Kontoauszüge aller deutschen Banken direkt in das offizielle DATEV Buchungsstapel-Format (ASCII/CSV).',
    sampleKey: 'deutschebank',
    highlights: [
      'Offizielles DATEV EXTF-700 Format (ASCII/CSV)',
      'Automatische SKR03 / SKR04 Kontenzuordnung (1200 Bank, 4900 Aufwand)',
      '100% DSGVO-konforme clientseitige Zero-Knowledge Verarbeitung'
    ],
    howToSteps: [
      { title: '1. PDF-Kontoauszug hochladen', desc: 'Laden Sie den Auszug der Deutschen Bank, Sparkasse oder Commerzbank hoch.' },
      { title: '2. DATEV Stapel-Generierung', desc: 'Buchungstexte und Gegenkonten werden automatisch formatiert.' },
      { title: '3. DATEV CSV herunterladen', desc: 'Direkt in DATEV Kanzlei-Rechnungswesen importieren.' }
    ],
    faq: [
      { q: 'Ist das Format kompatibel mit DATEV Rechnungswesen?', a: 'Ja, die generierten CSV/ASCII-Dateien folgen den offiziellen DATEV EXTF-700 Spezifikationen.' }
    ]
  },

  // --- 🇬🇧 UNITED KINGDOM ---
  {
    id: 'hsbc_uk',
    title: 'HSBC UK Commercial Bank Statement to Excel & QBO',
    slug: 'hsbc-uk-bank-statement-to-excel',
    bank: 'HSBC UK',
    region: '🇬🇧 United Kingdom',
    category: 'UK Banks',
    searchKeyword: 'convert HSBC UK statement to excel csv qbo',
    description: 'Convert HSBC UK Business Current Accounts and PDF statements into formatted Microsoft Excel, CSV, and QuickBooks (.QBO) feeds with HMRC VAT reconciliation.',
    sampleKey: 'hsbc_uk',
    highlights: [
      'Full detection of BACS, CHAPS, Faster Payments, and Direct Debits',
      'Excel formulas for automated opening & closing balance audit',
      'Making Tax Digital (MTD) HMRC VAT ready spreadsheet outputs'
    ],
    howToSteps: [
      { title: '1. Upload HSBC UK Statement', desc: 'Drop your HSBC PDF commercial account statement.' },
      { title: '2. Reconcile Balance', desc: 'Verify debits, credits, and rolling balances.' },
      { title: '3. Download Excel / CSV', desc: 'Export formatted Excel workbook or Xero/QBO file.' }
    ],
    faq: [
      { q: 'Is HSBC UK Faster Payments and BACS recognized?', a: 'Yes, our UK engine detects BACS, CHAPS, Faster Payments, and HMRC tax deductions automatically.' }
    ]
  },
  {
    id: 'barclays',
    title: 'Barclays Bank Statement to Excel Converter',
    slug: 'barclays-bank-statement-to-csv-excel',
    bank: 'Barclays Bank UK',
    region: '🇬🇧 United Kingdom',
    category: 'UK Banks',
    searchKeyword: 'Barclays PDF statement to Excel converter',
    description: 'Instantly convert Barclays Business and Personal PDF bank statements into clean Excel spreadsheets ready for Xero, QuickBooks, and accountant audit.',
    sampleKey: 'barclays',
    highlights: [
      'Barclays Business and Corporate PDF format recognition',
      'Direct .QBO bank feed export',
      'GDPR compliant client-side processing'
    ],
    howToSteps: [
      { title: '1. Upload Barclays PDF', desc: 'Add Barclays PDF statement.' },
      { title: '2. Instant OCR & Parsing', desc: 'Extract all transaction rows in under 2 seconds.' },
      { title: '3. Export', desc: 'Download Excel or CSV.' }
    ],
    faq: [
      { q: 'Can I export Barclays statements to QuickBooks QBO?', a: 'Yes, 1-click native .QBO / .OFX bank feed export is fully supported.' }
    ]
  },

  // --- 🇫🇷 FRANCE ---
  {
    id: 'bnpparibas',
    title: 'BNP Paribas Relevé de Compte PDF en Excel (.xlsx)',
    slug: 'bnp-paribas-releve-de-compte-excel-convertisseur',
    bank: 'BNP Paribas',
    region: '🇫🇷 France',
    category: 'French Banks',
    searchKeyword: 'convertir relevé de compte BNP Paribas en Excel',
    description: 'Convertissez instantanément vos relevés bancaires professionnels BNP Paribas PDF en feuilles Excel (.xlsx) et CSV formatées avec contrôle de solde.',
    sampleKey: 'bnpparibas',
    highlights: [
      'Reconnaissance automatique des opérations SEPA et URSSAF',
      'Format Excel compatible logiciels comptables français (Sage, Cegid)',
      '100% conforme RGPD'
    ],
    howToSteps: [
      { title: '1. Téléverser le relevé BNP', desc: 'Glissez votre relevé PDF.' },
      { title: '2. Vérification automatique', desc: 'Les débits, crédits et soldes sont rapprochés.' },
      { title: '3. Télécharger en Excel', desc: 'Exportez en .xlsx ou .csv propre.' }
    ],
    faq: [
      { q: 'Les virements SEPA et prélèvements URSSAF sont-ils reconnus ?', a: 'Oui, le moteur français classe automatiquement les charges URSSAF, loyers et virements clients.' }
    ]
  },

  // --- 🇮🇹 ITALY ---
  {
    id: 'intesa',
    title: 'Intesa Sanpaolo Estratto Conto PDF in Excel (.xlsx)',
    slug: 'intesa-sanpaolo-estratto-conto-excel-converter',
    bank: 'Intesa Sanpaolo',
    region: '🇮🇹 Italia',
    category: 'Italian Banks',
    searchKeyword: 'convertire estratto conto Intesa Sanpaolo in Excel',
    description: 'Converti gli estratti conto bancari aziendali Intesa Sanpaolo in fogli di calcolo Excel (.xlsx) e CSV con quadratura automatica del saldo.',
    sampleKey: 'intesa',
    highlights: [
      'Riconoscimento automatico modelli F24 e bonifici SEPA',
      'Formattazione numerica italiana con virgola decimale',
      '100% Zero-Knowledge nel browser'
    ],
    howToSteps: [
      { title: '1. Carica estratto conto', desc: 'Trascina il PDF Intesa Sanpaolo.' },
      { title: '2. Estrazione dati', desc: 'Riconciliazione immediata dei saldi.' },
      { title: '3. Scarica Excel', desc: 'Salva il foglio Excel per il commercialista.' }
    ],
    faq: [
      { q: 'Riconosce i modelli F24 e i bonifici SEPA?', a: 'Sì, le imposte F24, i contributi INPS e le spese operative vengono categorizzate automaticamente.' }
    ]
  },

  // --- 🇺🇸 USA ---
  {
    id: 'chase',
    title: 'JPMorgan Chase Bank Statement to Excel & CSV Converter',
    slug: 'chase-bank-statement-to-excel-csv',
    bank: 'JPMorgan Chase',
    region: '🇺🇸 United States',
    category: 'US Banks',
    searchKeyword: 'convert Chase bank statement to excel',
    description: 'Instantly convert JPMorgan Chase Checking, Savings & Credit Card PDF statements into clean, formula-ready Microsoft Excel and CSV files.',
    sampleKey: 'chase',
    highlights: [
      'Chase Business Complete Banking and Personal Checking PDF format support',
      'Native QuickBooks .QBO & Xero CSV export',
      'Accurate handling of deposits, withdrawals, and merchant fees'
    ],
    howToSteps: [
      { title: '1. Upload Chase Statement', desc: 'Drag & drop your Chase PDF statement.' },
      { title: '2. Live Audit Review', desc: 'Review parsed transactions with formula validation.' },
      { title: '3. Save Excel / QBO', desc: 'Export formatted spreadsheet in seconds.' }
    ],
    faq: [
      { q: 'Does this support scanned Chase PDF statements?', a: 'Yes, our client OCR engine extracts date, description, withdrawals, deposits, and balances accurately.' }
    ]
  }
];

export default function ProgrammaticSeoDirectory({ 
  onSelectBank, 
  onTestSample, 
  onGoHome,
  activeSlug = null 
}) {
  const [selectedBank, setSelectedBank] = useState(() => {
    if (activeSlug) {
      return BANK_SEO_DATA.find(b => b.slug === activeSlug || b.id === activeSlug) || null;
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Sync activeSlug prop
  useEffect(() => {
    if (activeSlug) {
      const found = BANK_SEO_DATA.find(b => b.slug === activeSlug || b.id === activeSlug);
      if (found) setSelectedBank(found);
    }
  }, [activeSlug]);

  // Update Dynamic SEO Meta Tags whenever selectedBank changes
  useEffect(() => {
    if (selectedBank) {
      const schemas = generateBankSeoSchemas(selectedBank);
      updatePageSeo({
        title: `${selectedBank.title} | DocuFinance AI`,
        description: selectedBank.description,
        keywords: `${selectedBank.searchKeyword}, banka ekstresi excel, pdf to excel, zero knowledge fintech`,
        canonicalUrl: `https://docufinance.vercel.app/convert/${selectedBank.slug}`,
        jsonLdSchemas: schemas
      });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      updatePageSeo({
        title: 'Tüm Bankalar & Muhasebe Programları Ekstre Çevirici Kataloğu | DocuFinance AI',
        description: 'Garanti, İş Bankası, Akbank, Ziraat, Luca, Zirve, Logo, DATEV, QuickBooks ve 50+ dünya bankasının PDF ekstrelerini Excel (.xlsx) ve CSV formatına dönüştürün.',
        keywords: 'banka ekstresi excel çevirme, luca ekstre aktarma, zirve ekstre aktarımı, datev konverter, quickbooks statement converter',
        canonicalUrl: 'https://docufinance.vercel.app/#banks'
      });
    }
  }, [selectedBank]);

  // Categories list
  const categories = ['All', '🇹🇷 Türkiye', 'Muhasebe Yazılımı', '🇬🇧 United Kingdom', '🇩🇪 Deutschland', '🇺🇸 Global (USA/UK)', '🇫🇷 France', '🇮🇹 Italia'];

  // Filtered banks
  const filteredBanks = BANK_SEO_DATA.filter(b => {
    const matchesCategory = activeCategory === 'All' || b.region === activeCategory || b.category === activeCategory;
    const matchesSearch = !searchQuery || 
      b.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.searchKeyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // -------------------------------------------------------------
  // DETAIL VIEW: DEDICATED HIGH-CONVERTING PROGRAMMATIC SEO LANDING PAGE
  // -------------------------------------------------------------
  if (selectedBank) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        
        {/* Breadcrumb Navigation for SEO */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <button 
            onClick={() => {
              setSelectedBank(null);
              onGoHome();
            }} 
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
          >
            Ana Sayfa
          </button>
          <span>/</span>
          <button 
            onClick={() => setSelectedBank(null)} 
            className="hover:text-emerald-400 transition-colors font-semibold"
          >
            Banka & Muhasebe Kataloğu
          </button>
          <span>/</span>
          <span className="text-emerald-400 font-bold truncate max-w-[200px] sm:max-w-none">
            {selectedBank.bank}
          </span>
        </nav>

        {/* Top Back Button */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedBank(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
            <span>← Tüm Bankalar Listesine Dön</span>
          </button>
        </div>

        {/* Main Hero Card for the Selected Bank (H1 Title) */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-[#070b13] border border-emerald-500/30 shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {selectedBank.region}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold">
                {selectedBank.category || 'Resmi Ekstre Formatı'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                %100 Sıfır-Bilgi Güvenliği (Zero-Knowledge)
              </span>
            </div>

            {/* H1 Primary Heading */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-display mb-4">
              {selectedBank.title}
            </h1>

            {/* Comprehensive Meta-Rich Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mb-8">
              {selectedBank.description} DocuFinance AI patentli OCR ve ayrıştırma motoru ile ekstrelerinizdeki tüm tarihleri, işlem açıklamalarını, vergi/SGK kesintilerini ve bakiye hareketlerini kuruşu kuruşuna hatasız biçimde formüllü Excel (.xlsx) ve CSV formatına dönüştürün.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={() => {
                  if (selectedBank.sampleKey) {
                    onTestSample(selectedBank.sampleKey);
                  }
                }}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>⚡ {selectedBank.bank} Örnek Ekstresini Canlı Test Et</span>
              </button>

              <button
                onClick={onGoHome}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base border border-white/10 transition-all"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>Kendi PDF Dosyanızı Yükleyin</span>
              </button>
            </div>

          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10">
            <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Neden DocuFinance AI ile {selectedBank.bank} Ekstresi?
            </h2>
            <ul className="space-y-3">
              {(selectedBank.highlights || [
                'Formüllü bakiye sağlama sütunu ile %100 matematiksel mutabakat',
                'Borç ve alacak tutarlarının kuruşu kuruşuna hatasız ayrıştırılması',
                'Luca, Zirve, Logo, QuickBooks ve Xero ile tam entegre sütun yapısı',
                '256-Bit yerel tarayıcı içi şifreleme; verileriniz cihazınızdan asla ayrılmaz'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Sıfır-Bilgi Güvenlik Garantisi (KVKK & GDPR)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                {selectedBank.bank} banka ekstrenizdeki hesap numaraları, bakiye bilgileri ve ticari hareketler hiçbir sunucumuza yüklenmez. Tüm ayrıştırma ve OCR işlemleri %100 yerel olarak cihazınızın tarayıcısında (client-side) tamamlanır.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Veri Gizliliği Sözleşmesi & ISO 27001 / SOC 2 Uyumlu Mimari</span>
            </div>
          </div>
        </div>

        {/* HowTo Step-by-Step Guide Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 mb-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase">Kolay Kullanım</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-display">
              {selectedBank.bank} Ekstresini 3 Adımda Excel'e Aktarma
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(selectedBank.howToSteps || [
              { title: '1. PDF Ekstrenizi Yükleyin', desc: 'Banka internet şubesinden aldığınız PDF dökümünü sürükleyin.' },
              { title: '2. Otomatik Analiz & Doğrulama', desc: 'Yapay zeka motoru tüm satırları, tarihleri ve bakiyeleri ayrıştırır.' },
              { title: '3. Formüllü Excel İndirin', desc: 'Tek tıkla Excel (.xlsx), CSV veya muhasebe fişi olarak indirin.' }
            ]).map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center mb-3">
                  {idx + 1}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive FAQ Accordion (Optimized for Google FAQ Rich Snippets) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 mb-10">
          <div className="flex items-center gap-2.5 mb-6">
            <HelpCircle className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Sıkça Sorulan Sorular (SSS)
            </h2>
          </div>

          <div className="space-y-3">
            {selectedBank.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-100">
                      {item.q}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-emerald-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-fadeIn">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Related Banks & Internal Linking for SEO Link Equity */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">
            Diğer Popüler Banka ve Muhasebe Ekstre Çeviricileri
          </h3>
          <div className="flex flex-wrap gap-2">
            {BANK_SEO_DATA.filter(b => b.id !== selectedBank.id).slice(0, 10).map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBank(b)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                {b.bank} Ekstre Çevirme
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // DIRECTORY CATALOG VIEW: ALL SUPPORTED BANKS & ACCOUNTING TOOLS
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Back Navigation */}
      <div className="mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
          <span>← Ana Sayfaya Dön</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>Avrupa, Birleşik Krallık, ABD ve Türkiye Banka Kataloğu</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
          Tüm Bankalar & Muhasebe Programları İçin Özel Ekstre Çevirici
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
          Garanti BBVA, İş Bankası, Ziraat, Akbank, Yapı Kredi, Luca, Zirve, Logo, DATEV ve QuickBooks formatlarına özel %100 uyumlu istemci taraflı dönüştürme motoru.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8 bg-slate-900/90 p-2.5 rounded-2xl border border-white/10 shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Banka, program veya anahtar kelime ara (örn: Garanti, Luca, DATEV)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            onClick={() => setSelectedBank(bank)}
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

              <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                {bank.bank}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {bank.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Detaylı Rehber & Canlı Demo</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
