import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase initialization
const supabaseUrl = "https://ndbxwfytprpxdzoczash.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kYnh3Znl0cHJweGR6b2N6YXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyODEyMDMsImV4cCI6MjA1NDg1NzIwM30.ckQGfH1pnSMhCIBfLxzXQ9XVs16NzB2S0E2kTmewEY0";
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);      

// Database Types
export interface User {
  id: number;
  telegram_id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photoUrl?: string;
  last_active: string;
  created_at: string;
  login_streak: number;
  last_login_date: string;
}

export interface Referral {
  id: number;
  referrer_id: string;  // telegram_id of referrer
  referred_id: string;  // telegram_id of referred user
  level: number;        // 1, 2, or 3
  created_at: string;
  active: boolean;      // track if referred user is active
}

// Add interface for user data
interface ReferralWithUser {
  level: number;
  referred_id: string;
  users: {
    username: string;
    last_active: string;
  };
}

// Database helper functions
export const getUserByTelegramId = async (telegramId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data;
};

export const createUser = async (userData: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      last_active: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  return data;
};

export const updateUser = async (telegramId: string, userData: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...userData,
      last_active: new Date().toISOString()
    })
    .eq('telegram_id', telegramId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }
  return data;
};

export const createReferral = async (referralData: Partial<Referral>): Promise<Referral | null> => {
  const { data, error } = await supabase
    .from('referrals')
    .insert([{
      ...referralData,
      created_at: new Date().toISOString(),
      active: true
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating referral:', error);
    return null;
  }
  return data;
};

export const getReferralStats = async (telegramId: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('level, active')
    .eq('referrer_id', telegramId);

  if (error) {
    console.error('Error fetching referral stats:', error);
    return null;
  }

  return {
    level1: data.filter(r => r.level === 1 && r.active).length,
    level2: data.filter(r => r.level === 2 && r.active).length,
    level3: data.filter(r => r.level === 3 && r.active).length,
    totalActive: data.filter(r => r.active).length,
    directActive: data.filter(r => r.level === 1 && r.active).length
  };
};

export const updateLoginStreak = async (
  telegramId: string, 
  streak: number, 
  lastLoginDate: string
): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      login_streak: streak,
      last_login_date: lastLoginDate,
      last_active: new Date().toISOString()
    })
    .eq('telegram_id', telegramId)
    .select()
    .single();

  if (error) {
    console.error('Error updating login streak:', error);
    return null;
  }
  return data;
};

// Add new RPC functions for referrals
export const createReferralChain = async (referrerId: string, referredId: string) => {
  const { data, error } = await supabase.rpc('create_referral_chain', {
    p_referrer_id: referrerId,
    p_referred_id: referredId
  });

  if (error) {
    console.error('Error creating referral chain:', error);
    return null;
  }
  return data;
};

export const getReferralCounts = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_referral_counts', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error getting referral counts:', error);
    return null;
  }
  return data;
};

// Update the query return type
export const getReferralTree = async (userId: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      level,
      referred_id,
      users!referred_id (
        username,
        last_active
      )
    `)
    .eq('referrer_id', userId)
    .eq('active', true) as { data: ReferralWithUser[] | null, error: any };

  if (error) {
    console.error('Error fetching referral tree:', error);
    return null;
  }

  return {
    level1: (data || []).filter(r => r.level === 1).map(r => ({
      id: r.referred_id,
      username: r.users.username
    })),
    level2: (data || []).filter(r => r.level === 2).map(r => ({
      id: r.referred_id,
      username: r.users.username
    })),
    level3: (data || []).filter(r => r.level === 3).map(r => ({
      id: r.referred_id,
      username: r.users.username
    }))
  };
};
