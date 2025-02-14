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
