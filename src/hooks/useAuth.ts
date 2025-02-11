import { useState, useEffect, useCallback, useMemo } from 'react';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { calculateDailyRate, supabase } from '@/lib/supabaseClientold';
import type { User } from '@/lib/supabaseClientold';
import { 
  validateAndSyncData, 
  syncEarnings, 
  referralSystem,
  processReferralBonus,
  updateUserSBT,
  getReferralStats
} from '@/lib/supabaseClientold';
import { useSnackbar } from './useSnackbar';

export interface AuthUser extends User {
  // Extended user properties
  total_earned?: number;
  login_streak: number;
  last_login_date: string;
  has_nft?: boolean;
  referrer_username?: string;
  referrer_rank?: string;
  total_sbt?: number;
  claimed_milestones?: number[];
  photoUrl?: string;
  team_volume: number;
  expected_rank_bonus?: number;
  available_earnings?: number;
  direct_referrals: number;
  referrer?: {
    username: string;
    rank: string;
  };
  current_deposit?: number;
  wallet_address?: string;
  current_stake_date?: string;
  current_stake?: number;
  total_staked?: number;
  stk_balance?: number;
  cycle_completed?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null);

  const telegramData = useSignal(initData.state);
  const { showSnackbar } = useSnackbar();

  const initializeAuth = useCallback(async () => {
    if (!telegramData?.user) {
      setError('Please open this app in Telegram');
      setIsLoading(false);
      return;
    }

    try {
      const telegramUser = telegramData.user;
      const telegramId = String(telegramUser.id);

      // First attempt to get existing user with referrer info
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select(`
          *,
          referrer:referrals!referrals_referred_id_fkey(
            users!referrals_referrer_id_fkey(
              username,
              rank
            )
          )
        `)
        .eq('telegram_id', telegramId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        throw new Error('Failed to fetch user data');
      }

      if (existingUser) {
        // Validate and sync earnings
        const validatedEarnings = await validateAndSyncData(existingUser.id);
        if (validatedEarnings !== null) {
          setCurrentEarnings(validatedEarnings);
        }

        // Get referral stats
        const referralStats = await getReferralStats(existingUser.id);
        
        // Get expected rank bonus and available earnings
        const expectedBonus = await referralSystem.calculateExpectedRankBonus(existingUser.id);
        const availableEarnings = await referralSystem.getAvailableEarnings(existingUser.id);

        // Update user with additional data
        existingUser = {
          ...existingUser,
          expected_rank_bonus: expectedBonus,
          available_earnings: availableEarnings,
          team_volume: referralStats.totalTeamVolume,
          direct_referrals: referralStats.totalReferrals
        };

        // Check and process daily login streak
        const lastLogin = new Date(existingUser.last_login_date);
        const today = new Date();
        const dayDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        let loginStreak = existingUser.login_streak || 0;
        if (dayDiff === 1) {
          // Consecutive day login
          loginStreak++;
          // Process streak rewards if applicable
          if (loginStreak % 7 === 0) {
            // Weekly streak bonus
            await updateUserSBT(existingUser.id, 5, 'stake'); // 5 SBT bonus
          }
        } else if (dayDiff > 1) {
          // Streak broken
          loginStreak = 1;
        }

        // Update user login data
        const { error: updateError } = await supabase
          .from('users')
          .update({
            last_login_date: today.toISOString(),
            login_streak: loginStreak,
            last_active: today.toISOString()
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('Failed to update login streak:', updateError);
        }

      } else {
        // Create new user
        const createOrUpdateUser = async (telegramId: string, telegramUser: any) => {
          try {
            // First try to get existing user
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('telegram_id', telegramId)
              .single();

            if (existingUser) {
              // Update existing user
              const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                  username: telegramUser.username || `user_${telegramId}`,
                  first_name: telegramUser.firstName || null,
                  last_name: telegramUser.lastName || null,
                  language_code: telegramUser.languageCode || null,
                  last_active: new Date().toISOString(),
                  photoUrl: telegramUser.photoUrl
                })
                .eq('telegram_id', telegramId)
                .select()
                .single();

              if (updateError) throw updateError;
              return updatedUser;
            }

            // Create new user if doesn't exist
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                telegram_id: telegramId,
                username: telegramUser.username || `user_${telegramId}`,
                first_name: telegramUser.firstName || null,
                last_name: telegramUser.lastName || null,
                language_code: telegramUser.languageCode || null,
                wallet_address: '',
                balance: 0,
                total_deposit: 0,
                total_withdrawn: 0,
                total_earned: 0,
                team_volume: 0,
                direct_referrals: 0,
                rank: 'AMBASSADOR',
                last_active: new Date().toISOString(),
                login_streak: 1,
                last_login_date: new Date().toISOString(),
                is_active: true,
                photoUrl: telegramUser.photoUrl
              }])
              .select()
              .single();

            if (createError) throw createError;
            return newUser;
          } catch (error) {
            console.error('Error in createOrUpdateUser:', error);
            throw error;
          }
        };

        const updatedUser = await createOrUpdateUser(telegramId, telegramUser);
        existingUser = updatedUser;

        // Process referral if user has a referrer
        const referrerUsername = new URLSearchParams(window.location.search).get('ref');
        if (referrerUsername) {
          const { data: referrer } = await supabase
            .from('users')
            .select('id')
            .eq('username', referrerUsername)
            .single();

          if (referrer) {
            await processReferralBonus(existingUser.id, referrer.id);
          }
        }
      }

      // Set user state with complete data
      setUser({
        ...existingUser,
        login_streak: existingUser.login_streak || 0,
        last_login_date: existingUser.last_login_date || new Date().toISOString()
      });

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

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.telegram_id) return;

    let isSubscribed = true;
    const subscription = supabase
      .channel(`public:users:telegram_id=eq.${user.telegram_id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users',
        filter: `telegram_id=eq.${user.telegram_id}`
      }, async (payload) => {
        if (!isSubscribed) return;
        
        if (payload.new) {
          try {
            const { data } = await supabase
              .from('users')
              .select(`
                *,
                referrer:referrals!referrals_referred_id_fkey(
                  users!referrals_referrer_id_fkey(
                    username,
                    rank
                  )
                )
              `)
              .eq('telegram_id', user.telegram_id)
              .single();

            if (data && isSubscribed) {
              setUser({
                ...data,
                referrer_username: data.referrer?.username,
                referrer_rank: data.referrer?.rank,
                login_streak: data.login_streak || 0,
                last_login_date: data.last_login_date
              });
            }
          } catch (error) {
            console.error('Error updating user data:', error);
          }
        }
      })
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(subscription);
    };
  }, [user?.telegram_id]);

  // Set up periodic sync
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(async () => {
        await syncEarnings(user.id, currentEarnings);
      }, 5 * 60 * 1000); // Sync every 5 minutes

      setSyncInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [user?.id, currentEarnings]);

  // Sync on earnings change
  useEffect(() => {
    if (user?.id && currentEarnings > 0) {
      syncEarnings(user.id, currentEarnings);
    }
  }, [user?.id, currentEarnings]);

  // Sync before user leaves
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user?.id) {
        await syncEarnings(user.id, currentEarnings);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.id, currentEarnings]);

  // Add proper type definitions
  interface UserUpdateData extends Partial<AuthUser> {
    lastUpdate?: string;
    is_active: boolean;
    cycle_completed: boolean;
    bonus_eligible: boolean;
    cycle_progress?: number;
  }

  const updateUserData = useCallback(async (updatedData: UserUpdateData) => {
    if (!user?.telegram_id) return;
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    setDebounceTimer(setTimeout(async () => {
      try {
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            ...updatedData,
            last_update: new Date().toISOString()
          })
          .eq('telegram_id', user.telegram_id)
          .select()
          .single();

        if (error) throw error;

        if (updatedUser) {
          setUser(prev => prev ? {
            ...prev,
            ...updatedUser,
            lastUpdate: new Date().toISOString()
          } : null);
        }

      } catch (error) {
        console.error('Update failed:', error);
        throw error; // Re-throw to handle in the component
      }
    }, 500));
  }, [user?.telegram_id, debounceTimer]);

  const logout = useCallback(() => {
    if (user?.id) {
      syncEarnings(user.id, currentEarnings).then(() => {
        setUser(null);
        setCurrentEarnings(0);
        if (syncInterval) clearInterval(syncInterval);
      });
    }
  }, [user?.id, currentEarnings, syncInterval]);

  // Add helper function to determine daily rate based on stake age
  const calculateDailyRate = (stakeDate: Date): number => {
    const now = new Date();
    const daysSinceStake = Math.floor((now.getTime() - stakeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceStake <= 7) return 0.01; // Week 1: 1%
    if (daysSinceStake <= 14) return 0.02; // Week 2: 2%
    if (daysSinceStake <= 21) return 0.03; // Week 3: 3%
    return 0.04; // Week 4+: 4%
  };

  // Update calculateEarnings function
  const calculateEarnings = useCallback(async () => {
    if (!user?.current_stake || !user?.current_stake_date) return;

    const now = new Date();
    const stakeDate = new Date(user.current_stake_date);
    const lastUpdate = new Date(user.last_update || stakeDate);
    
    // Check if stake has reached 300% cycle
    const totalEarned = user.total_earned || 0;
    const cycleProgress = (totalEarned / user.current_stake) * 100;
    
    if (cycleProgress >= 300) {
      // Pause earnings and notify user to reinvest
      await updateUserData({
        is_active: false,
        cycle_completed: true,
        bonus_eligible: false
      });
      
      // Show reinvestment notification
      showSnackbar({
        message: 'Cycle Completed',
        description: 'Please reinvest to continue earning',
        duration: 10000
      });
      return;
    }

    // Calculate time since last update in seconds for more precise calculations
    const timeSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 1000;
    
    // Get current rate based on stake age
    const currentRate = calculateDailyRate(stakeDate);
    
    // Calculate per-second rate
    const perSecondRate = currentRate / (24 * 60 * 60);
    
    // Calculate new earnings with precision
    const newEarnings = user.current_stake * perSecondRate * timeSinceUpdate;
    
    // Calculate referral earnings if any
    const referralEarnings = await calculateReferralEarnings(user.id, newEarnings);
    
    // Update user data with new earnings if significant amount
    if ((newEarnings + referralEarnings) >= 0.000001) { // Minimum threshold
      const updatedTotalEarned = totalEarned + newEarnings + referralEarnings;
      const updatedAvailableBalance = (user.available_balance || 0) + newEarnings + referralEarnings;
      
      await updateUserData({
        total_earned: Number(updatedTotalEarned.toFixed(6)),
        available_balance: Number(updatedAvailableBalance.toFixed(6)),
        last_update: now.toISOString(),
        is_active: true,
        cycle_completed: false,
        bonus_eligible: true,
        cycle_progress: Number((updatedTotalEarned / user.current_stake * 100).toFixed(2))
      });

      // Update local earnings state
      setCurrentEarnings(prev => prev + newEarnings + referralEarnings);
    }
  }, [user?.current_stake, user?.current_stake_date, user?.last_update, user?.total_earned]);

  // Add helper function to calculate referral earnings
  const calculateReferralEarnings = async (userId: number, baseEarnings: number) => {
    const { data: referrals } = await supabase
      .from('referrals')
      .select('level, referred_id')
      .eq('referrer_id', userId);

    if (!referrals?.length) return 0;

    const referralRates = {
      1: 0.10, // 10% for level 1
      2: 0.05, // 5% for level 2
      3: 0.03, // 3% for level 3
      4: 0.02, // 2% for level 4
      5: 0.01  // 1% for level 5
    };

    return referrals.reduce((total, ref) => {
      const rate = referralRates[ref.level as keyof typeof referralRates] || 0;
      return total + (baseEarnings * rate);
    }, 0);
  };

  // Add this effect to handle earnings calculations
  useEffect(() => {
    if (user?.current_stake) {
      // Initial calculation
      calculateEarnings();
      
      // Set up interval for periodic calculations
      const interval = setInterval(calculateEarnings, 60000); // Every minute
      
      return () => clearInterval(interval);
    }
  }, [calculateEarnings, user?.current_stake]);

  return useMemo(() => ({
    user,
    isLoading,
    error,
    updateUserData,
    logout,
    telegramUser: telegramData?.user,
    currentEarnings,
    setCurrentEarnings
  }), [
    user,
    isLoading,
    error,
    updateUserData,
    logout,
    telegramData,
    currentEarnings
  ]);
};

export default useAuth;