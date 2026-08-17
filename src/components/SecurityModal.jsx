import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Cpu, ServerOff, Key, FileCheck, CheckCircle2 } from 'lucide-react';
import { getSecurityAuditInfo } from '../utils/security';

export default function SecurityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const audit = getSecurityAuditInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#090d16] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Banka Düzeyinde Sıfır Bilgi (Zero-Knowledge) Güvenlik Protokolü
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Finansal gizliliğiniz ödün verilemez bir haktır.
            </p>
          </div>
        </div>

        {/* 4-Pillar Security Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Pillar 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ServerOff className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">0 KB Sunucu Aktarımı</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Yüklediğiniz PDF'ler veya girdiğiniz ekstre metinleri hiçbir üçüncü taraf sunucuya gönderilmez. İşleme %100 yerel tarayıcınızın RAM belleğinde gerçekleşir.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">AES-GCM-256 Bit Şifreleme</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              İsteğe bağlı şifreleme anahtarları donanım hızlandırmalı Web Crypto API kullanılarak oluşturulur. Anahtar asla tarayıcınızdan dışarı çıkmaz.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Otomatik PII Maskeleme</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tek bir tıkla IBAN, TC Kimlik Numarası, Vergi Kimlik No (VKN) ve Kredi Kartı numaraları maskelenerek Excel çıktısına aktarılır.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Oturum Sonrası Bellek Temizliği</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sekmeyi kapattığınızda veya "Yeni Dosya" butonuna bastığınızda bellekteki tüm ekstre verileri sıfırlanır ve kalıcı iz bırakmaz.
            </p>
          </div>

        </div>

        {/* Compliance Badges List */}
        <div className="p-4 rounded-2xl bg-[#060a12] border border-emerald-500/20 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
            Resmi Gizlilik ve Mevzuat Uyumluluğu:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>KVKK Madde 12 Tam Uyum</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>GDPR Article 32 Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>ISO/IEC 27001 İlkeleri</span>
            </div>
          </div>
        </div>

        {/* Close Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-all shadow-md shadow-emerald-500/20"
          >
            Anladım & Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
