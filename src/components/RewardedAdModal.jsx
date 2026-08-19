import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Flame,
  Clock,
  Tv,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { grantRewardedBonus } from '../utils/rewardedAdService';
import confetti from 'canvas-confetti';

export default function RewardedAdModal({ 
  isOpen, 
  onClose, 
  onRewardGranted,
  theme = 'dark',
  lang = 'tr' 
}) {
  const [countdown, setCountdown] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && isPlaying && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, countdown]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleStartWatch = () => {
    setIsPlaying(true);
    setCountdown(10);
    setIsCompleted(false);
  };

  const handleClaimReward = () => {
    const bonus = grantRewardedBonus(24);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    if (onRewardGranted) {
      onRewardGranted(bonus);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-amber-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/70 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-md">
              <Gift className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold font-display">
                  {lang === 'tr' ? '10 Saniyelik Video ile 2X Limit Kazan!' : 'Watch 10s Video & Get 2X Limits!'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  24 SAAT GEÇERLİ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'tr' ? 'Kısa sponsor videosunu izleyerek tüm ücretsiz kotalarınızı 2\'ye katlayın' : 'Double your export limit and unlock AI CFO for 24 hours'}
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

        {/* Video Ad Player & Reward Display */}
        <div className="p-6 space-y-5">
          
          {/* Ad Player Screen */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex flex-col items-center justify-center shadow-inner">
            
            {!isPlaying && !isCompleted ? (
              <div className="text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">Sponsor Videosu (10 Saniye)</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Videoyu tamamlayınca 50 satır sınırınız <strong>100 satıra</strong> çıkacak ve <strong>AI CFO</strong> 24 saat boyunca ücretsiz açılacak.
                  </p>
                </div>
                <button
                  onClick={handleStartWatch}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  ▶ Videoyu Başlat (10s)
                </button>
              </div>
            ) : isPlaying && !isCompleted ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-6 text-center space-y-4">
                
                {/* Countdown Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 backdrop-blur-sm">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Kalan: {countdown}s</span>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Tv className="w-7 h-7" />
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                    SPONSOR TANITIMI & GOOGLE ADS
                  </span>
                  <h4 className="font-extrabold text-white text-base">
                    DocuFinance AI Pro: Muhasebenizi %90 Hızlandırın
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Tüm banka ekstrelerini ve faturaları tek tıkla Excel, Luca ve Zirve'ye aktarın.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="font-extrabold text-lg text-emerald-400">Tebrikler! Ödülünüz Hazır!</h4>
                <p className="text-xs text-slate-300">
                  24 saat boyunca geçerli <strong>2X Kota ve AI CFO Modülü</strong> hesabınıza yüklendi.
                </p>
                <button
                  onClick={handleClaimReward}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  ⚡ 2X Bonusu Aktif Et
                </button>
              </div>
            )}

          </div>

          {/* Unlocked Privileges List */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>100 Satır</strong> Ekstre Aktarım Limiti</span>
            </div>
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>AI CFO & Nakit Akışı</strong> Paneli Açık</span>
            </div>
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <TrendingUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span><strong>150+ Kural ile</strong> Otomatik Muhasebeleştirme</span>
            </div>
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Tam <strong>24 Saat Kesintisiz</strong> Erişim</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
