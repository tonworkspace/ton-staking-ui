import { FC, useState, useEffect } from 'react';
import { getTopReferrers } from '@/lib/supabaseClient';
import { FaUsers, FaCoins, FaChartLine } from 'react-icons/fa';

interface TopReferrer {
  username: string;
  photoUrl: string;
  referral_count: number;
  active_referrals: number;
  total_volume: number;
  total_earnings: number;
}

const TopReferrers: FC = () => {
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopReferrers = async () => {
      try {
        const data = await getTopReferrers(10);
        setTopReferrers(data);
      } catch (error) {
        console.error('Error fetching top referrers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopReferrers();
  }, []);

  if (isLoading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-[400px] bg-white/5 rounded-lg" />
    </div>
  );

  return (
    <div className="bg-black/20 rounded-lg border border-white/10">
      <div className="p-3 border-b border-white/10">
        <h2 className="text-lg font-semibold">Top Referrers</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-white/10">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Player</th>
              <th className="p-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <FaUsers className="w-3 h-3" />
                  <span>Referrals</span>
                </div>
              </th>
              <th className="p-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <FaChartLine className="w-3 h-3" />
                  <span>Active</span>
                </div>
              </th>
              <th className="p-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <FaCoins className="w-3 h-3" />
                  <span>Volume</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {topReferrers.map((referrer, index) => (
              <tr 
                key={referrer.username}
                className="text-sm border-b border-white/5 hover:bg-white/5"
              >
                <td className="p-3">
                  {index < 3 ? ['🥇','🥈','🥉'][index] : `#${index + 1}`}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={referrer.photoUrl} 
                      alt="" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">{referrer.username}</span>
                  </div>
                </td>
                <td className="p-3 text-right font-medium text-green-400">
                  {referrer.referral_count}
                </td>
                <td className="p-3 text-right font-medium text-blue-400">
                  {referrer.active_referrals}
                </td>
                <td className="p-3 text-right font-medium text-yellow-400">
                  {referrer.total_volume.toFixed(2)} TON
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopReferrers; 