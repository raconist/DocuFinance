import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, ShieldCheck, PhoneCall, Mail, ChevronRight, Check } from 'lucide-react';
import { getPaymentSettings } from '../utils/paymentConfig';

export default function SupportWidget({ theme = 'dark', lang = 'tr' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('corporate');
  const [customNote, setCustomNote] = useState('');

  const isDark = theme === 'dark';

  const topics = {
    tr: [
      { id: 'corporate', label: '🏢 Kurumsal / Çoklu Lisans Teklifi', msg: 'Merhaba, DocuFinance AI kurumsal çoklu lisans fiyatı ve şirket faturası hakkında bilgi almak istiyorum.' },
      { id: 'luca', label: '📊 Luca / Zirve / Logo Muhasebe Entegrasyonu', msg: 'Merhaba, Luca ve Zirve muhasebe programına ekstre aktarımı konusunda destek rica ediyorum.' },
      { id: 'custom_bank', label: '🏦 Özel Banka Ekstresi Formatı Ekleme', msg: 'Merhaba, sisteminizde olmayan özel bir banka ekstresi formatını ekletmek istiyorum.' },
      { id: 'payment', label: '💳 Fatura & Havale/EFT Ödeme Bildirimi', msg: 'Merhaba, havale/EFT ile ödeme yaptım ve Pro lisansımı aktive ettirmek istiyorum.' }
    ],
    en: [
      { id: 'corporate', label: '🏢 Enterprise & Multi-seat License', msg: 'Hello, I would like to get a quote for DocuFinance AI Enterprise team license and VAT invoice.' },
      { id: 'quickbooks', label: '📊 QuickBooks / Xero Integration Support', msg: 'Hello, I need help mapping bank statements to QuickBooks / Xero formats.' },
      { id: 'custom_bank', label: '🏦 Custom Bank Statement Template', msg: 'Hello, I would like to request support for a custom bank statement format.' },
      { id: 'payment', label: '💳 Payment & License Activation', msg: 'Hello, I have completed payment and would like to verify my license.' }
    ]
  };

  const currentTopics = topics[lang] || topics.tr;

  const handleStartWhatsApp = (e) => {
    e.preventDefault();
    const topicObj = currentTopics.find(t => t.id === selectedTopic) || currentTopics[0];
    const fullMessage = customNote.trim() 
      ? `${topicObj.msg}\n\nDetay / Not: ${customNote.trim()}`
      : topicObj.msg;

    const encoded = encodeURIComponent(fullMessage);
    // WhatsApp direct action (+90 541 891 2453)
    const phone = '905418912453';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    const topicObj = currentTopics.find(t => t.id === selectedTopic) || currentTopics[0];
    const subject = encodeURIComponent(`DocuFinance Destek: ${topicObj.label}`);
    const body = encodeURIComponent(
      `${topicObj.msg}\n\nDetay / Not: ${customNote.trim()}\n\n---\nGönderildiği Yer: DocuFinance Web Platformu`
    );
    window.location.href = `mailto:recep.adnc@gmail.com?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-2xl shadow-emerald-500/30 transition-all transform hover:scale-105"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
          </span>
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span className="hidden sm:inline">
            {lang === 'tr' ? 'Canlı Destek & WhatsApp' : 'Live Support & Help'}
          </span>
        </button>
      )}

      {/* Popover Support Modal */}
      {isOpen && (
        <div className={`relative w-[90vw] max-w-sm rounded-3xl border shadow-2xl overflow-hidden animate-fadeIn ${
          isDark ? 'bg-slate-900 border-emerald-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs">DocuFinance FinTek Destek</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>{lang === 'tr' ? 'Mali Müşavir Destek Hattı Aktif' : 'Support Specialist Online'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleStartWhatsApp} className="p-4 space-y-3.5 text-xs">
            <label className="block text-slate-400 font-bold text-[11px]">
              {lang === 'tr' ? 'Size nasıl yardımcı olabiliriz?' : 'How can we help you today?'}
            </label>

            <div className="space-y-1.5">
              {currentTopics.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTopic(t.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedTopic === t.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                      : isDark 
                        ? 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-white/5' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2 text-[11px]">{t.label}</span>
                  {selectedTopic === t.id && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-slate-400 font-bold text-[11px] mb-1">
                {lang === 'tr' ? 'Ekstra Not veya Soru (İsteğe Bağlı):' : 'Additional Note (Optional):'}
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={lang === 'tr' ? 'Örn: 5 kişilik muhasebe ofisimiz için...' : 'e.g. For our 5-seat accounting firm...'}
                className={`w-full px-3 py-2 rounded-xl border text-xs resize-none focus:outline-none focus:border-emerald-500 ${
                  isDark ? 'bg-slate-950 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                <span>{lang === 'tr' ? 'WhatsApp ile Hemen İletişime Geç' : 'Chat on WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'tr' ? 'E-Posta / Destek Talebi Gönder' : 'Send Email Ticket'}</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>7/24 Teknik & Mali Müşavir Destek Hattı</span>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
