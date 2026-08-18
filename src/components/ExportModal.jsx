import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Globe, 
  Building2, 
  Briefcase, 
  ChevronRight,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { 
  exportToExcel, 
  exportToLucaCSV, 
  exportToZirveExcel, 
  exportToLogoExcel, 
  exportToParasutCSV, 
  exportToQBO, 
  exportToQIF, 
  exportToCSV, 
  exportToJSON 
} from '../utils/exportEngine';
import confetti from 'canvas-confetti';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  data, 
  isMaskedDefault = false, 
  currency = 'TRY',
  bankName = 'Banka_Ekstresi',
  theme = 'dark',
  lang = 'tr'
}) {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [isMasked, setIsMasked] = useState(isMaskedDefault);
  const [includeAudit, setIncludeAudit] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const EXPORT_FORMATS = [
    {
      id: 'excel',
      name: 'Microsoft Excel (.xlsx)',
      category: 'Genel & Formüllü',
      badge: 'En Popüler',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-400',
      description: 'Formüllü, otomatik sütun genişlikli ve detaylı mutabakat özet sayfalı Excel tablosu.',
      action: () => exportToExcel(data, { fileName: `${bankName}_Rapor`, isMasked, includeAuditSheet: includeAudit, currency })
    },
    {
      id: 'luca',
      name: 'Luca Muhasebe (CSV)',
      category: 'Türkiye Muhasebe',
      badge: 'Luca Uyumlu',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: Building2,
      iconColor: 'text-blue-400',
      description: 'Luca Muhasebe > Banka İşlemleri > Banka Aktarımı modülüyle %100 uyumlu noktalı virgül şablonu.',
      action: () => exportToLucaCSV(data, { fileName: `Luca_${bankName}`, isMasked })
    },
    {
      id: 'zirve',
      name: 'Zirve Muhasebe (.xlsx)',
      category: 'Türkiye Muhasebe',
      badge: 'Zirve Banka',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      icon: Building2,
      iconColor: 'text-indigo-400',
      description: 'Zirve Genel Muhasebe Banka Excel aktarım modülüne doğrudan yüklenebilir tablo formatı.',
      action: () => exportToZirveExcel(data, { fileName: `Zirve_${bankName}`, isMasked })
    },
    {
      id: 'logo',
      name: 'Logo Muhasebe (Go/Tiger)',
      category: 'Türkiye ERP',
      badge: 'Logo ERP',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      icon: Briefcase,
      iconColor: 'text-orange-400',
      description: 'Logo Go ve Tiger için Banka Tahsilat/Ödeme Fişi uyumlu hesap planı aktarım tablosu.',
      action: () => exportToLogoExcel(data, { fileName: `Logo_${bankName}`, isMasked, currency })
    },
    {
      id: 'parasut',
      name: 'Paraşüt / Bizmu (CSV)',
      category: 'KOBİ & Ön Muhasebe',
      badge: 'Ön Muhasebe',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      icon: Layers,
      iconColor: 'text-teal-400',
      description: 'Paraşüt ve Bizmu Kasa/Banka hareketleri içe aktarma uyumlu virgül ayrılmış CSV formatı.',
      action: () => exportToParasutCSV(data, { fileName: `Parasut_${bankName}`, isMasked })
    },
    {
      id: 'qbo',
      name: 'QuickBooks & Xero (.QBO / .OFX)',
      category: 'Global FinTech',
      badge: 'Bank Feed',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: Globe,
      iconColor: 'text-purple-400',
      description: 'QuickBooks Online/Desktop, Xero ve Wave için uluslararası Open Financial Exchange banka akışı.',
      action: () => exportToQBO(data, { fileName: `QuickBooks_${bankName}`, isMasked, currency })
    },
    {
      id: 'qif',
      name: 'Quicken & MS Money (.QIF)',
      category: 'Global FinTech',
      badge: 'Finansal Akış',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      icon: Globe,
      iconColor: 'text-sky-400',
      description: 'Quicken, GnuCash ve MS Money için standart finansal işlem formatı.',
      action: () => exportToQIF(data, { fileName: `Quicken_${bankName}`, isMasked })
    },
    {
      id: 'csv',
      name: 'Standart UTF-8 CSV (.csv)',
      category: 'Veri Analizi',
      badge: 'Evrensel',
      badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      icon: FileText,
      iconColor: 'text-amber-400',
      description: 'Python, R, PowerBI ve tüm veritabanları için UTF-8 BOM içeren noktalı virgül CSV dosyası.',
      action: () => exportToCSV(data, { fileName: `CSV_${bankName}`, isMasked })
    },
    {
      id: 'json',
      name: 'Yapılandırılmış JSON (.json)',
      category: 'Yazılım & API',
      badge: 'API Hazır',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      icon: FileCode,
      iconColor: 'text-cyan-400',
      description: 'FinTech entegrasyonları, botlar ve özel yazılımlar için temiz ayrıştırılmış JSON verisi.',
      action: () => exportToJSON(data, { fileName: `JSON_${bankName}`, isMasked })
    }
  ];

  const handleExecuteExport = () => {
    setIsExporting(true);
    const target = EXPORT_FORMATS.find(f => f.id === selectedFormat) || EXPORT_FORMATS[0];
    
    try {
      target.action();
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.7 }
      });
      setSuccessMsg(`${target.name} başarıyla indirildi!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Dışa aktarılırken bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-slate-200'
      }`}>
        
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {lang === 'tr' ? 'Dışa Aktarma & Muhasebe Merkezi' : 'Universal Accounting Export Hub'}
              </h2>
              <p className="text-xs text-slate-400">
                {data.rows?.length || 0} işlem | İstediğiniz muhasebe formatını seçip tek tıkla indirin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Formats Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Export Format Selector Cards */}
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider block mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Hedef Format veya Muhasebe Programı:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EXPORT_FORMATS.map(fmt => {
                const Icon = fmt.icon;
                const isSelected = selectedFormat === fmt.id;

                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? isDark 
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]' 
                          : 'bg-emerald-50 border-emerald-500 shadow-md scale-[1.02]'
                        : isDark
                          ? 'bg-[#090e1a] border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${fmt.iconColor}`} />
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fmt.badgeColor}`}>
                            {fmt.badge}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>

                      <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {fmt.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {fmt.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>{fmt.category}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Customization Options */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Dışa Aktarma Seçenekleri
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* PII Masking Toggle */}
              <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  checked={isMasked}
                  onChange={(e) => setIsMasked(e.target.checked)}
                  className="mt-1 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 dark:text-slate-200">
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hassas Verileri Maskele (KVKK/GDPR)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    IBAN, TC Kimlik ve hesap numaralarını gizleyerek dışa aktarır.
                  </p>
                </div>
              </label>

              {/* Audit Sheet Toggle (Excel only) */}
              <label className={`flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors ${
                selectedFormat !== 'excel' ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <input
                  type="checkbox"
                  checked={includeAudit}
                  disabled={selectedFormat !== 'excel'}
                  onChange={(e) => setIncludeAudit(e.target.checked)}
                  className="mt-1 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 dark:text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mutabakat & Özet Sayfası Ekle</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Excel dosyasına başlangıç/bitiş bakiyesi doğrulama sayfasını ekler.
                  </p>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-slate-950/90 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero-Knowledge: Verileriniz sunucuya gitmeden tarayıcınızda üretilir.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                isDark ? 'border-white/10 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            >
              İptal
            </button>

            <button
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{successMsg || 'Seçili Formatı İndir'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
