import { FC, useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaCrown, FaUserPlus, FaUsers, FaChartLine, FaCoins, FaStar } from 'react-icons/fa';
import { getReferralsByLevel, calculateReferralEarnings } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSnackbar } from '@/hooks/useSnackbar';

interface ReferralUser {
  username: string;
  stake: number;
  reward: number;
  created_at: string;
  is_active: boolean;
}

interface ReferralEarning {
  level: number;
  total: number;
}

// Referral Rates
const REFERRAL_RATES = {
  LEVEL1: { rate: 0.10, label: 'Direct Income' },
  LEVEL2: { rate: 0.05, label: 'Indirect Income' },
  LEVEL3: { rate: 0.03, label: 'Indirect Income' },
  LEVEL4: { rate: 0.02, label: 'Indirect Income' },
  LEVEL5: { rate: 0.01, label: 'Indirect Income' }
};

// Rank Requirements and Bonuses
const RANK_REQUIREMENTS = {
  AMBASSADOR: {
    title: 'Ambassador',
    minDirects: 3,
    minStake: 20,
    minTeamVolume: 500,
    weeklyBonus: 15,
    color: 'green'
  },
  WARRIOR: {
    title: 'TON Warrior',
    minDirects: 5,
    minStake: 50,
    minTeamVolume: 1000,
    weeklyBonus: 25,
    color: 'blue'
  },
  MASTER: {
    title: 'TON Master',
    minDirects: 10,
    minStake: 100,
    minTeamVolume: 5000,
    weeklyBonus: 100,
    color: 'purple'
  },
  MOGUL: {
    title: 'Crypto Mogul',
    minDirects: 10,
    minStake: 500,
    minTeamVolume: 20000,
    weeklyBonus: 250,
    color: 'yellow'
  },
  BARON: {
    title: 'TON Baron',
    minDirects: 10,
    minStake: 2000,
    minTeamVolume: 100000,
    weeklyBonus: 1000,
    color: 'orange'
  },
  TYCOON: {
    title: 'Blockchain Tycoon',
    minDirects: 10,
    minStake: 5000,
    minTeamVolume: 250000,
    weeklyBonus: 3000,
    color: 'red'
  },
  ELITE: {
    title: 'TON Elite',
    minDirects: 10,
    minStake: 10000,
    minTeamVolume: 500000,
    weeklyBonus: 5000,
    color: 'pink'
  },
  BOSS: {
    title: 'TON Boss',
    minDirects: 10,
    minStake: 15000,
    minTeamVolume: 1000000,
    weeklyBonus: 7000,
    color: 'gradient'
  }
};

