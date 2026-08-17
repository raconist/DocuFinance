/**
 * Supabase Cloud PostgreSQL & Auth Client
 * Connects to Supabase for User Auth, Pro Subscriptions, and Encrypted Cloud Backups
 *
 * SUPABASE SQL SETUP SCRIPT (Run this in Supabase SQL Editor):
 * -----------------------------------------------------------
 * create table if not exists public.statements (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users(id) on delete cascade,
 *   file_name text not null,
 *   bank_name text not null,
 *   currency text default 'TRY',
 *   transaction_count integer default 0,
 *   total_credit numeric(15,2) default 0,
 *   total_debit numeric(15,2) default 0,
 *   net_flow numeric(15,2) default 0,
 *   encrypted_payload text, -- AES-256 encrypted json
 *   is_reconciled boolean default true,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 *
 * alter table public.statements enable row level security;
 *
 * create policy "Users can only see their own statements"
 *   on public.statements for all
 *   using (auth.uid() = user_id);
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Cloud Sync helper for Pro users
export async function syncStatementToCloud(statementData, userId, encryptedPayload = null) {
  if (!isSupabaseConfigured) {
    console.log('Supabase env variables not configured yet. Saving to Local IndexedDB.');
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
        file_name: statementData.meta?.fileName || 'Ekstre',
        bank_name: statementData.meta?.bankName || 'Genel',
        currency: statementData.meta?.currency || 'TRY',
        transaction_count: statementData.rows?.length || 0,
        total_credit: statementData.meta?.totalCredit || 0,
        total_debit: statementData.meta?.totalDebit || 0,
        net_flow: statementData.meta?.netFlow || 0,
        encrypted_payload: encryptedPayload,
        is_reconciled: statementData.meta?.isReconciled ?? true
      })
    });

    const data = await res.json();
    return { success: true, data: data, mode: 'cloud' };
  } catch (err) {
    console.error('Supabase sync error:', err);
    return { success: false, error: err.message, mode: 'local' };
  }
}
