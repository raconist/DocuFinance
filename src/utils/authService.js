import { 
  syncUserProfileToCloud, 
  cloudFindUserByEmail, 
  cloudFetchAllUsers, 
  cloudDeleteUser, 
  isSupabaseConfigured 
} from './supabase';

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
    companyName: companyName.trim() || '',
    taxNumber: taxNumber.trim() || '',
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

/**
 * Get all real registered users from LocalDB and Supabase Cloud
 */
export function getAllUsers() {
  const localUsers = getRegisteredUsers();
  const current = getCurrentUser();
  
  if (current && !localUsers.some(u => u.email === current.email)) {
    localUsers.unshift(current);
  }

  return localUsers;
}

/**
 * Async fetch of all users merged from Local Storage and Supabase Cloud
 */
export async function getAllUsersAsync() {
  const localUsers = getAllUsers();
  const cloudUsers = await cloudFetchAllUsers();

  const userMap = new Map();
  localUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));
  cloudUsers.forEach(u => {
    if (!userMap.has(u.email.toLowerCase())) {
      userMap.set(u.email.toLowerCase(), u);
    } else {
      // Merge cloud stats & tier
      const existing = userMap.get(u.email.toLowerCase());
      userMap.set(u.email.toLowerCase(), { ...existing, ...u });
    }
  });

  return Array.from(userMap.values());
}

/**
 * Admin: Update user information in local DB and Supabase Cloud
 */
export async function adminUpdateUser(updatedUser) {
  if (!updatedUser?.email) return null;
  const cleanEmail = updatedUser.email.trim().toLowerCase();
  const existingUsers = getRegisteredUsers();

  const index = existingUsers.findIndex(u => u.email === cleanEmail);
  if (index !== -1) {
    existingUsers[index] = {
      ...existingUsers[index],
      ...updatedUser,
      email: cleanEmail
    };
    localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(existingUsers));
  } else {
    existingUsers.unshift({
      id: updatedUser.id || 'usr_' + Date.now(),
      ...updatedUser,
      email: cleanEmail
    });
    localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(existingUsers));
  }

  // Update current session if matching
  const current = getCurrentUser();
  if (current && current.email === cleanEmail) {
    saveUserSession({ ...current, ...updatedUser, email: cleanEmail });
  }

  // Sync update to Supabase Cloud
  await syncUserProfileToCloud(updatedUser);

  return updatedUser;
}

/**
 * Admin: Delete a user permanently from Local DB and Supabase Cloud
 */
export async function adminDeleteUser(userEmailOrId) {
  if (!userEmailOrId) return false;
  const target = String(userEmailOrId).trim().toLowerCase();

  // 1. Delete from localStorage registered users
  const existingUsers = getRegisteredUsers();
  const filteredUsers = existingUsers.filter(u => u.email !== target && u.id !== target);
  localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(filteredUsers));

  // 2. If current user is deleted, log them out
  const current = getCurrentUser();
  if (current && (current.email === target || current.id === target)) {
    logoutUser();
  }

  // 3. Delete from Supabase Cloud
  await cloudDeleteUser(target);

  return true;
}

export function saveAllUsers(users) {
  try {
    localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(users));
  } catch (e) {}
}
