import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase initialization
const supabaseUrl = "https://hxkmknvxicjqkbkfrguc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a21rbnZ4aWNqcWtia2ZyZ3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODAyNDEsImV4cCI6MjA1MTg1NjI0MX0.hW77UDF-v8Q04latr7TktoUC1b-6Qeo64ZSXBvtEFmg";
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: number;
  telegram_id: number;
  wallet_address: string;
  username?: string;
  referrer_id?: number;
  created_at: string;
  balance: number;
  total_deposit: number;
  total_withdrawn: number;
  team_volume: number;
  direct_referrals: number;
  rank: string;
  last_active: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  last_claim_time?: number;
  total_earned?: number;
  total_sbt?: number;
  is_active: boolean;
  reinvestment_balance?: number;
  available_balance?: number;
  sbt_last_updated?: string;
  last_rank_bonus?: string;
  stake: number;
}

export interface Stake {
  id: number;
  user_id: number;
  amount: number;
  start_date: string;
  end_date?: string;
  daily_rate: number;
  total_earned: number;
  is_active: boolean;
  last_payout: string;
  speed_boost_active: boolean;
}

export interface Deposit {
  id: number;
  user_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_hash?: string;
  created_at: string;
  processed_at?: string;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  wallet_amount: number;
  redeposit_amount: number;
  sbt_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
  transaction_hash?: string;
}

export interface ReferralEarning {
  id: number;
  user_id: number;
  referral_id: number;
  amount: number;
  level: number;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalTeamVolume: number;
  levels: {
    [key: number]: {
      count: number;
      earnings: number;
      volume: number;
    };
  };
  totalEarnings: number;
}

interface ReferredUser {
  id: number;
  telegram_id: string;
  username: string;
  total_deposit: number;
  is_active: boolean;
}

export interface Referral {
  id: number;
  referred: ReferredUser;
}

export interface ReferralUser {
  id: number;
  username: string;
  telegram_id: string;
  total_deposit: number;
  is_active: boolean;
  created_at: string;
  earnings: number;
}

// Utility function to format amounts in USD
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Update RANK_REQUIREMENTS to use TON values instead of USD
export const RANK_REQUIREMENTS = {
  AMBASSADOR: { teamVolume: 250, teamVolumeUSD: formatUSD(500), deposit: 10, depositUSD: formatUSD(20), directs: 3, weeklyBonus: 15, weeklyBonusUSD: formatUSD(15), title: 'Ambassador' },
  WARRIOR: { teamVolume: 500, teamVolumeUSD: formatUSD(1000), deposit: 25, depositUSD: formatUSD(50), directs: 5, weeklyBonus: 25, weeklyBonusUSD: formatUSD(25), title: 'TON Warrior' },
  MASTER: { teamVolume: 2500, teamVolumeUSD: formatUSD(5000), deposit: 50, depositUSD: formatUSD(100), directs: 10, weeklyBonus: 100, weeklyBonusUSD: formatUSD(100), title: 'TON Master' },
  CRYPTOMOGUL: { teamVolume: 10000, teamVolumeUSD: formatUSD(20000), deposit: 250, depositUSD: formatUSD(500), directs: 10, weeklyBonus: 250, weeklyBonusUSD: formatUSD(250), title: 'Crypto Mogul' },
  TONBARON: { teamVolume: 50000, teamVolumeUSD: formatUSD(100000), deposit: 1000, depositUSD: formatUSD(2000), directs: 10, weeklyBonus: 1000, weeklyBonusUSD: formatUSD(1000), title: 'TON Baron' },
  TYCOON: { teamVolume: 125000, teamVolumeUSD: formatUSD(250000), deposit: 2500, depositUSD: formatUSD(5000), directs: 10, weeklyBonus: 3000, weeklyBonusUSD: formatUSD(3000), title: 'Blockchain Tycoon' },
  TONELITE: { teamVolume: 250000, teamVolumeUSD: formatUSD(500000), deposit: 5000, depositUSD: formatUSD(10000), directs: 10, weeklyBonus: 5000, weeklyBonusUSD: formatUSD(5000), title: 'TON Elite' },
  FINALBOSS: { teamVolume: 500000, teamVolumeUSD: formatUSD(1000000), deposit: 7500, depositUSD: formatUSD(15000), directs: 10, weeklyBonus: 7000, weeklyBonusUSD: formatUSD(7000), title: 'The Final Boss' },
};

const rankCache = new Map<string, string>();

export const calculateRank = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select(`
      total_deposit,
      team_volume,
      direct_referrals,
      total_earned
    `)
    .eq('id', userId)
    .single();

  if (!user) return 'Novice';

  const cacheKey = `rank:${userId}:${user.total_deposit}:${user.team_volume}:${user.direct_referrals}`;
  
  if (rankCache.has(cacheKey)) {
    return rankCache.get(cacheKey)!;
  }

  for (const [, requirements] of Object.entries(RANK_REQUIREMENTS)) {
    if (
      user.team_volume >= requirements.teamVolume &&
      user.total_deposit >= requirements.deposit &&
      user.direct_referrals >= requirements.directs
    ) {
      rankCache.set(cacheKey, requirements.title);
      return requirements.title;
    }
  }
  
  rankCache.set(cacheKey, 'Novice');
  return 'Novice';
};

// Database helper functions
export const getUserByTelegramId = async (telegramId: number): Promise<User | null> => {
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
      rank: 'Novice', // Force 'Novice' rank for new users
      balance: 0,
      total_deposit: 0,
      total_withdrawn: 0,
      team_volume: 0,
      direct_referrals: 0
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  return data;
};

