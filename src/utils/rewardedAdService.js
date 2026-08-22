/**
 * DocuFinance AI - Rewarded Video & 2X Limit Booster Service
 * Allows Free users to watch a 10-second sponsor ad/video to double their limits
 * and unlock Pro features (AI CFO, 100+ rows, Auto Categorize) for 24 hours.
 * Enforces a strict limit of 3 video watches per day per client/device.
 */

const REWARDED_STORAGE_KEY = 'docufinance_rewarded_bonus_v1';
const DAILY_WATCH_STORAGE_KEY = 'docufinance_daily_watches_v1';
export const MAX_DAILY_WATCHES = 3;

/**
 * Get today's watch statistics (resets automatically each calendar day)
 */
export function getDailyWatchStats() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { used: 0, remaining: MAX_DAILY_WATCHES, max: MAX_DAILY_WATCHES, canWatch: true };
  }

  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    const raw = localStorage.getItem(DAILY_WATCH_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === todayStr) {
        const used = data.count || 0;
        const remaining = Math.max(0, MAX_DAILY_WATCHES - used);
        return {
          used,
          remaining,
          max: MAX_DAILY_WATCHES,
          canWatch: remaining > 0
        };
      }
    }
  } catch (e) {
    console.error('Watch stats load error:', e);
  }

  return { used: 0, remaining: MAX_DAILY_WATCHES, max: MAX_DAILY_WATCHES, canWatch: true };
}

/**
 * Record a completed ad watch and decrement remaining daily allowance
 */
export function recordAdWatch() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const todayStr = new Date().toISOString().slice(0, 10);
  const current = getDailyWatchStats();
  const nextCount = current.used + 1;

  try {
    localStorage.setItem(DAILY_WATCH_STORAGE_KEY, JSON.stringify({
      date: todayStr,
      count: nextCount
    }));
  } catch (e) {
    console.error('Failed to save daily watch:', e);
  }
}

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

export function grantRewardedBonus(minutes = 10) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  recordAdWatch(); // Increment daily watch counter
  const bonus = {
    active: true,
    multiplier: 2,
    unlockedAt: Date.now(),
    expiresAt: Date.now() + minutes * 60 * 1000,
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
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}dk ${seconds}sn`;
  }
  return `${seconds}sn`;
}
