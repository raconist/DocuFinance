/**
 * DocuFinance AI - Rewarded Video & 2X Limit Booster Service
 * Allows Free users to watch a 10-second sponsor ad/video to double their limits
 * and unlock Pro features (AI CFO, 100+ rows, Auto Categorize) for 24 hours.
 */

const REWARDED_STORAGE_KEY = 'docufinance_rewarded_bonus_v1';

export function getRewardedBonus() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(REWARDED_STORAGE_KEY);
    if (!raw) return null;
    const bonus = JSON.parse(raw);
    if (Date.now() > bonus.expiresAt) {
      localStorage.removeItem(REWARDED_STORAGE_KEY);
      return null;
    }
    return bonus;
  } catch (e) {
    return null;
  }
}

export function isRewardedBonusActive() {
  const bonus = getRewardedBonus();
  return bonus !== null && bonus.active === true;
}

export function grantRewardedBonus(hours = 24) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const bonus = {
    active: true,
    multiplier: 2,
    unlockedAt: Date.now(),
    expiresAt: Date.now() + hours * 60 * 60 * 1000,
    features: ['ai_cfo', 'double_rows', 'auto_categorize', 'batch_5']
  };
  try {
    localStorage.setItem(REWARDED_STORAGE_KEY, JSON.stringify(bonus));
  } catch (e) {
    console.error('Failed to save bonus:', e);
  }
  return bonus;
}

export function getRemainingBonusTime() {
  const bonus = getRewardedBonus();
  if (!bonus) return null;
  const diffMs = bonus.expiresAt - Date.now();
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}s ${minutes}d`;
}
