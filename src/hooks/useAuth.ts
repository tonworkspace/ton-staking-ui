import { useState, useEffect, useCallback, useMemo } from 'react';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { supabase } from '@/lib/supabaseClient';

export interface AuthUser {
  id: number;
  telegram_id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photoUrl?: string;
  last_active: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const telegramData = useSignal(initData.state);

  const initializeAuth = useCallback(async () => {
    if (!telegramData?.user) {
      setError('Please open this app in Telegram');
      setIsLoading(false);
      return;
    }

    try {
      const telegramUser = telegramData.user;
      const telegramId = String(telegramUser.id);

      // First try to get existing user
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      // If user exists, just use that
      if (existingUser) {
        setUser(existingUser);
        setIsLoading(false);
        return;
      }

      // Only create new user if one doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          telegram_id: telegramId,
          username: telegramUser.username || `user_${telegramId}`,
          first_name: telegramUser.firstName || null,
          last_name: telegramUser.lastName || null,
          language_code: telegramUser.languageCode || null,
          last_active: new Date().toISOString(),
          photoUrl: telegramUser.photoUrl
        }])
        .select()
        .single();

      if (createError) throw createError;
      setUser(newUser);

    } catch (err) {
      console.error('Authentication failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [telegramData]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up real-time subscription for user updates
  useEffect(() => {
    if (!user?.telegram_id) return;

    const subscription = supabase
      .channel(`public:users:telegram_id=eq.${user.telegram_id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users',
        filter: `telegram_id=eq.${user.telegram_id}`
      }, (payload) => {
        if (payload.new) {
          setUser(payload.new as AuthUser);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.telegram_id]);

  const updateUserData = useCallback(async (updatedData: Partial<AuthUser>) => {
    if (!user?.telegram_id) return;

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...updatedData,
          last_active: new Date().toISOString()
        })
        .eq('telegram_id', user.telegram_id)
        .select()
        .single();

      if (error) throw error;
      if (updatedUser) setUser(updatedUser);

    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }, [user?.telegram_id]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    error,
    updateUserData,
    logout,
    telegramUser: telegramData?.user
  }), [
    user,
    isLoading,
    error,
    updateUserData,
    logout,
    telegramData
  ]);
};

export default useAuth;