const formatTON = (value: number | undefined): string => {
  return (value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const ReferralIncomeCard: FC<{ level: number; rate: number; label: string; earnings?: number }> = ({
  level,
  rate,
  label,
  earnings = 0
}) => (
  <div className="bg-black/20 rounded-lg border border-white/10 p-3">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
          <span className="text-xs font-medium text-blue-400">{level}</span>
        </div>
        <span className="text-sm text-white/60">Level {level}</span>
      </div>
      <div className="px-2 py-1 rounded-full bg-blue-500/20">
        <span className="text-xs font-medium text-blue-400">{(rate * 100)}%</span>
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">{label}</span>
        {earnings > 0 && (
          <span className="text-sm font-medium text-green-400">+{formatTON(earnings)} TON</span>
        )}
      </div>
    </div>
  </div>
);

// Add a RankCard component to display rank details
const RankCard: FC<{ rank: string; currentRank: string; userStats: any }> = ({ 
  rank, 
  currentRank, 
  userStats 
}) => {
  const requirements = RANK_REQUIREMENTS[rank as keyof typeof RANK_REQUIREMENTS];
  const isCurrentRank = currentRank === rank;
  const isQualified = 
    userStats.directs >= requirements.minDirects &&
    userStats.stake >= requirements.minStake &&
    userStats.teamVolume >= requirements.minTeamVolume;

  return (
    <div className={`bg-black/20 rounded-lg border ${
      isCurrentRank ? `border-${requirements.color}-500/50` : 'border-white/10'
    } p-3`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{requirements.title}</span>
        <div className={`px-2 py-1 rounded-full text-xs ${
          isQualified ? `bg-${requirements.color}-500/20 text-${requirements.color}-400` : 
          'bg-white/5 text-white/40'
        }`}>
          {isQualified ? 'Qualified' : 'Unqualified'}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Direct Referrals</span>
          <span className={userStats.directs >= requirements.minDirects ? 'text-green-400' : 'text-white/40'}>
            {userStats.directs}/{requirements.minDirects}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Min Stake</span>
          <span className={userStats.stake >= requirements.minStake ? 'text-green-400' : 'text-white/40'}>
            ${userStats.stake}/${requirements.minStake}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Team Volume</span>
          <span className={userStats.teamVolume >= requirements.minTeamVolume ? 'text-green-400' : 'text-white/40'}>
            ${userStats.teamVolume}/${requirements.minTeamVolume}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Weekly Bonus</span>
          <span className="text-blue-400">${requirements.weeklyBonus}</span>
        </div>
      </div>
    </div>
  );
};

const formatTimeRemaining = (targetDate: string): string => {
  const remaining = new Date(targetDate).getTime() - Date.now();
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
};

const RankCarousel: FC = () => {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextBonusTime, setNextBonusTime] = useState<string>('');
  const ranks = Object.keys(RANK_REQUIREMENTS);
  const currentRank = user?.rank || 'AMBASSADOR';
  const currentRankIndex = ranks.indexOf(currentRank);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : ranks.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < ranks.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (user?.last_rank_bonus) {
      const nextBonus = new Date(user.last_rank_bonus);
      nextBonus.setDate(nextBonus.getDate() + 7);
      setNextBonusTime(nextBonus.toISOString());
    }
  }, [user?.last_rank_bonus]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Rank Progression</h3>
        {nextBonusTime && (
          <div className="text-xs text-white/60">
            Next bonus: {formatTimeRemaining(nextBonusTime)}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div className="flex items-center">
          <button 
            onClick={handlePrev}
            className="p-1 rounded-full bg-black/20 hover:bg-black/40"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 mx-2">
            <RankCard
              rank={ranks[activeIndex]}
              currentRank={currentRank}
              userStats={{
                directs: user?.direct_referrals || 0,
                stake: user?.stake || 0,
                teamVolume: user?.team_volume || 0
              }}
            />
          </div>

          <button 
            onClick={handleNext}
            className="p-1 rounded-full bg-black/20 hover:bg-black/40"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Rank Progress Indicator */}
        <div className="flex justify-center gap-1 mt-2">
          {ranks.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === activeIndex
                  ? 'bg-blue-500'
                  : index <= currentRankIndex
                  ? 'bg-green-500/50'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Add these skeleton components at the top level
const StatSkeleton: FC = () => (
  <div className="bg-black/20 rounded-lg border border-white/10 p-3 animate-pulse">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-4 h-4 bg-white/10 rounded" />
      <div className="h-3 w-20 bg-white/10 rounded" />
    </div>
    <div className="h-6 w-24 bg-white/10 rounded" />
  </div>
);

const ReferralCardSkeleton: FC = () => (
  <div className="bg-black/20 rounded-lg border border-white/10 p-3 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-4 h-4 bg-white/10 rounded" />
      <div className="h-4 w-32 bg-white/10 rounded" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 w-full bg-white/10 rounded" />
      ))}
    </div>
  </div>
);

const ReferralRowSkeleton: FC = () => (
  <div className="grid grid-cols-3 gap-4 p-2 rounded-lg animate-pulse">
    <div className="h-5 w-24 bg-white/10 rounded" />
    <div className="h-5 w-20 bg-white/10 rounded" />
    <div className="h-5 w-20 bg-white/10 rounded" />
  </div>
);

const ReferralSystem: FC = () => {
  const { user } = useAuth();
  const [activeLevel, setActiveLevel] = useState(1);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralEarnings, setReferralEarnings] = useState<{ [key: number]: number }>({});
  const { showSnackbar } = useSnackbar();

  // Get current rank requirements
  const currentRank = user?.rank || 'AMBASSADOR';
  const rankReq = RANK_REQUIREMENTS[currentRank as keyof typeof RANK_REQUIREMENTS];

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await getReferralsByLevel(user.id, activeLevel);
        setReferrals(data);
      } catch (err) {
        setError('Failed to load referrals. Please try again later.');
        console.error('Error fetching referrals:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, [user?.id, activeLevel]);

  // Initialize referral link from localStorage or generate new one
  useEffect(() => {
    if (user?.telegram_id) {
      const cachedLink = localStorage.getItem(`referral_link_${user.telegram_id}`);
      if (cachedLink) {
        setReferralLink(cachedLink);
      } else {
        const newLink = `https://t.me/Tonstak3it_bot?start=${user.telegram_id}`;
        localStorage.setItem(`referral_link_${user.telegram_id}`, newLink);
        setReferralLink(newLink);
      }
    }
  }, [user?.telegram_id]);

  const stats = [
    {
      icon: <FaUsers className="text-blue-400" size={16} />,
      label: "Direct Referrals",
      value: user?.direct_referrals || 0,
      suffix: `/ ${rankReq?.minDirects || 3}`
    },
    {
      icon: <FaChartLine className="text-green-400" size={16} />,
      label: "Team Volume",
      value: formatTON(user?.team_volume),
      suffix: "TON"
    },
    {
      icon: <FaCoins className="text-yellow-400" size={16} />,
      label: "Total Earned",
      value: formatTON(user?.total_earned),
      suffix: "TON"
    },
    {
      icon: <FaStar className="text-purple-400" size={16} />,
      label: "Weekly Bonus",
      value: formatTON(user?.expected_rank_bonus),
      suffix: `/ ${rankReq?.weeklyBonus || 15} TON`
    }
  ];

  const fetchReferralEarnings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .rpc('get_daily_referral_earnings', { 
          user_id: user.id,
          hours: 24
        });

      if (error) throw error;

      const earnings = (data as ReferralEarning[]).reduce<{ [key: number]: number }>((acc, curr) => ({
        ...acc,
        [curr.level]: curr.total
      }), {});

      setReferralEarnings(earnings);
    } catch (err) {
      console.error('Error fetching referral earnings:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReferralEarnings();
    const interval = setInterval(fetchReferralEarnings, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchReferralEarnings]);

  // Calculate daily earnings
  useEffect(() => {
    if (user?.id) {
      const calculateEarnings = async () => {
        await calculateReferralEarnings(user.id);
        await fetchReferralEarnings();
      };

      calculateEarnings();
      const dailyInterval = setInterval(calculateEarnings, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }
  }, [user?.id, fetchReferralEarnings]);

  const renderReferralIncome = () => (
    <div className="bg-black/20 rounded-lg border border-white/10 p-3">
      <div className="flex items-center gap-2 mb-3">
        <FaCoins className="text-yellow-400" size={16} />
        <span className="text-sm font-medium">Daily Referral Income</span>
      </div>
      <div className="grid gap-3">
        {Object.entries(REFERRAL_RATES).map(([key, { rate, label }], index) => (
          <ReferralIncomeCard
            key={key}
            level={index + 1}
            rate={rate}
            label={label}
            earnings={referralEarnings[index + 1]}
          />
        ))}
      </div>
      <div className="mt-3 p-2 bg-blue-500/10 rounded-lg">
        <div className="flex items-center gap-2">
          <FaUserPlus className="text-blue-400" size={14} />
          <span className="text-xs text-white/60">
            Earn up to 21% daily from your referral network
          </span>
        </div>
      </div>
    </div>
  );

  const levels = Object.entries(REFERRAL_RATES).map(([_, { rate }], index) => ({
    id: index + 1,
    label: `Level ${index + 1}`,
    reward: `${(rate * 100)}%`
  }));

  const renderRankProgression = () => <RankCarousel />;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      showSnackbar({
        message: 'Referral Link Copied!',
        description: 'Share it with your friends to earn rewards'
      });
    } catch (err) {
      showSnackbar({
        message: 'Failed to copy link',
        description: 'Please try again',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Stats */}
      <div className="flex items-center justify-between bg-black/20 rounded-lg border border-white/10 p-3">
        {isLoading ? (
          <div className="w-full flex justify-between animate-pulse">
            <div className="h-5 w-32 bg-white/10 rounded" />
            <div className="h-5 w-32 bg-white/10 rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <FaCrown className="text-yellow-500" size={16} />
              <span className="text-sm text-white/60">Rank</span>
              <span className="text-sm font-medium">{user?.rank || 'No rank'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUserPlus className="text-blue-400" size={16} />
              <span className="text-sm text-white/60">Upline:</span>
              <span className="text-sm font-medium">{user?.referrer?.username || 'No upline'}</span>
            </div>
          </>
        )}
      </div>

      {/* Referral Link Section */}
      <div className="bg-black/20 rounded-lg border border-white/10 p-3">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <FaUserPlus className="text-green-400" size={16} />
              <span className="text-sm text-white/60">Your Referral Link</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white/90"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="bg-black/20 rounded-lg border border-white/10 p-3">
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-xs text-white/60">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-medium">{stat.value}</span>
                {stat.suffix && (
                  <span className="text-xs text-white/60">{stat.suffix}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Available Earnings */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-white/10 p-3">
        <div className="flex items-center gap-2 mb-1">
          <FaCoins className="text-green-400" size={16} />
          <span className="text-sm text-white/60">Available Earnings</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-medium">{formatTON(user?.available_earnings)}</span>
          <span className="text-sm text-white/60">TON</span>
        </div>
      </div>

      {/* Referral List Section */}
      <div className="bg-black/20 rounded-lg border border-white/10">
        {/* Level Tabs */}
        <div className="flex overflow-x-auto">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeLevel === level.id
                  ? 'bg-blue-500 text-white'
                  : 'text-white/60 hover:bg-white/5'
              }`}
            >
              Level {level.id}
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 p-3 border-b border-white/10 text-sm text-white/60">
          <div>User</div>
          <div>Stake</div>
          <div>Reward</div>
        </div>

        {/* Referral List with Loading and Error States */}
        <div className="p-2 space-y-1">
          {isLoading ? (
            <>
              <ReferralRowSkeleton />
              <ReferralRowSkeleton />
              <ReferralRowSkeleton />
            </>
          ) : error ? (
            <div className="text-center py-8 text-sm text-red-400">{error}</div>
          ) : referrals.length > 0 ? (
            referrals.map((referral, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-2 rounded-lg hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    referral.is_active ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className="text-sm">{referral.username}</span>
                </div>
                <div className="text-sm">
                  {formatTON(referral.stake)} TON
                </div>
                <div className="text-sm">
                  {formatTON(referral.reward)} TON
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-white/40">
              No Level {activeLevel} referrals
            </div>
          )}
        </div>

        {/* Level Info */}
        <div className="p-3 border-t border-white/10 text-xs text-white/40">
          Level {activeLevel} Reward: {levels[activeLevel - 1].reward}
        </div>
      </div>

      {/* Add Referral Income Section */}
      {isLoading ? (
        <ReferralCardSkeleton />
      ) : (
        renderReferralIncome()
      )}

      {/* Rank Progression */}
      {isLoading ? (
        <ReferralCardSkeleton />
      ) : (
        renderRankProgression()
      )}
    </div>
  );
};

export default memo(ReferralSystem);