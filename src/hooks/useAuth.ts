import { useState, useEffect, useCallback, useMemo } from 'react';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { supabase } from '@/lib/supabaseClient';
import { STREAK_CONFIG } from '@/config/gameConfig';

export interface GameStats {
  mining_stats: {
    checkpointsPassed: number;
    totalMined: number;
  };
  hdc_balance: number;
}

export interface AuthUser {
  id: number;
  telegram_id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photoUrl?: string;
  last_active: string;
  telegram?: {
    photo_url?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  game_stats?: GameStats;
  login_streak: number;
  last_login_date: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const telegramData = useSignal(initData.state);

  const updateStreak = useCallback(async () => {
    if (!user?.telegram_id) return;

    const today = new Date().toISOString().split('T')[0];
    const lastLogin = user.last_login_date;
    
    try {
      let newStreak = user.login_streak || 0;
      
      if (!lastLogin) {
        // First login ever
        newStreak = 1;
      } else {
        const lastLoginDate = new Date(lastLogin);
        const daysSinceLastLogin = Math.floor(
          (new Date().getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastLogin === 1) {
          // Consecutive day login
          newStreak += 1;
        } else if (daysSinceLastLogin > STREAK_CONFIG.RESET_DAYS) {
          // Reset streak if too many days passed
          newStreak = 1;
        } else if (daysSinceLastLogin === 0) {
          // Already logged in today, keep current streak
          return;
        } else {
          // Missed a day, reset streak
          newStreak = 1;
        }
      }

      // Update streak in database
      const updatedUser = await supabase
        .from('users')
        .update({
          login_streak: newStreak,
          last_login_date: today,
          last_active: new Date().toISOString()
        })
        .eq('telegram_id', user.telegram_id)
        .select()
        .single();

      if (updatedUser.data) {
        setUser(updatedUser.data as AuthUser);
      }

    } catch (error) {
      console.error('Failed to update login streak:', error);
    }
  }, [user]);

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
      let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      // If user exists, update streak and use that
      if (existingUser) {
        setUser(existingUser);
        // Update streak after setting user
        await updateStreak();
        setIsLoading(false);
        return;
      }

      // Create new user with initial streak of 1
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          telegram_id: telegramId,
          username: telegramUser.username || `user_${telegramId}`,
          first_name: telegramUser.firstName || null,
          last_name: telegramUser.lastName || null,
          language_code: telegramUser.languageCode || null,
          last_active: new Date().toISOString(),
          photoUrl: telegramUser.photoUrl,
          login_streak: 1,
          last_login_date: new Date().toISOString().split('T')[0]
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
  }, [telegramData, updateStreak]);

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

  const updateGameStats = useCallback(async (stats: Partial<GameStats>) => {
    if (!user?.telegram_id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ game_stats: stats })
        .eq('telegram_id', user.telegram_id);
      if (error) throw error;
    } catch (error) {
      console.error('Game stats update failed:', error);
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
    updateGameStats,
    logout,
    telegramUser: telegramData?.user,
    loginStreak: user?.login_streak || 0
  }), [
    user,
    isLoading,
    error,
    updateUserData,
    updateGameStats,
    logout,
    telegramData
  ]);
};

export default useAuth;