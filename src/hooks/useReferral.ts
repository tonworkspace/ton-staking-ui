import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabaseClient';
import { REFERRAL_CONFIG } from '@/config/gameConfig';

interface ReferralStats {
    referralTree: {
      level1: { id: string; username: string; }[];
      level2: { id: string; username: string; }[];
      level3: { id: string; username: string; }[];
    };
    upline?: { id: string; username: string; level: number; };
    totalEarnings: number;
    activeReferrals: number;
    directReferrals: number;
    byLevel: {
      level1: number;
      level2: number;
      level3: number;
    };
    weeklyBonus: number;
    lastUpdated: string;
    user_id: string;
  }

interface ReferralTreeItem {
  level: number;
  referred_id: string;
  users: {
    username: string;
    last_active: string;
  };
}

// Update this to your Glitch server URL
const API_URL = 'https://lumbar-secretive-colby.glitch.me';

export const useReferral = () => {
  const { user, telegramUser } = useAuth();
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process referral link
  const processReferralLink = useCallback(async (referrerId: string) => {
    if (!user?.telegram_id || !telegramUser) return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const initData = searchParams.get('tgWebAppData');
      
      if (!initData) {
        throw new Error('Missing Telegram initialization data');
      }

      // Self-referral check
      if (referrerId === user.telegram_id) {
        throw new Error('Cannot refer yourself');
      }

      // Call API endpoint instead of direct Supabase call
      const response = await fetch(`${API_URL}/api/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData,
          referrerId,
          referredId: user.telegram_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process referral');
      }

      // Update stats
      await fetchReferralStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process referral');
      return false;
    }
  }, [user, telegramUser]);

  // Fetch referral stats
  const fetchReferralStats = useCallback(async () => {
    if (!user?.telegram_id) return;

    try {
      setIsLoading(true);

      // Get upline information
      const { data: uplineData, error: uplineError } = await supabase
        .from('referrals')
        .select(`
          level,
          referrer_id,
          users!inner (
            username
          )
        `)
        .eq('referred_id', user.telegram_id)
        .single();

      if (uplineError && uplineError.code !== 'PGRST116') {
        throw uplineError;
      }

      // First get the referral counts
      const { data: counts, error: countError } = await supabase
        .rpc('get_referral_counts', {
          p_user_id: user.telegram_id
        });

      if (countError) throw countError;

      // Then get the referral tree with active users
      const { data: referralTree, error: treeError } = await supabase
        .from('referrals')
        .select(`
          level,
          referred_id,
          users:users!inner (
            username,
            last_active
          )
        `)
        .eq('referrer_id', user.telegram_id)
        .eq('active', true)
        .returns<ReferralTreeItem[]>();

      if (treeError) throw treeError;

      // Calculate active referrals based on last_active
      const now = new Date().getTime();
      const activeReferrals = referralTree?.filter(ref => {
        const lastActive = new Date(ref.users.last_active).getTime();
        return (now - lastActive) <= REFERRAL_CONFIG.ACTIVITY_THRESHOLD;
      });

      // Calculate weekly bonus based on active referrals count
      const activeCount = activeReferrals?.length || 0;
      const weeklyBonus = REFERRAL_CONFIG.RANKS.reduce((bonus, rank) => {
        return activeCount >= rank.REQUIRED_REFS ? rank.WEEKLY_BONUS : bonus;
      }, 0);

      const updatedStats: ReferralStats = {
        user_id: user.telegram_id,
        upline: uplineData ? {
          id: uplineData.referrer_id,
          username: uplineData.users[0]?.username || 'Unknown',
          level: uplineData.level
        } : undefined,
        referralTree: {
          level1: referralTree?.filter(ref => ref.level === 1).map(ref => ({
            id: ref.referred_id,
            username: ref.users.username
          })) || [],
          level2: referralTree?.filter(ref => ref.level === 2).map(ref => ({
            id: ref.referred_id,
            username: ref.users.username
          })) || [],
          level3: referralTree?.filter(ref => ref.level === 3).map(ref => ({
            id: ref.referred_id,
            username: ref.users.username
          })) || []
        },
        totalEarnings: counts?.total_earnings || 0,
        activeReferrals: activeCount,
        directReferrals: counts?.direct_referrals || 0,
        byLevel: {
          level1: counts?.level1_count || 0,
          level2: counts?.level2_count || 0,
          level3: counts?.level3_count || 0
        },
        weeklyBonus,
        lastUpdated: new Date().toISOString()
      };

      // Update stats in database
      const { error: updateError } = await supabase
        .from('referral_stats')
        .upsert(updatedStats);

      if (updateError) throw updateError;

      setReferralStats(updatedStats);
      return updatedStats;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch referral stats');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.telegram_id]);

  // Update referral stats with mining data
  const updateReferralStats = useCallback(async (miningStats: any) => {
    if (!user?.telegram_id || !referralStats) return null;

    try {
      // Calculate referral earnings from mining
      const earnings = await supabase.rpc('calculate_referral_earnings', {
        p_user_id: user.telegram_id,
        p_mining_amount: miningStats.cycleEarnings
      });

      if (earnings.error) throw earnings.error;

      const updatedStats = {
        ...referralStats,
        totalEarnings: referralStats.totalEarnings + earnings.data,
        lastUpdated: new Date().toISOString()
      };

      // Update stats in database
      await supabase
        .from('referral_stats')
        .upsert(updatedStats);

      setReferralStats(updatedStats);
      return updatedStats;

    } catch (err) {
      console.error('Failed to update referral stats:', err);
      return null;
    }
  }, [user?.telegram_id, referralStats]);

  // Initial fetch of referral stats
  useEffect(() => {
    if (user?.telegram_id) {
      fetchReferralStats();

      // Set up real-time subscription for referral updates
      const subscription = supabase
        .channel(`referral_stats:${user.telegram_id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'referral_stats',
          filter: `user_id=eq.${user.telegram_id}`
        }, () => {
          fetchReferralStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user?.telegram_id, fetchReferralStats]);

  return {
    referralStats,
    isLoading,
    error,
    updateReferralStats,
    processReferralLink,
    fetchReferralStats
  };
}; 