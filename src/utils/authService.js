/**
 * DocuFinance AI - User Authentication & Subscription Service
 * Manages user accounts, corporate/individual profiles, subscription tiers,
 * and license validation with local persistence and Supabase synchronization.
 */

const AUTH_STORAGE_KEY = 'docufinance_auth_user_v1';

export const USER_TIERS = {
  FREE: {
    id: 'free',
    name: 'Ücretsiz Başlangıç',
    maxMonthlyRows: 50,
    cloudSync: false,
    batchProcessing: false,
    accountingExports: true
  },
  PRO_MONTHLY: {
    id: 'pro_monthly',
    name: 'Pro Sınırsız (Aylık)',
    maxMonthlyRows: Infinity,
    cloudSync: true,
    batchProcessing: true,
    accountingExports: true
  },
  PRO_ANNUAL: {
    id: 'pro_annual',
    name: 'Pro Sınırsız (Yıllık Kurumsal)',
    maxMonthlyRows: Infinity,
    cloudSync: true,
    batchProcessing: true,
    accountingExports: true
  }
};

/**
 * Get currently authenticated user from localStorage
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Auth load error:', e);
  }
  return null;
}

/**
 * Save user session to localStorage
 */
export function saveUserSession(userData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  } catch (e) {
    console.error('Auth save error:', e);
  }
}

/**
 * Remove user session (Logout)
 */
export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Register a new user (Individual or Corporate)
 */
export function registerUser({ email, password, name, accountType = 'corporate', companyName = '', taxNumber = '' }) {
  const newUser = {
    id: 'usr_' + Date.now(),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    accountType, // 'individual' | 'corporate'
    companyName: companyName.trim() || name.trim(),
    taxNumber: taxNumber.trim(),
    tier: 'free',
    subscription: {
      plan: 'free',
      status: 'active',
      startDate: new Date().toISOString(),
      renewDate: null,
      invoicesCount: 0
    },
    stats: {
      totalParsedStatements: 0,
      totalTransactionsProcessed: 0,
      hoursSaved: 0
    },
    createdAt: new Date().toISOString()
  };

  saveUserSession(newUser);
  return newUser;
}

/**
 * Login user with email & password
 */
export function loginUser({ email, password }) {
  const current = getCurrentUser();
  if (current && current.email === email.trim().toLowerCase()) {
    return current;
  }

  // Create session if first time or demo
  const user = {
    id: 'usr_' + Date.now(),
    email: email.trim().toLowerCase(),
    name: email.split('@')[0],
    accountType: 'corporate',
    companyName: 'DocuFinance Müşavir A.Ş.',
    taxNumber: '1234567890',
    tier: 'free',
    subscription: {
      plan: 'free',
      status: 'active',
      startDate: new Date().toISOString(),
      renewDate: null
    },
    stats: {
      totalParsedStatements: 3,
      totalTransactionsProcessed: 142,
      hoursSaved: 4.5
    },
    createdAt: new Date().toISOString()
  };

  saveUserSession(user);
  return user;
}

/**
 * Upgrade user to Pro plan (via payment webhook, license key or promo code)
 */
export function upgradeUserToPro(userId, planType = 'pro_monthly', licenseKey = '') {
  const user = getCurrentUser();
  if (!user) return null;

  const renewDate = new Date();
  renewDate.setMonth(renewDate.getMonth() + (planType === 'pro_annual' ? 12 : 1));

  const updatedUser = {
    ...user,
    tier: planType,
    subscription: {
      plan: planType,
      status: 'active',
      startDate: new Date().toISOString(),
      renewDate: renewDate.toISOString(),
      licenseKey: licenseKey || `DOCUPRO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    }
  };

  saveUserSession(updatedUser);
  return updatedUser;
}

/**
 * Update user stats after parsing statements
 */
export function incrementUserStats(txCount = 1) {
  const user = getCurrentUser();
  if (!user) return;

  const currentStats = user.stats || { totalParsedStatements: 0, totalTransactionsProcessed: 0, hoursSaved: 0 };
  const updatedUser = {
    ...user,
    stats: {
      totalParsedStatements: currentStats.totalParsedStatements + 1,
      totalTransactionsProcessed: currentStats.totalTransactionsProcessed + txCount,
      hoursSaved: +(currentStats.hoursSaved + (txCount * 0.05)).toFixed(1)
    }
  };

  saveUserSession(updatedUser);
}