export const getActiveStakes = async (userId: number): Promise<Stake[]> => {
  const { data, error } = await supabase
    .from('stakes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching stakes:', error);
    return [];
  }
  return data || [];
};

export const createStake = async (stakeData: Partial<Stake>): Promise<Stake | null> => {
  const { data, error } = await supabase
    .from('stakes')
    .insert([stakeData])
    .select()
    .single();

  if (error) {
    console.error('Error creating stake:', error);
    return null;
  }
  return data;
};

export const createDeposit = async (depositData: Partial<Deposit>): Promise<Deposit | null> => {
  const { data, error } = await supabase
    .from('deposits')
    .insert([depositData])
    .select()
    .single();

  if (error) {
    console.error('Error creating deposit:', error);
    return null;
  }
  return data;
};

export const createWithdrawal = async (withdrawalData: Partial<Withdrawal>): Promise<Withdrawal | null> => {
  const { data, error } = await supabase
    .from('withdrawals')
    .insert([withdrawalData])
    .select()
    .single();

  if (error) {
    console.error('Error creating withdrawal:', error);
    return null;
  }
  return data;
};

// Update the updateUserBalance function to consider total earnings
export const updateUserBalance = async (userId: number, amount: number, earnedAmount: number): Promise<boolean> => {
  const { data: user } = await supabase
    .from('users')
    .select('total_earned')
    .eq('id', userId)
    .single();

  const totalEarned = (user?.total_earned || 0) + earnedAmount;
  const newRank = calculateRank(totalEarned);
  
  const { error } = await supabase
    .from('users')
    .update({ 
      balance: amount,
      total_earned: totalEarned,
      rank: newRank 
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating balance and rank:', error);
    return false;
  }
  return true;
};

// First, execute the stored procedure creation once in your database
export const setupStoredProcedures = async (userId: number) => {
  // First create referral procedure
  const { error: referralError } = await supabase.rpc('process_referral_v2', {
    p_referrer_id: userId,
    p_referred_id: userId
  });

  // Then create team volume procedures
  const { error: volumeError } = await supabase.rpc('update_team_volumes', {
    p_referrer_ids: [userId],
    p_amount: 0
  });

  return !referralError && !volumeError;
};

// Then use it when updating user's referral levels
export const updateUserReferralLevels = async (userId: number) => {
  const { data: user } = await supabase
    .from('users')
    .select('direct_referrals')
    .eq('id', userId)
    .single();

  if (!user) return false;

  // Calculate eligible levels based on direct referrals
  const eligibleLevels = REFERRAL_LEVELS
    .filter(level => user.direct_referrals >= level.minDirects)
    .map(level => ({
      level: level.level,
      percentage: level.percentage
    }));

  // Call the stored procedure
  const { error } = await supabase.rpc('update_referral_levels', {
    p_user_id: userId,
    p_levels: eligibleLevels
  });

  return !error;
};


// Enhanced getReferralStats function
export const getReferralStats = async (userId: number): Promise<ReferralStats> => {
  try {
    // Get all referrals and their associated users
    const { data: referralData, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        level,
        referred:users!referred_id (
          id,
          is_active,
          total_deposit
        ),
        earnings:referral_earnings!inner(
          amount
        )
      `)
      .eq('referrer_id', userId);

    if (referralsError) {
      console.error('Referrals query error:', referralsError);
      throw referralsError;
    }

    // Initialize stats object
    const stats: ReferralStats = {
      totalReferrals: 0,
      activeReferrals: 0,
      totalTeamVolume: 0,
      levels: {},
      totalEarnings: 0
    };

    // Process referrals
    referralData?.forEach(referral => {
      const level = referral.level;
      const referred = referral.referred[0];
      const earnings = referral.earnings?.[0]?.amount || 0;
      
      if (!referred) return;

      // Initialize level if it doesn't exist
      if (!stats.levels[level]) {
        stats.levels[level] = {
          count: 0,
          earnings: 0,
          volume: 0
        };
      }

      // Update level stats
      stats.levels[level].count++;
      stats.levels[level].earnings += earnings;
      stats.levels[level].volume += referred.total_deposit || 0;

      // Update total stats
      stats.totalReferrals++;
      if (referred.is_active) stats.activeReferrals++;
      stats.totalTeamVolume += referred.total_deposit || 0;
      stats.totalEarnings += earnings;
    });

    return stats;

  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
};

// Update REFERRAL_LEVELS to match bot backend configuration
export const REFERRAL_LEVELS: ReferralLevel[] = [
  { level: 1, percentage: 0.10, minDirects: 0, color: '#3B82F6', sbtReward: 10 },  // 10%
  { level: 2, percentage: 0.05, minDirects: 5, color: '#10B981', sbtReward: 5 },   // 5%
  { level: 3, percentage: 0.03, minDirects: 10, color: '#6366F1', sbtReward: 3 },  // 3%
  { level: 4, percentage: 0.02, minDirects: 20, color: '#8B5CF6', sbtReward: 2 },  // 2%
  { level: 5, percentage: 0.01, minDirects: 50, color: '#EC4899', sbtReward: 1 }   // 1%
];

// Add constants to match bot backend
export const SPEED_BOOST_MULTIPLIER = 2;
export const FAST_START_BONUS_AMOUNT = 1; // 1 TON
export const FAST_START_REQUIRED_REFERRALS = 2;
export const FAST_START_TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Update processReferralBonus to handle all bonus types
export const processReferralBonus = async (userId: number, referrerId: number): Promise<{ success: boolean; message: string }> => {
  try {
    // Check for existing referral
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', referrerId)
      .eq('referred_id', userId)
      .single();

    if (existingReferral) {
      return { success: false, message: 'Referral relationship already exists' };
    }

    // Create new referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerId,
        referred_id: userId,
        status: 'active',
        level: 1,
        created_at: new Date().toISOString()
      }]);

    if (referralError) throw referralError;

    // Update referrer's direct referrals count and SBT reward
    const { error: updateError } = await supabase
      .from('users')
      .update({
        direct_referrals: supabase.rpc('increment', { n: 1 }),
        total_sbt: supabase.rpc('increment_sbt', { amount: REFERRAL_LEVELS[0].sbtReward })
      })
      .eq('id', referrerId);

    if (updateError) throw updateError;

    // Check and process Fast Start Bonus
    const fastStartResult = await checkFastStartBonus(referrerId);
    if (fastStartResult.success) {
      await logEarningEvent(referrerId, 'bonus', FAST_START_BONUS_AMOUNT, {
        type: 'fast_start',
        referredId: userId
      });
    }

    // Process Global Matrix Pool entry
    await processGMPEntry(referrerId);

    return { success: true, message: 'Referral processed successfully!' };
  } catch (error) {
    console.error('Error processing referral:', error);
    return { success: false, message: 'Error processing referral' };
  }
};

// Add Global Matrix Pool processing
export const processGMPEntry = async (userId: number) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('direct_referrals, team_volume')
      .eq('id', userId)
      .single();

    if (!user) return false;

    // Check GMP qualification criteria
    const qualifiesForGMP = user.direct_referrals >= 2 && user.team_volume >= 100;

    if (qualifiesForGMP) {
      const { error } = await supabase
        .from('gmp_participants')
        .insert([{
          user_id: userId,
          entry_date: new Date().toISOString(),
          status: 'active',
          total_points: calculateGMPPoints(user.direct_referrals, user.team_volume)
        }]);

      return !error;
    }

    return false;
  } catch (error) {
    console.error('Error processing GMP entry:', error);
    return false;
  }
};

// Calculate GMP points based on performance
const calculateGMPPoints = (directReferrals: number, teamVolume: number): number => {
  let points = 0;
  
  // Points for direct referrals
  points += directReferrals * 10;
  
  // Points for team volume (1 point per 10 TON)
  points += Math.floor(teamVolume / 10);
  
  return points;
};

// Update distributeCommission to handle rank bonuses
export const distributeCommission = async (
  uplineId: number,   
  level: number, 
  userId: number, 
  commission: number
) => {
  try {
    // Get upline's rank and requirements
    const { data: upline } = await supabase
      .from('users')
      .select('rank, direct_referrals, team_volume')
      .eq('id', uplineId)
      .single();

    if (!upline) return;

    // Calculate rank bonus multiplier
    let bonusMultiplier = 1;
    const rankRequirements = RANK_REQUIREMENTS[upline.rank as keyof typeof RANK_REQUIREMENTS];
    if (rankRequirements) {
      // Higher ranks get better commission rates
      switch (upline.rank) {
        case 'MASTER':
          bonusMultiplier = 1.2;
          break;
        case 'CRYPTOMOGUL':
          bonusMultiplier = 1.5;
          break;
        case 'TONBARON':
          bonusMultiplier = 2;
          break;
        // Add more rank multipliers as needed
      }
    }

    // Apply bonus multiplier to commission
    const finalCommission = commission * bonusMultiplier;

    // Record the earning
    const { error } = await supabase.from('referral_earnings').insert({
      referrer_id: uplineId,
      referred_id: userId,
      level,
      commission_rate: commission,
      bonus_multiplier: bonusMultiplier,
      final_amount: finalCommission,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    // Log the earning event
    await logEarningEvent(uplineId, 'referral', finalCommission, {
      level,
      referredId: userId,
      bonusMultiplier
    });

    // Update user's total earnings
    await updateUserBalance(uplineId, finalCommission, finalCommission);

  } catch (error) {
    console.error('Error distributing commission:', error);
    throw error;
  }
};

// Update checkFastStartBonus to match bot backend logic
export const checkFastStartBonus = async (userId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('created_at, fast_start_bonus_claimed, balance, total_earned')
      .eq('id', userId)
      .single();

    if (!user || user.fast_start_bonus_claimed) return { success: false };

    const registrationTime = new Date(user.created_at).getTime();
    const currentTime = new Date().getTime();

    if (currentTime - registrationTime <= FAST_START_TIME_WINDOW) {
      const { data: referrals } = await supabase
        .from('referrals')
        .select('created_at')
        .eq('referrer_id', userId)
        .gte('created_at', user.created_at)
        .lte('created_at', new Date(registrationTime + FAST_START_TIME_WINDOW).toISOString());

      if ((referrals || []).length >= FAST_START_REQUIRED_REFERRALS) {
        // Update user and mark bonus as claimed
        const { error: updateError } = await supabase
          .from('users')
          .update({
            balance: (user.balance || 0) + FAST_START_BONUS_AMOUNT,
            total_earned: (user.total_earned || 0) + FAST_START_BONUS_AMOUNT,
            fast_start_bonus_claimed: true
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        // Record bonus
        await supabase
          .from('bonus_history')
          .insert([{
            user_id: userId,
            bonus_type: 'fast_start',
            amount: FAST_START_BONUS_AMOUNT,
            created_at: new Date().toISOString()
          }]);

        return {
          success: true,
          message: `🎉 Fast Start Bonus: You've earned ${FAST_START_BONUS_AMOUNT} TON for referring 2 users within 24 hours!`
        };
      }
    }

    return { success: false };
  } catch (error) {
    console.error('Error checking Fast Start Bonus:', error);
    return { success: false };
  }
};

