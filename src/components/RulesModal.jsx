import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Search, 
  Tag,
  Hash,
  ArrowRight
} from 'lucide-react';
import { 
  getStoredRules, 
  saveStoredRules, 
  resetRulesToDefault, 
  DEFAULT_RULES 
} from '../utils/rulesEngine';

export default function RulesModal({ 
  isOpen, 
  onClose, 
  onApplyRules, 
  theme = 'dark',
  lang = 'tr' 
}) {
  const [rules, setRules] = useState(() => getStoredRules());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // New Rule Form State
  const [newKeywords, setNewKeywords] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAccountCode, setNewAccountCode] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSaveNewRule = (e) => {
    e.preventDefault();
    if (!newKeywords.trim() || !newCategory.trim() || !newAccountCode.trim()) {
      alert('Lütfen anahtar kelime, kategori ve hesap kodunu doldurun.');
      return;
    }

    const keywordList = newKeywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    const newRuleObj = {
      id: 'rule_custom_' + Date.now(),
      keywords: keywordList,
      category: newCategory.trim(),
      accountCode: newAccountCode.trim(),
      accountName: newAccountName.trim() || newCategory.trim(),
      color: '#10b981'
    };

    const updated = [newRuleObj, ...rules];
    setRules(updated);
    saveStoredRules(updated);

    // Reset Form
    setNewKeywords('');
    setNewCategory('');
    setNewAccountCode('');
    setNewAccountName('');
    setIsAddingNew(false);

    setSuccessToast('Yeni muhasebe kuralı başarıyla kaydedildi!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteRule = (ruleId) => {
    const updated = rules.filter(r => r.id !== ruleId);
    setRules(updated);
    saveStoredRules(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Tüm kuralları varsayılan Tekdüzen Hesap Planı (TDHP) ayarlarına sıfırlamak istiyor musunuz?')) {
      const defs = resetRulesToDefault();
      setRules(defs);
      setSuccessToast('Kurallar varsayılana sıfırlandı.');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleApplyToLedger = () => {
    onApplyRules(rules);
    setSuccessToast('Kurallar mevcut tabloya başarıyla uygulandı!');
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  const filteredRules = rules.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.category.toLowerCase().includes(q) ||
      r.accountCode.toLowerCase().includes(q) ||
      r.keywords.some(k => k.toLowerCase().includes(q))
    );
  });

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {lang === 'tr' ? 'Akıllı Muhasebe Kodu & Kategori Motoru' : 'Smart Accounting Rules Engine'}
              </h2>
              <p className="text-xs text-slate-400">
                Açıklamadaki anahtar kelimelere göre Tekdüzen Hesap Kodu (TDHP) ve kategori atar.
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

        {/* Success Alert */}
        {successToast && (
          <div className="px-6 py-3 bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Subheader / Controls */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-[#090e1a] border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kural, kelime veya hesap kodu ara (örn: 770, Shell)..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-slate-900 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                isDark ? 'border-white/10 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Varsayılan TDHP kurallarına dön"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>

            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isAddingNew ? 'Formu Kapat' : 'Yeni Kural Ekle'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Add New Rule Form */}
          {isAddingNew && (
            <form onSubmit={handleSaveNewRule} className={`p-5 rounded-2xl border space-y-4 animate-fadeIn ${
              isDark ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
            }`}>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Yeni Otomatik Eşleştirme Kuralı Tanımla</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Hesap Kodu (TDHP / Muhasebe):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 770.09"
                    value={newAccountCode}
                    onChange={(e) => setNewAccountCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Kategori / Hesap Adı:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Reklam & Pazarlama Giderleri"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Tetikleyici Anahtar Kelimeler (Virgülle ayırın):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: facebook ads, google ads, instagram, meta, reklam, tiktok"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md"
                >
                  Kuralı Kaydet & Aktif Et
                </button>
              </div>
            </form>
          )}

          {/* Rules List Table */}
          <div className="space-y-2">
            {filteredRules.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Aramanıza uygun bir kural bulunamadı.
              </div>
            ) : (
              filteredRules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isDark ? 'bg-[#090e1a] border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {rule.accountCode}
                      </span>
                      <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {rule.category}
                      </h4>
                      {rule.accountName && rule.accountName !== rule.category && (
                        <span className="text-[11px] text-slate-400 hidden md:inline">
                          ({rule.accountName})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Kelimeler:</span>
                      {rule.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className={`text-[11px] px-2 py-0.5 rounded-lg border font-mono ${
                            isDark ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors"
                      title="Bu kuralı sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-slate-950/90 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Toplam <strong>{rules.length}</strong> aktif kural tanımlı</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                isDark ? 'border-white/10 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Kapat
            </button>

            <button
              onClick={handleApplyToLedger}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Kuralları Tabloya Uygula</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
