/**
 * DocuFinance AI - User Authentication & Subscription Service
 * Manages user accounts, corporate/individual profiles, subscription tiers,
 * and license validation with local persistence and Supabase synchronization.
 */

import { syncUserProfileToCloud, cloudFindUserByEmail, isSupabaseConfigured } from './supabase';

const AUTH_STORAGE_KEY = 'docufinance_auth_user_v1';
const AUTH_USERS_DB_KEY = 'docufinance_registered_users_db_v1';

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
 * Helper to get all registered accounts
 */
export function getRegisteredUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUTH_USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Register a new user (Individual or Corporate)
 */
export function registerUser({ email, password, name, accountType = 'corporate', companyName = '', taxNumber = '' }) {
  const cleanEmail = email.trim().toLowerCase();
  const existingUsers = getRegisteredUsers();

  const found = existingUsers.find(u => u.email === cleanEmail);
  if (found) {
    throw new Error('Bu e-posta adresiyle zaten kayıtlı bir hesap mevcut. Lütfen Giriş Yap sekmesinden giriş yapınız.');
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    email: cleanEmail,
    password: password.trim(),
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

  existingUsers.push(newUser);
  localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(existingUsers));
  saveUserSession(newUser);

  // Background sync to Supabase
  syncUserProfileToCloud(newUser).catch(() => {});

  return newUser;
}

/**
 * Login user with email & password (strictly requires prior registration in LocalDB or Supabase Cloud)
 */
export async function loginUserAsync({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const existingUsers = getRegisteredUsers();

  let found = existingUsers.find(u => u.email === cleanEmail);

  // If not found in local browser storage, check Supabase Cloud Database
  if (!found && isSupabaseConfigured) {
    try {
      const cloudProfile = await cloudFindUserByEmail(cleanEmail);
      if (cloudProfile) {
        found = {
          id: cloudProfile.id || 'usr_' + Date.now(),
          email: cloudProfile.email,
          password: password.trim(), // cache password for local verification
          name: cloudProfile.name || cloudProfile.email.split('@')[0],
          accountType: cloudProfile.account_type || 'individual',
          companyName: cloudProfile.company_name || '',
          taxNumber: cloudProfile.tax_number || '',
          tier: cloudProfile.tier || 'free',
          subscription: {
            plan: cloudProfile.tier || 'free',
            status: 'active',
            licenseKey: cloudProfile.license_key || ''
          },
          stats: {
            totalParsedStatements: cloudProfile.statements_parsed_count || 0,
            totalTransactionsProcessed: cloudProfile.rows_processed_count || 0,
            hoursSaved: cloudProfile.hours_saved || 0
          }
        };
        existingUsers.push(found);
        localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(existingUsers));
      }
    } catch (e) {
      console.warn('Cloud login check fallback:', e);
    }
  }

  // ⛔ STRICT REJECTION: User MUST be registered
  if (!found) {
    throw new Error('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı. Lütfen önce "Kayıt Ol" sekmesinden ücretsiz hesabınızı oluşturun.');
  }

  // ⛔ STRICT PASSWORD CHECK
  if (password && found.password && found.password !== password.trim()) {
    throw new Error('Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyiniz.');
  }

  saveUserSession(found);

  // Background sync to Supabase
  syncUserProfileToCloud(found).catch(() => {});

  return found;
}

export function loginUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const existingUsers = getRegisteredUsers();

  const found = existingUsers.find(u => u.email === cleanEmail);
  if (!found) {
    throw new Error('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı. Lütfen önce "Kayıt Ol" sekmesinden ücretsiz hesabınızı oluşturun.');
  }

  if (password && found.password && found.password !== password.trim()) {
    throw new Error('Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyiniz.');
  }

  saveUserSession(found);
  return found;
}

/**
 * Reset password for an existing account
 */
export function resetUserPassword({ email, newPassword }) {
  const cleanEmail = email.trim().toLowerCase();
  const existingUsers = getRegisteredUsers();

  const userIndex = existingUsers.findIndex(u => u.email === cleanEmail);
  if (userIndex === -1) {
    throw new Error('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.');
  }

  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('Yeni şifreniz en az 4 karakterden oluşmalıdır.');
  }

  existingUsers[userIndex].password = newPassword.trim();
  localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(existingUsers));
  
  saveUserSession(existingUsers[userIndex]);

  // Background sync to Supabase
  syncUserProfileToCloud(existingUsers[userIndex]).catch(() => {});

  return existingUsers[userIndex];
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
 * Update user account with rewarded ad bonus
 */
export function updateUserBonus(bonusData) {
  const current = getCurrentUser();
  if (current) {
    current.rewardedBonus = bonusData;
    saveUserSession(current);
    return current;
  }
  return null;
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

const ALL_USERS_KEY = 'docufinance_all_registered_users_v1';

export function getAllUsers() {
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {}

  const current = getCurrentUser();
  const defaultList = [
    {
      id: 'usr_corp_1',
      name: 'Mali Müşavir Can Erdem',
      email: 'muhasebe@erdem-musavirlik.com',
      accountType: 'corporate',
      companyName: 'Erdem & Ortakları Mali Müşavirlik A.Ş.',
      taxNumber: '4892019482',
      tier: 'pro_annual',
      licenseKey: 'DOCUPRO-CANERDEM2026',
      createdAt: '2026-08-01T10:00:00.000Z'
    },
    {
      id: 'usr_corp_2',
      name: 'CPA John Reynolds',
      email: 'cpa@reynolds-advisory.com',
      accountType: 'corporate',
      companyName: 'Reynolds & Partners Financial Advisory LLC',
      taxNumber: 'US-89201948',
      tier: 'pro_monthly',
      licenseKey: 'DOCUPRO-REYNOLDS99',
      createdAt: '2026-08-05T14:30:00.000Z'
    },
    {
      id: 'usr_ind_1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@bireysel.com',
      accountType: 'individual',
      companyName: '',
      taxNumber: '',
      tier: 'free',
      licenseKey: null,
      createdAt: '2026-08-10T09:15:00.000Z'
    }
  ];

  if (current && !defaultList.some(u => u.id === current.id || u.email === current.email)) {
    defaultList.unshift(current);
  }

  return defaultList;
}

export function saveAllUsers(users) {
  try {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}