export const getAllReferrals = async () => {
  try {
    const { data, error } = await supabase
      .from("referrals")
      .select("*");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all referrals:", error);
    return [];
  }
};


export const getReferralLeaderboard = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        telegram_id,
        referrals!referrer_id (
          id,
          referred:users!referred_id (
            username,
            telegram_id
          )
        ),
        total_sbt
      `)
      .not('username', 'is', null);

    if (error) throw error;

    const leaderboard = data
      .map(user => ({
        username: user.username,
        referral_count: user.referrals?.length || 0,
        total_sbt: user.total_sbt || 0
      }))
      .sort((a, b) => b.referral_count - a.referral_count)
      .slice(0, limit);

    return leaderboard;
  } catch (error) {
    console.error("Error getting referral leaderboard:", error);
    return [];
  }
};


export const getTransactionHistory = async (userId: number, limit = 10) => {
  const { data, error } = await supabase
    .from('transaction_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
  return data;
};

// Update STAKING_CONFIG to include weekly rates
export const STAKING_CONFIG = {
  DAILY_RATES: {
    WEEK1: 0.01, // 1% (days 1-7)
    WEEK2: 0.02, // 2% (days 8-14)
    WEEK3: 0.03, // 3% (days 15-21)
    WEEK4: 0.04  // 4% (days 22+)
  },
  MAX_CYCLE_PERCENTAGE: 300,
  MIN_DEPOSIT: 1, // 1 TON
  FEES: {
    DEPOSIT_STK: 0.05, // 5% to STK
    WITHDRAWAL_STK: 0.10, // 10% to STK
    WITHDRAWAL_GLP: 0.10, // 10% to GLP
    WITHDRAWAL_REINVEST: 0.20 // 20% to reinvestment wallet
  }
};

// Add function to calculate current ROI based on stake duration
export const calculateDailyROI = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) {
    return STAKING_CONFIG.DAILY_RATES.WEEK1;
  } else if (daysDiff <= 14) {
    return STAKING_CONFIG.DAILY_RATES.WEEK2;
  } else if (daysDiff <= 21) {
    return STAKING_CONFIG.DAILY_RATES.WEEK3;
  } else {
    return STAKING_CONFIG.DAILY_RATES.WEEK4;
  }
};

// Update calculateDailyRewards function for more realistic earnings
export const calculateDailyRewards = async (stakeId: number): Promise<number> => {
  const { data: stake } = await supabase
    .from('stakes')
    .select('*, users!inner(*)')
    .eq('id', stakeId)
    .single();

  if (!stake || !stake.is_active) return 0;

  // Check for duplicate payout within last 24 hours
  const lastPayout = new Date(stake.last_payout);
  const now = new Date();
  const hoursSinceLastPayout = (now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastPayout < 24) {
    console.log('Already paid out in last 24 hours');
    return 0;
  }

  // Dynamic ROI based on stake amount and duration
  let baseRate = 0.01; // 1% base daily rate
  
  // Adjust rate based on stake amount (higher stakes get slightly lower rates)
  if (stake.amount >= 10000) baseRate *= 0.8;  // 0.8% for 10k+
  else if (stake.amount >= 5000) baseRate *= 0.85; // 0.85% for 5k+
  else if (stake.amount >= 1000) baseRate *= 0.9;  // 0.9% for 1k+
  
  // Calculate days since stake start
  const startDate = new Date(stake.start_date);
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Gradually decrease rate over time
  const durationMultiplier = Math.max(0.7, 1 - (daysSinceStart / 200)); // Minimum 70% of base rate
  let dailyRate = baseRate * durationMultiplier;

  // Apply rank bonus if applicable
  const rankBonus = getRankBonus(stake.users.rank);
  dailyRate *= (1 + rankBonus);

  // Calculate daily earning with all multipliers
  let dailyEarning = stake.amount * dailyRate;
  
  // Apply speed boost if active
  if (stake.speed_boost_active) {
    dailyEarning *= 1.5; // 50% boost
  }

  // Apply maximum daily earning cap based on stake size
  const maxDailyEarning = Math.min(
    stake.amount * 0.03, // Max 3% per day
    EARNING_LIMITS.daily_roi_max
  );
  
  const cappedEarning = Math.min(dailyEarning, maxDailyEarning);

  // Update stake record
  const { error } = await supabase
    .from('stakes')
    .update({
      total_earned: stake.total_earned + cappedEarning,
      last_payout: now.toISOString(),
      daily_rate: dailyRate,
      cycle_progress: Math.min(((stake.total_earned + cappedEarning) / stake.amount) * 100, 300)
    })
    .eq('id', stakeId);

  if (error) {
    console.error('Error updating stake rewards:', error);
    return 0;
  }

  // Log the earning event
  await supabase.from('earning_history').insert({
    stake_id: stakeId,
    user_id: stake.user_id,
    amount: cappedEarning,
    type: 'daily_roi',
    roi_rate: dailyRate * 100,
    base_rate: baseRate * 100,
    rank_bonus: rankBonus,
    duration_multiplier: durationMultiplier,
    created_at: now.toISOString()
  });

  return cappedEarning;
};

// Add helper function for rank bonuses
const getRankBonus = (rank: string): number => {
  switch (rank) {
    case 'MASTER': return 0.1; // +10%
    case 'CRYPTOMOGUL': return 0.15; // +15%
    case 'TONBARON': return 0.2; // +20%
    case 'TYCOON': return 0.25; // +25%
    case 'TON ELITE': return 0.3; // +30%
    case 'FINAL BOSS': return 0.35; // +35%
    default: return 0;
  }
};

// Rank calculation and update
export const updateUserRank = async (userId: string): Promise<string | null> => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!user) return null

  let newRank = 'None'
  
  // Check requirements for each rank from lowest to highest
  for (const [, requirements] of Object.entries(RANK_REQUIREMENTS)) {
    if (
      user.team_volume >= requirements.teamVolume &&
      user.total_deposit >= requirements.deposit &&
      user.direct_referrals >= requirements.directs
    ) {
      newRank = requirements.title
    }
  }

  // Update user's rank if changed
  if (newRank !== user.rank) {
    const { error } = await supabase
      .from('users')
      .update({ rank: newRank })
      .eq('id', userId)

    if (error) {
      console.error('Error updating rank:', error)
      return null
    }
  }

  return newRank
}

// Add Speed Boost functions
export const checkAndApplySpeedBoost = async (userId: number) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('current_deposit, speed_boost_active')
      .eq('id', userId)
      .single();

    if (!user) return false;

    if (user.speed_boost_active) {
      return {
        success: true,
        boosted_amount: user.current_deposit * SPEED_BOOST_MULTIPLIER,
        message: '🚀 Speed boost active: Earning 2x rewards!'
      };
    }

    return {
      success: false,
      boosted_amount: user.current_deposit,
      message: 'Speed boost not active'
    };
  } catch (error) {
    console.error('Error checking speed boost:', error);
    return false;
  }
};

export const getRewardHistory = async (userId: number) => {
  const { data, error } = await supabase
    .from('reward_history')
    .select(`
      *,
      stake:stakes (
        amount,
        daily_rate
      )
    `)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Failed to load reward history:', error);
    throw error;
  }

  return data;
};

export const getGlobalPoolRankings = async (period: string = 'daily') => {
  const { data, error } = await supabase
    .from('global_pool_rankings')
    .select(`
      *,
      user:users (
        username,
        wallet_address
      )
    `)
    .eq('period', period)
    .order('rank', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Error fetching pool data:', error);
    throw error;
  }

  return data;
};

// Add type definition
interface ReferralLevel {
  level: number;
  percentage: number;
  minDirects: number;
  color: string;
  sbtReward: number;
}

export const getReferralNetwork = async (userId: number) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, total_deposit, is_active')
    .eq('referrer_id', userId);

  if (error) throw error;

  return {
    levels: [{ level: 1, members: data?.length || 0, volume: data?.reduce((sum, user) => sum + (user.total_deposit || 0), 0) || 0 }],
    totalSize: data?.length || 0,
    activeMembers: data?.filter(user => user.is_active).length || 0,
    totalVolume: data?.reduce((sum, user) => sum + (user.total_deposit || 0), 0) || 0,
    maxDepth: 1
  };
};

export const updateTeamVolume = async (userId: number, amount: number) => {
  try {
    // Get user's referrer chain
    const { data: referrerChain } = await supabase.rpc('get_referrer_chain', {
      p_user_id: userId
    });

    if (!referrerChain?.length) return true;

    // Update team volume for all referrers
    const { error } = await supabase.rpc('update_team_volumes', {
      p_referrer_ids: referrerChain,
      p_amount: amount
    });

    return !error;
  } catch (error) {
    console.error('Error updating team volume:', error);
    return false;
  }
};

// Add error tracking and recovery system
export const errorRecovery = {
  async retryTransaction(fn: () => Promise<any>, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        return await fn();
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  },

  async monitorUserActivity(userId: string) {
    return supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        timestamp: new Date().toISOString(),
        action_type: 'system_check',
        status: 'monitoring'
      });
  }
};

export const updateUserSBT = async (userId: number, amount: number, type: 'deposit' | 'referral' | 'stake') => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        total_sbt: supabase.rpc('increment_sbt', { user_id: userId, amount: amount })
      })
      .eq('id', userId)
      .select('total_sbt')
      .single();

    if (error) throw error;

    // Log SBT earning
    await supabase.from('sbt_history').insert({
      user_id: userId,
      amount: amount,
      type: type,
      timestamp: new Date().toISOString()
    });

    return user?.total_sbt;
  } catch (error) {
    console.error('Error updating SBT:', error);
    return null;
  }
};

export const getReferralsByPlayer = async (userId: number) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId);

  if (error) throw error;
  return data || [];
};


export const getTopReferrers = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        username,
        photoUrl,
        telegram_id,
        referrals!referrer_id (
          id,
          referred:users!referred_id (
            username,
            telegram_id,
            total_deposit,
            is_active
          )
        )
      `)
      .not('username', 'is', null)
      .limit(limit);

    if (error) throw error;

    return data.map(user => ({
      username: user.username,
      photoUrl: user.photoUrl || 'https://xelene.me/telegram.gif',
      telegram_id: user.telegram_id,
      referral_count: user.referrals?.length || 0,
      active_referrals: user.referrals?.filter(ref => ref.referred[0]?.is_active).length || 0,
      total_volume: user.referrals?.reduce((sum, ref) => sum + (ref.referred[0]?.total_deposit || 0), 0) || 0,
      total_earnings: 0 // Simplified for now
    }));
  } catch (error) {
    console.error("Error getting top referrers:", error);
    return [];
  }
};

