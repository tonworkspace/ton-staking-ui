import { useEffect, useState, useMemo } from 'react';
import { supabase, gmpSystem } from '@/lib/supabaseClient';
import useAuth from '@/hooks/useAuth';
import { FaTrophy, FaCoins, } from 'react-icons/fa';
import { getTONPrice } from '@/lib/api';

interface GMPEntry {
  position: number;
  username: string;
  pool_share: number;
  expected_reward: number;
}

const formatReward = (value: number | undefined): string => {
  if (!value || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const GMPLeaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GMPEntry[]>([]);
  const [userStats, setUserStats] = useState({
    position: '-',
    shares: 0,
    reward: 0,
    totalShares: 0,
    poolSize: 0
  });
  const [, setTonPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Add caching mechanism
  const cacheKey = useMemo(() => `gmp_data_${user?.id}`, [user?.id]);
  const cacheDuration = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const fetchGMPData = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheDuration) {
            setEntries(data.entries);
            setUserStats(data.userStats);
            setTonPrice(data.tonPrice);
            setIsLoading(false);
            return;
          }
        }

        // Fetch data in parallel
        const [price, poolStats, leaderboardData] = await Promise.all([
          getTONPrice(),
          gmpSystem.getPoolStats(),
          supabase
            .from('users')
            .select('username, total_sbt, id')
            .order('total_sbt', { ascending: false })
            .limit(100)
        ]);

        setTonPrice(price);

        if (user?.id) {
          const stats = await gmpSystem.getUserPoolShare(user.id);
          
          // Ensure we're using the correct pool size from poolStats
          const poolSize = poolStats?.totalPool || 0; // Adjust this based on your actual API response

          const newUserStats = {
            position: '-',
            shares: stats.sbt,
            reward: stats.estimatedReward,
            totalShares: stats.totalSBT,
            poolSize: poolSize // Use the pool size from poolStats
          };
          setUserStats(newUserStats);

          // Format leaderboard entries
          const formattedEntries = (leaderboardData.data || []).map((entry, index) => ({
            position: index + 1,
            username: entry.username,
            pool_share: entry.total_sbt || 0,
            expected_reward: ((entry.total_sbt || 0) / (stats.totalSBT || 1)) * poolSize
          }));

          setEntries(formattedEntries);

          // Cache the results
          localStorage.setItem(cacheKey, JSON.stringify({
            data: {
              entries: formattedEntries,
              userStats: newUserStats,
              tonPrice: price
            },
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error fetching GMP data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGMPData();

    // Set up auto-refresh interval
    const refreshInterval = setInterval(fetchGMPData, cacheDuration);
    return () => clearInterval(refreshInterval);
  }, [user, cacheKey]);

  // Add error boundary
  if (!user?.id) {
    return (
      <div className="bg-black/20 rounded-xl p-2.5 flex flex-col h-full">
        {/* Connection Required Skeleton */}
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 bg-white/10 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-black/20 rounded-xl p-2.5 flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-1.5 rounded-lg animate-pulse">
              <div className="w-3.5 h-3.5" />
            </div>
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-black/20 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-3 h-3 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Leaderboard Skeleton */}
        <div className="bg-black/20 rounded-lg overflow-hidden flex-1 flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-xs px-2 py-1.5 border-b border-white/5 bg-white/5">
            <div className="col-span-1">#</div>
            <div className="col-span-5">User</div>
            <div className="col-span-3">Shares</div>
            <div className="col-span-3">Reward</div>
          </div>
          
          {/* Loading Rows */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className="grid grid-cols-12 text-xs px-2 py-1.5 border-b border-white/5"
              >
                <div className="col-span-1">
                  <div className="h-3 w-3 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="col-span-5">
                  <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="col-span-3">
                  <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="col-span-3">
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-white';
    }
  };

  return (
    <div className="bg-black/20 rounded-xl p-2.5 flex flex-col h-full max-h-[calc(100vh-120px)]">
      {/* Stats Row - Compact */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <div className="bg-black/20 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <FaTrophy className="text-yellow-400 w-3 h-3" />
            <span className="text-xs text-gray-400">Position</span>
          </div>
          <div className="text-sm font-medium text-white">{userStats.position}</div>
        </div>
        <div className="bg-black/20 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <FaCoins className="text-blue-400 w-3 h-3" />
            <span className="text-xs text-gray-400">Shares</span>
          </div>
          <div className="text-sm font-medium text-white">
            {userStats.shares?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-2">
          <div className="text-xs text-gray-400 mb-1">Estimated Reward</div>
          <div className="text-sm font-medium text-white">
            {formatReward(userStats.reward)}
          </div>
        </div>
      </div>

      {/* Leaderboard - Flexible Height */}
      <div className="bg-black/20 rounded-lg overflow-hidden flex-1 flex flex-col">
        {/* Table Header - Fixed */}
        <div className="grid grid-cols-12 text-xs text-gray-400 px-2 py-1.5 border-b border-white/5 bg-white/5">
          <div className="col-span-1">#</div>
          <div className="col-span-5">User</div>
          <div className="col-span-3">Shares</div>
          <div className="col-span-3">Reward</div>
        </div>
        
        {/* Table Body - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {entries.map((entry) => (
            <div 
              key={entry.username}
              className={`grid grid-cols-12 text-xs px-2 py-1.5 ${
                user?.username === entry.username 
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-white hover:bg-white/5'
              }`}
            >
              <div className={`col-span-1 ${getPositionColor(entry.position)}`}>
                {entry.position <= 3 ? ['👑', '🥈', '🥉'][entry.position - 1] : entry.position}
              </div>
              <div className="col-span-5 flex items-center gap-1 truncate">
                <span className="truncate">{entry.username}</span>
                {user?.username === entry.username && (
                  <span className="flex-shrink-0 text-[10px] bg-blue-500/20 px-1 py-0.5 rounded">You</span>
                )}
              </div>
              <div className="col-span-3">{entry.pool_share?.toLocaleString() || '0'}</div>
              <div className="col-span-3">
                {formatReward(entry.expected_reward)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function(): number {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export default GMPLeaderboard;