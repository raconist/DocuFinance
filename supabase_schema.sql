-- =====================================================================
-- DocuFinance AI - Production PostgreSQL Database Schema (Supabase)
-- High-Performance Multi-Tenant Financial Statement & Accounting Database
-- =====================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. User & Corporate Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  account_type text default 'corporate' check (account_type in ('corporate', 'individual')),
  company_name text,
  tax_number text,
  tier text default 'free' check (tier in ('free', 'pro_monthly', 'pro_annual', 'enterprise')),
  license_key text,
  monthly_statement_quota integer default 5,
  statements_parsed_count integer default 0,
  rows_processed_count integer default 0,
  hours_saved numeric(10, 1) default 0.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Financial Statements & Ledger History Table
create table if not exists public.statements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  file_name text not null,
  bank_name text not null,
  currency text default 'TRY',
  transaction_count integer default 0,
  starting_balance numeric(15, 2) default 0.00,
  ending_balance numeric(15, 2) default 0.00,
  total_credit numeric(15, 2) default 0.00,
  total_debit numeric(15, 2) default 0.00,
  net_flow numeric(15, 2) default 0.00,
  discrepancy numeric(15, 2) default 0.00,
  is_reconciled boolean default true,
  is_batch boolean default false,
  document_hash text,
  encrypted_payload jsonb, -- Encrypted transaction rows JSON
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Custom TDHP Accounting Rules Table
create table if not exists public.custom_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  keyword text not null,
  category text not null,
  account_code text not null,
  account_name text not null,
  is_custom boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Payment Transactions Log (PayTR, Shopier, LemonSqueezy)
create table if not exists public.payment_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  gateway text not null check (gateway in ('paytr', 'shopier', 'lemonsqueezy', 'stripe', 'bank_transfer')),
  transaction_id text,
  amount numeric(12, 2) not null,
  currency text not null default 'TRY',
  plan_tier text not null,
  status text default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded')),
  promo_code text,
  raw_webhook_payload jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.statements enable row level security;
alter table public.custom_rules enable row level security;
alter table public.payment_logs enable row level security;

-- 7. RLS Security Policies
-- Profiles: Users can only read & edit their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Statements: Users can only manage their own statements
create policy "Users can manage own statements"
  on public.statements for all
  using (auth.uid() = user_id);

-- Custom Rules: Users can only manage their own accounting rules
create policy "Users can manage own accounting rules"
  on public.custom_rules for all
  using (auth.uid() = user_id);

-- Payment Logs: Users can only view their own payment receipts
create policy "Users can view own payment logs"
  on public.payment_logs for select
  using (auth.uid() = user_id);

-- 8. Performance Indexes
create index if not exists idx_statements_user_id on public.statements(user_id);
create index if not exists idx_statements_created_at on public.statements(created_at desc);
create index if not exists idx_custom_rules_user_id on public.custom_rules(user_id);
create index if not exists idx_payment_logs_user_id on public.payment_logs(user_id);
