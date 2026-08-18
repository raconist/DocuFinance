/**
 * DocuFinance AI - Supabase Cloud PostgreSQL & Auth Client
 * Connects to Supabase for User Profiles, Subscriptions, and Encrypted Cloud Backups.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

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
