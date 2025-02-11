import { FC } from 'react';
import {
  FaRocket,
  FaChartLine,
  FaLock,
  FaRoad,
} from 'react-icons/fa';
// import debounce from 'lodash/debounce';
// import { AuthUser, useAuth } from '@/hooks/useAuth';

interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  initialMarketCap: string;
  launchDate: string;
  description: string;
}

interface TokenDistribution {
  category: string;
  percentage: number;
  lockup?: string;
}

interface RoadmapItem {
  quarter: string;
  title: string;
  items: string[];
  status: 'completed' | 'in-progress' | 'upcoming';
}

export const TokenLaunchpad: FC = () => {
  // const { updateUserData } = useAuth();

  // const [network, setNetwork] = useState<{
  //   totalSize: number;
  //   activeMembers: number;
  //   totalVolume: number;
  //   maxDepth: number;
  // } | null>(null);

  const tokenInfo: TokenInfo = {
    name: "Stakers Token",
    symbol: "$STK",
    totalSupply: "1,000,000,000",
    initialMarketCap: "$50,000",
    launchDate: "2025-06-03",
    description: "Stakers Token (STK) is the governance and utility token powering the Stakers ecosystem, ensuring rewards, liquidity, and community engagement. With a total supply of 1 Billion tokens the updated token allocation ensures sustainability and growth."
  };

  const tokenDistribution: TokenDistribution[] = [
    { category: "Staking Rewards", percentage: 35, lockup: "No lockup" },
    { category: "Community Growth", percentage: 15, lockup: "2 years vesting" },
    { category: "Liquidity Pool", percentage: 20, lockup: "1 year vesting" },
    { category: "Team and Advisors", percentage: 10, lockup: "2 years vesting" },
    { category: "Partnerships and Marketing", percentage: 10, lockup: "1 year vesting" },
    { category: "Reserve Fund", percentage: 10, lockup: "2 years vesting" }
  ];

  const roadmap: RoadmapItem[] = [
    {
      quarter: "Q1 2025",
      title: "Platform Launch & Initial Growth",
      items: [
        "Launch Ton Stake It Platform & Website",
        "Implement Referral & Ranking Systems",
        "Begin Stakers Token Distribution"
      ],
      status: 'upcoming'
    },
    {
      quarter: "Q2 2025",
      title: "Token Launch & Community Building",
      items: [
        "Execute Community Airdrop Campaigns",
        "List $STK on DEX Platforms",
        "Strategic Influencer Partnerships"
      ],
      status: 'upcoming'

    },
    {
      quarter: "Q3 2025",
      title: "Mobile & Governance",
      items: [
        "Release TON Stake It Mobile App",
        "Implement $STK Governance System",
        "Expand TON Wallet Integration"
      ],
      status: 'upcoming'
    },
    {
      quarter: "Q4 2025",
      title: "Ecosystem Growth",
      items: [
        "Expand Global Partnerships",
        "Launch Special Staking Events",
        "Implement Sustainability Features"
      ],
      status: 'upcoming'
    },
    {
      quarter: "2026",
      title: "Gaming & Education",
      items: [
        "Launch P2E Gaming Platform",
        "Develop Blockchain Education Hub",
        "Implement Cross-chain Features"
      ],
      status: 'upcoming'
    },
    {
      quarter: "2027",
      title: "Ecosystem Maturity",
      items: [
        "Launch NFT Marketplace",
        "Advanced Staking Mechanisms",
        "Institutional Partnership Program",
        "Global Staking Leadership"
      ],
      status: 'upcoming'
    }
  ];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'TBA';
    }
  };

  // // Memoized network stats
  // const networkStats = useMemo(() => {
  //   if (!network) return null;
  //   return {
  //     totalSize: network.totalSize,
  //     activeMembers: network.activeMembers,
  //     totalVolume: network.totalVolume,
  //     maxDepth: network.maxDepth
  //   };
  // }, [network]);

  // // Debounced update function
  // const handleUpdate = useCallback(
  //   debounce((newData: Partial<AuthUser>) => {
  //     updateUserData(newData);
  //   }, 500),
  //   [updateUserData]
  // );

  // useEffect(() => {
  //   // Example network data update
  //   setNetwork({
  //     totalSize: 1000,
  //     activeMembers: 750,
  //     totalVolume: 50000,
  //     maxDepth: 5
  //   });
  // }, []); // Empty dependency array for initial load only

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden px-2 sm:px-4 b-custom">
      {/* Network Stats Display
      {networkStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400">Total Size</p>
            <p className="text-xl font-bold">{networkStats.totalSize}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400">Active Members</p>
            <p className="text-xl font-bold">{networkStats.activeMembers}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400">Total Volume</p>
            <p className="text-xl font-bold">{networkStats.totalVolume}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-gray-400">Max Depth</p>
            <p className="text-xl font-bold">{networkStats.maxDepth}</p>
          </div>
        </div>
      )}

      // 
      // <button 
      //   onClick={() => handleUpdate({ total_earned: 100 })}
      //   className="bg-blue-500 px-4 py-2 rounded"
      // >
      //   Update Stats
      // </button> */}

      {/* Token Overview Card */}
      <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl self-start">
            <FaRocket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div className="flex-1 w-full">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{tokenInfo.name}</h1>
            <p className="text-sm sm:text-base text-gray-400 mb-4">{tokenInfo.description}</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-black/20 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Symbol</p>
                <p className="text-base sm:text-lg font-semibold">{tokenInfo.symbol}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Supply</p>
                <p className="text-base sm:text-lg font-semibold">{tokenInfo.totalSupply}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Initial MCap</p>
                <p className="text-base sm:text-lg font-semibold">{tokenInfo.initialMarketCap}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Launch Date</p>
                <p className="text-base sm:text-lg font-semibold">
                  {formatDate(tokenInfo.launchDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tokenomics Section */}
      <div className="bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Tokenomics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {tokenDistribution.map((item, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-base sm:text-lg font-bold">{item.percentage}%</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{item.category}</p>
                {item.lockup && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mt-1">
                    <FaLock className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.lockup}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Section - Compact & Beautiful */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg backdrop-blur-sm">
            <FaRoad className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Roadmap
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roadmap.map((phase, index) => (
            <div 
              key={index} 
              className="relative group p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="px-2.5 py-1 bg-purple-500/10 rounded-lg">
                  <span className="text-sm font-medium text-purple-400">{phase.quarter}</span>
                </div>
                <div className="h-px flex-grow bg-gradient-to-r from-purple-500/20 to-transparent" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-200 mb-3">
                {phase.title}
              </h3>
              
              <div className="space-y-2">
                {phase.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 group/item"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400/50 mt-1.5 group-hover/item:bg-purple-400 transition-colors" />
                    <span className="text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="absolute inset-px rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 