/**
 * DocuFinance AI - Supabase Cloud PostgreSQL & Auth Client
 * Connects to Supabase for User Profiles, Subscriptions, and Encrypted Cloud Backups.
 */

const RAW_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_URL = RAW_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Find user by email in Supabase profiles table
 */
export async function cloudFindUserByEmail(email) {
  if (!isSupabaseConfigured || !email) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (e) {
    console.warn('Supabase find user network error:', e);
    return null;
  }
}

/**
 * Sync or upsert user profile to Supabase Cloud profiles table
 */
export async function syncUserProfileToCloud(user) {
  if (!isSupabaseConfigured || !user?.email) return { success: false, mode: 'local' };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        id: user.id || undefined,
        email: user.email.toLowerCase(),
        name: user.name || user.email.split('@')[0],
        account_type: user.accountType || 'individual',
        company_name: user.companyName || '',
        tax_number: user.taxNumber || '',
        tier: user.tier || 'free',
        license_key: user.subscription?.licenseKey || '',
        monthly_statement_quota: user.tier === 'free' ? 50 : 999999,
        statements_parsed_count: user.stats?.totalParsedStatements || 0,
        rows_processed_count: user.stats?.totalTransactionsProcessed || 0,
        hours_saved: user.stats?.hoursSaved || 0,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Supabase profile sync warning:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (e) {
    console.warn('Supabase profile sync network fallback:', e);
    return { success: false };
  }
}

/**
 * Sync parsed statement record to Supabase Cloud PostgreSQL
 */
export async function syncStatementToCloud(statementData, userId) {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, mode: 'local' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/statements`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        file_name: statementData.meta?.fileName || 'Banka_Ekstresi',
        bank_name: statementData.meta?.bankName || 'Genel',
        currency: statementData.meta?.currency || 'TRY',
        transaction_count: statementData.rows?.length || 0,
        starting_balance: statementData.meta?.startingBalance || 0,
        ending_balance: statementData.meta?.endingBalance || 0,
        total_credit: statementData.meta?.totalCredit || 0,
        total_debit: statementData.meta?.totalDebit || 0,
        net_flow: statementData.meta?.netFlow || 0,
        discrepancy: statementData.meta?.discrepancy || 0,
        is_reconciled: statementData.meta?.isReconciled ?? true,
        is_batch: Boolean(statementData.meta?.isBatch),
        document_hash: statementData.meta?.documentHash || '',
        encrypted_payload: { rows: statementData.rows || [] }
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data, mode: 'cloud' };
  } catch (err) {
    console.warn('Supabase cloud sync fallback to local IndexedDB:', err);
    return { success: false, error: err.message, mode: 'local' };
  }
}

/**
 * Fetch all statements from Supabase Cloud for a user
 */
export async function fetchStatementsFromCloud(userId) {
  if (!isSupabaseConfigured || !userId) {
    return [];
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/statements?user_id=eq.${userId}&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('Supabase fetch error:', err);
    return [];
  }
}

/**
 * Fetch all registered users from Supabase Cloud profiles table
 */
export async function cloudFetchAllUsers() {
  if (!isSupabaseConfigured) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.name,
      accountType: p.account_type,
      companyName: p.company_name,
      taxNumber: p.tax_number,
      tier: p.tier || 'free',
      subscription: {
        plan: p.tier || 'free',
        status: 'active',
        licenseKey: p.license_key || ''
      },
      stats: {
        totalParsedStatements: p.statements_parsed_count || 0,
        totalTransactionsProcessed: p.rows_processed_count || 0,
        hoursSaved: p.hours_saved || 0
      },
      createdAt: p.created_at
    }));
  } catch (e) {
    console.warn('Supabase fetch all users error:', e);
    return [];
  }
}

/**
 * Delete a user profile from Supabase Cloud
 */
export async function cloudDeleteUser(email) {
  if (!isSupabaseConfigured || !email) return { success: false };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase())}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return { success: res.ok };
  } catch (e) {
    console.warn('Supabase delete user error:', e);
    return { success: false };
  }
}
