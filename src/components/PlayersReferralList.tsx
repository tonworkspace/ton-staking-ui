import { FC, useState, useEffect } from 'react';
import { getAllPlayersWithReferrals } from '@/lib/supabaseClient';
import { FaUsers, FaCoins, FaChartLine } from 'react-icons/fa';

interface Referral {
  id: number;
  username: string;
  telegram_id: string;
  total_deposit: number;
  is_active: boolean;
  joined_date: string;
}

interface Player {
  id: number;
  username: string;
  photoUrl: string;
  telegram_id: string;
  rank: string;
  total_deposit: number;
  total_earned: number;
  team_volume: number;
  referrals: {
    total: number;
    active: number;
    list: Referral[];
  };
}

const PlayersReferralList: FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await getAllPlayersWithReferrals();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (isLoading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-[400px] bg-white/5 rounded-lg" />
    </div>
  );

  return (
    <div className="bg-black/20 rounded-lg border border-white/10">
      <div className="p-3 border-b border-white/10">
        <h2 className="text-lg font-semibold">Players & Referrals</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-white/10">
              <th className="p-3 text-left">Player</th>
              <th className="p-3 text-center">Rank</th>
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
                  <span>Team Volume</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <>
                <tr 
                  key={player.id}
                  className="text-sm border-b border-white/5 hover:bg-white/5 cursor-pointer"
                  onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img 
                        src={player.photoUrl} 
                        alt="" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-medium">{player.username}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-white/10">
                      {player.rank}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-green-400">
                    {player.referrals.total}
                  </td>
                  <td className="p-3 text-right font-medium text-blue-400">
                    {player.referrals.active}
                  </td>
                  <td className="p-3 text-right font-medium text-yellow-400">
                    {player.team_volume.toFixed(2)} TON
                  </td>
                </tr>
                {expandedPlayer === player.id && player.referrals.list.length > 0 && (
                  <tr>
                    <td colSpan={5} className="bg-white/5 p-4">
                      <div className="text-sm font-medium mb-2">Referral List:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {player.referrals.list.map((referral) => (
                          <div 
                            key={referral.id}
                            className="flex items-center justify-between p-2 rounded bg-black/20"
                          >
                            <div>
                              <div className="font-medium">{referral.username}</div>
                              <div className="text-xs text-gray-400">
                                Joined: {new Date(referral.joined_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-400">{referral.total_deposit.toFixed(2)} TON</div>
                              <div className="text-xs">
                                {referral.is_active ? (
                                  <span className="text-green-400">Active</span>
                                ) : (
                                  <span className="text-red-400">Inactive</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersReferralList; 