export const getAllPlayersWithReferrals = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        telegram_id,
        photoUrl,
        total_deposit,
        is_active,
        rank,
        referrals!referrer_id (
          id,
          referred:users!referred_id (
            id,
            username,
            telegram_id,
            total_deposit,
            is_active,
            created_at
          )
        ),
        total_earned,
        team_volume
      `)
      .not('username', 'is', null)
      .order('team_volume', { ascending: false });

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      username: user.username,
      photoUrl: user.photoUrl || 'https://xelene.me/telegram.gif',
      telegram_id: user.telegram_id,
      rank: user.rank,
      total_deposit: user.total_deposit || 0,
      total_earned: user.total_earned || 0,
      team_volume: user.team_volume || 0,
      referrals: {
        total: user.referrals?.length || 0,
        active: user.referrals?.filter(ref => ref.referred[0]?.is_active).length || 0,
        list: user.referrals?.map(ref => ({
          id: ref.referred[0]?.id,
          username: ref.referred[0]?.username,
          telegram_id: ref.referred[0]?.telegram_id,
          total_deposit: ref.referred[0]?.total_deposit || 0,
          is_active: ref.referred[0]?.is_active,
          joined_date: ref.referred[0]?.created_at
        })) || []
      }
    }));
  } catch (error) {
    console.error("Error getting players with referrals:", error);
    return [];
  }
};

export const getReferralChain = async (userId: number, maxDepth: number): Promise<[number, number][]> => {
  const { data } = await supabase
    .from('referrals')
    .select('referrer_id, level')
    .eq('referred_id', userId)
    .order('level', { ascending: true })
    .limit(maxDepth);

  return (data || []).map((ref, index) => [index, ref.referrer_id]);
};

export const logEarningEvent = async (
  userId: number,
  type: 'roi' | 'referral' | 'bonus',
  amount: number,
  metadata: any
) => {
  await supabase.from('earning_logs').insert({
    user_id: userId,
    type,
    amount,
    metadata,
    timestamp: new Date().toISOString()
  });
};

export const EARNING_LIMITS = {
  daily_roi_max: 1000,
  referral_commission_max: 500,
  speed_boost_duration: 24 * 60 * 60 * 1000, // 24 hours
  minimum_withdrawal: 1
};

export const reconcileEarnings = async (userId: number) => {
  const { data: earnings } = await supabase
    .from('earning_logs')
    .select('amount')
    .eq('user_id', userId);

  const calculatedTotal = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;

  const { data: user } = await supabase
    .from('users')
    .select('total_earned')
    .eq('id', userId)
    .single();

  if (user && Math.abs(calculatedTotal - user.total_earned) > 0.000001) {
    // Log discrepancy and correct
    await supabase.from('earning_discrepancies').insert({
      user_id: userId,
      calculated: calculatedTotal,
      recorded: user.total_earned,
      timestamp: new Date().toISOString()
    });
  }
};

export const processEarnings = async (
  userId: number, 
  stakeId: number, 
  amount: number,
  type: 'roi' | 'referral' | 'bonus' = 'roi'
) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Get current stake info
    const { data: stake } = await supabase
      .from('stakes')
      .select('amount, total_earned')
      .eq('id', stakeId)
      .single();

    if (!stake) return false;

    // Calculate new cycle progress
    const newTotalEarned = stake.total_earned + amount;
    const cycleProgress = (newTotalEarned / stake.amount) * 100;

    // Check if cycle completion (300%) is reached
    if (cycleProgress >= 300) {
      // Handle cycle completion
      await handleCycleCompletion(userId, stakeId, stake.amount);
      return true;
    }

    // Process normal earnings
    const { error } = await supabase.rpc('process_earnings', {
      p_amount: amount,
      p_stake_id: stakeId,
      p_timestamp: timestamp,
      p_user_id: userId,
      p_type: type
    });

    if (error) throw error;

    // Update cycle progress
    await supabase
      .from('stakes')
      .update({ 
        cycle_progress: cycleProgress,
        total_earned: newTotalEarned
      })
      .eq('id', stakeId);

    // Log the earning event
    await logEarningEvent(userId, type, amount, {
      stakeId,
      timestamp,
      cycleProgress
    });

    return true;
  } catch (error) {
    console.error('Error processing earnings:', error);
    return false;
  }
};

// Add new function to handle cycle completion
const handleCycleCompletion = async (userId: number, stakeId: number, stakeAmount: number) => {
  try {
    // Deactivate current stake
    await supabase
      .from('stakes')
      .update({ 
        is_active: false, 
        cycle_completed: true,
        cycle_completed_at: new Date().toISOString()
      })
      .eq('id', stakeId);

    // Calculate distribution
    const reinvestAmount = stakeAmount * 0.2; // 20% to reinvestment
    const glpAmount = stakeAmount * 0.1; // 10% to GLP
    const stkAmount = stakeAmount * 0.1; // 10% to STK

    // Process distributions
    await Promise.all([
      // Add to reinvestment balance
      supabase.rpc('increment_reinvestment_balance', {
        user_id: userId,
        amount: reinvestAmount
      }),
      // Add to GLP pool
      supabase.rpc('increment_glp_pool', {
        p_amount: glpAmount
      }),
      // Add STK tokens
      supabase.rpc('increment_sbt', {
        user_id: userId,
        amount: stkAmount
      })
    ]);

    // Log cycle completion
    await supabase.from('cycle_completions').insert({
      user_id: userId,
      stake_id: stakeId,
      stake_amount: stakeAmount,
      reinvest_amount: reinvestAmount,
      glp_amount: glpAmount,
      stk_amount: stkAmount,
      completed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling cycle completion:', error);
    throw error;
  }
};

export const gmpSystem = {
  getPoolStats: async () => {
    const { data, error } = await supabase.rpc('get_gmp_stats', {
      withdrawal_fee_percent: 10,
      distribution_percent: 35
    });
    
    if (error) throw error;
    return data;
  },

  getUserPoolShare: async (userId: number) => {
    const { data, error } = await supabase.rpc('calculate_user_glp_share', {
      p_user_id: userId,
      p_team_volume_percent: 2, // Only 2% of team withdrawal volume counts
      p_reset_interval_days: 7  // Reset every 7 days
    });

    if (error) throw error;
    return data;
  }
};

// Function to update direct referral count
export const updateDirectReferralCount = async (userId: number) => {
  try {
    // Count actual direct referrals from referrals table
    const { count, error } = await supabase
      .from('referrals')
      .select('id', { count: 'exact' })
      .eq('referrer_id', userId)
      .eq('level', 1);  // Only direct referrals

    if (error) throw error;

    // Update user's direct_referrals count
    await supabase
      .from('users')
      .update({ direct_referrals: count })
      .eq('id', userId);

    return count;
  } catch (error) {
    console.error('Error updating direct referral count:', error);
    return null;
  }
};

// Call this after processing new referrals
export const processReferral = async (referrerId: number, referredId: number) => {
  try {
    // Add referral record
    await supabase.from('referrals').insert({
      referrer_id: referrerId,
      referred_id: referredId,
      level: 1
    });

    // Update direct referral count
    await updateDirectReferralCount(referrerId);
    
    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
  }
};

export const referralSystem = {
  // Calculate total team volume
  async calculateTeamVolume(userId: number): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_team_volume', {
      p_user_id: userId
    });
    if (error) throw error;
    return data || 0;
  },

  // Calculate total earned referral bonuses
  async calculateTotalEarned(userId: number): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_total_earned', {
      p_user_id: userId
    });
    if (error) throw error;
    return data || 0;
  },

  // Calculate expected rank bonus
  async calculateExpectedRankBonus(userId: number): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_expected_rank_bonus', {
      p_user_id: userId
    });
    if (error) throw error;
    return data || 0;
  },

  // Get available earnings
  async getAvailableEarnings(userId: number): Promise<number> {
    const { data, error } = await supabase.rpc('get_available_earnings', {
      p_user_id: userId
    });
    if (error) throw error;
    return data || 0;
  }
};


export const getReferralsByLevel = async (userId: number, level: number) => {
  // First get referral IDs
  const { data: referralIds } = await supabase
    .from('referrals')
    .select('referred_id')
    .eq('referrer_id', userId)
    .eq('level', level);

  const ids = referralIds?.map(r => r.referred_id) || [];

  // Then get user details
  const { data } = await supabase
    .from('users')
    .select(`
      username,
      total_deposit,
      total_earned,
      created_at,
      is_active
    `)
    .in('id', ids);

  return data?.map(user => ({
    username: user.username,
    stake: user.total_deposit,
    reward: user.total_earned,
    created_at: user.created_at,
    is_active: user.is_active
  })) || [];
};

// Add this helper function at the top
export const rpc = {
  incrementBalance: async (userId: number, amount: number) => {
    return await supabase.rpc('increment_balance', { user_id: userId, amount });
  },
  incrementTeamVolume: async (userId: number, amount: number) => {
    return await supabase.rpc('increment_team_volume', { user_id: userId, amount });
  },
  incrementSBT: async (userId: number, amount: number) => {
    return await supabase.rpc('increment_sbt', { user_id: userId, amount });
  }
};

// Add cycle tracking
export const checkAndHandleCycle = async (userId: number) => {
  const { data: stakes } = await supabase
    .from('stakes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  for (const stake of stakes || []) {
    const totalReturn = stake.total_earned / stake.amount * 100;
    if (totalReturn >= 300) {
      // Handle cycle completion
      await supabase.rpc('complete_stake_cycle', { 
        p_stake_id: stake.id,
        p_user_id: userId 
      });
    }
  }
};

// Add these constants for withdrawal fees
const WITHDRAWAL_FEES = {
  GLP: 0.10,  // 10% to Global Leadership Pool
  STK: 0.10,  // 10% to Reputation Points ($STK)
  REINVEST: 0.20  // 20% to re-investment wallet
};

// Add this function to handle withdrawal fee distribution
export const processWithdrawalFees = async (userId: number, amount: number) => {
  try {
    const glpAmount = amount * WITHDRAWAL_FEES.GLP;
    const stkAmount = amount * WITHDRAWAL_FEES.STK;
    const reinvestAmount = amount * WITHDRAWAL_FEES.REINVEST;
    const userAmount = amount - glpAmount - stkAmount - reinvestAmount;

    // Update GLP pool
    await supabase.rpc('increment_glp_pool', {
      p_amount: glpAmount
    });

    // Add STK (Reputation Points) to user
    await supabase.rpc('increment_sbt', {
      user_id: userId,
      amount: stkAmount
    });

    // Add to user's reinvestment wallet
    await supabase.rpc('increment_reinvestment_balance', {
      user_id: userId,
      amount: reinvestAmount
    });

    return {
      success: true,
      userAmount,
      fees: {
        glp: glpAmount,
        stk: stkAmount,
        reinvest: reinvestAmount
      }
    };
  } catch (error) {
    console.error('Error processing withdrawal fees:', error);
    return { success: false };
  }
};

// Update the existing withdrawal function
export const processWithdrawal = async (userId: number, amount: number): Promise<boolean> => {
  try {
    // Validate minimum withdrawal
    if (amount < EARNING_LIMITS.minimum_withdrawal) {
      console.error('Withdrawal amount below minimum');
      return false;
    }

    // Get user's current earnings
    const { data: user } = await supabase
      .from('users')
      .select('available_earnings')
      .eq('id', userId)
      .single();

    if (!user || user.available_earnings < amount) {
      console.error('Insufficient available earnings');
      return false;
    }

    // Process fees and get final user amount
    const feeResult = await processWithdrawalFees(userId, amount);
    if (!feeResult.success) return false;

    // Begin transaction
    const { error } = await supabase.rpc('process_withdrawal', {
      p_user_id: userId,
      p_amount: amount,
      p_user_amount: feeResult.userAmount,
      p_glp_amount: feeResult?.fees?.glp ?? 0,
      p_stk_amount: feeResult?.fees?.stk ?? 0,
      p_reinvest_amount: feeResult?.fees?.reinvest ?? 0
    });

    if (error) throw error;

    // Log the withdrawal
    await supabase.from('withdrawals').insert({
      user_id: userId,
      amount: amount,
      user_amount: feeResult.userAmount,
      glp_fee: feeResult?.fees?.glp ?? 0,
      stk_fee: feeResult?.fees?.stk ?? 0,
      reinvest_amount: feeResult?.fees?.reinvest ?? 0,
      status: 'completed',
      created_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return false;
  }
};

// Add referral earning calculation function
export const calculateReferralEarnings = async (userId: number): Promise<void> => {
  try {
    // Get all active referrals and their stakes
    const { data: referrals } = await supabase.rpc('get_active_referral_tree', {
      p_user_id: userId,
      p_max_level: 5
    });

    if (!referrals) return;

    // Calculate earnings for each level
    const earnings = referrals.map((ref: any) => ({
      user_id: userId,
      referral_id: ref.referral_id,
      level: ref.level,
      amount: ref.stake * REFERRAL_RATES[`LEVEL${ref.level}` as keyof typeof REFERRAL_RATES].rate,
      created_at: new Date().toISOString()
    }));

    // Insert earnings records
    await supabase.from('referral_earnings').insert(earnings);

    // Update user's available earnings
    await supabase.rpc('update_user_earnings', {
      p_user_id: userId,
      p_amount: earnings.reduce((sum: number, e: ReferralEarning) => sum + e.amount, 0)
    });

  } catch (error) {
    console.error('Error calculating referral earnings:', error);
  }
};

export const REFERRAL_RATES = {
  LEVEL1: { rate: 0.10 }, // 10%
  LEVEL2: { rate: 0.05 }, // 5%
  LEVEL3: { rate: 0.03 }, // 3%
  LEVEL4: { rate: 0.02 }, // 2%
  LEVEL5: { rate: 0.01 }  // 1%
};

// Add this function to handle 300% cycle completion
export const checkCycleCompletion = async (userId: number) => {
  const { data: stakes } = await supabase
    .from('stakes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  for (const stake of stakes || []) {
    const totalReturn = (stake.total_earned / stake.amount) * 100;
    if (totalReturn >= 300) {
      // Deactivate stake and notify user
      await supabase
        .from('stakes')
        .update({ is_active: false, cycle_completed: true })
        .eq('id', stake.id);
        
      // Add to reinvestment balance
      await supabase.rpc('increment_reinvestment_balance', {
        user_id: userId,
        amount: stake.amount * 0.2 // 20% to reinvestment
      });
    }
  }
};

export const distributeGLPRewards = async () => {
  // Weekly distribution based on:
  // 1. Leader referral counts
  // 2. 2% of team withdrawal volume
  // Implementation needed
};

export const processWeeklyRankBonus = async (userId: number) => {
  const { data: user } = await supabase
    .from('users')
    .select('rank, team_volume')
    .eq('id', userId)
    .single();

  if (user) {
    const rankReq = RANK_REQUIREMENTS[user.rank as keyof typeof RANK_REQUIREMENTS];
    if (user.team_volume >= rankReq.teamVolume) {
      await supabase.rpc('pay_rank_bonus', {
        user_id: userId,
        bonus_amount: rankReq.weeklyBonus
      });
    }
  }
};

export const checkCycleStatus = async (userId: string) => {
  const { data: stake } = await supabase
    .from('stakes')
    .select('amount, total_earned')
    .eq('user_id', userId)
    .single();

  if (stake) {
    const cyclePercentage = (stake.total_earned / stake.amount) * 100;
    return {
      completed: cyclePercentage >= 300,
      percentage: Math.min(cyclePercentage, 300)
    };
  }
};
