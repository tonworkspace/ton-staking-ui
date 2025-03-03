// import React, { useState, useEffect, useCallback } from 'react';
// import { List } from '@telegram-apps/telegram-ui';
// import { AiOutlineHome, AiOutlineSchedule } from 'react-icons/ai';
// import { BiTrophy } from 'react-icons/bi';
// import { BsCoin } from 'react-icons/bs';
// import { FaWallet } from 'react-icons/fa';
// import useAuth from '@/hooks/useAuth';
// import LoadingSplashScreen from '@/components/LoadingSplashScreen';
// import { ErrorBoundary } from '@/components/ErrorBoundary';
// import ErrorPage from '@/components/ErrorPage';
// import { ProfileHeader } from '@/components/ProfileHeader';
// import { getLevel } from '@/gameData';
// import { SmoothNumber } from '@/components/SmoothNumber';
// import { MiningCard } from '@/components/MiningCard';

// const tabs = [
//   { id: 'home', text: 'Home', Icon: AiOutlineHome },
//   { id: 'task', text: 'Task', Icon: AiOutlineSchedule },
//   { id: 'rank', text: 'Rank', Icon: BiTrophy },
//   { id: 'earn', text: 'Earn', Icon: BsCoin },
//   { id: 'token', text: 'Token', Icon: FaWallet }
// ];

// const levelNames = [
//   "Nova Initiate",      // Starting level
//   "Stellar Scout",      // Early progress
//   "Cosmic Pioneer",     // Getting established
//   "Nebula Explorer",    // Solid progress
//   "Galaxy Voyager",     // Experienced
//   "Solar Guardian",     // Advanced
//   "Celestial Master",   // Expert
//   "Astral Lord",        // Elite
//   "Nova Commander",     // Near-top
//   "Quantum Sovereign"   // Ultimate rank
// ];

// const levelMinPoints = [
//   0,              // Nova Initiate
//   5000,           // Stellar Scout
//   25000,          // Cosmic Pioneer
//   100000,         // Nebula Explorer
//   1000000,        // Galaxy Voyager
//   2000000,        // Solar Guardian
//   10000000,       // Celestial Master
//   50000000,       // Astral Lord
//   100000000,      // Nova Commander
//   1000000000      // Quantum Sovereign
// ];

// const formatNumber = (num: number) => {
//   if (num >= 1000000000) {
//     return `${(num / 1000000000).toFixed(1)}B`;
//   } else if (num >= 1000000) {
//     return `${(num / 1000000).toFixed(1)}M`;
//   } else if (num >= 1000) {
//     return `${(num / 1000).toFixed(1)}K`;
//   }
//   return num.toLocaleString();
// };

// const formatCompactNumber = (num: number): string => {
//   if (num >= 1_000_000) {
//     return `${Number((num / 1_000_000).toFixed(5))}M`;
//   } else if (num >= 1_000) {
//     return `${Number((num / 1_000).toFixed(5))}K`;
//   }
//   return Number(num.toFixed(5)).toString();
// };

// // First, let's extract the rate calculations into constants at the top level
// const DAILY_MINING_RATE = 0.20; // Increase to 20% daily rate
// const STAKING_MULTIPLIER_RATE = 0.01; // Increase to 1% per 100 TON staked

// // Add these constants at the top
// const BOOST_MULTIPLIER = 2; // 2x mining rate when boosted
// const BOOST_DURATION = 30; // 30 seconds boost duration
// const BOOST_COOLDOWN = 300; // 5 minutes cooldown

// // Add these constants at the top level
// const DAILY_BASE_REWARD = 50; // Base NOVA reward for daily login (reduced from 1000)
// const STREAK_MILESTONES = [
//   { days: 1, multiplier: 1.0 },    // 50 NOVA
//   { days: 3, multiplier: 1.2 },    // 60 NOVA
//   { days: 7, multiplier: 1.5 },    // 75 NOVA
//   { days: 14, multiplier: 1.8 },   // 90 NOVA
//   { days: 30, multiplier: 2.0 },   // 100 NOVA
//   { days: 60, multiplier: 2.2 },   // 110 NOVA
//   { days: 90, multiplier: 2.5 },   // 125 NOVA
//   { days: 180, multiplier: 2.8 },  // 140 NOVA
//   { days: 365, multiplier: 3.0 },  // 150 NOVA
// ];


// // Add this helper function after the constants
// const calculateDailyReward = (streak: number): { reward: number; multiplier: number } => {
//   const milestone = [...STREAK_MILESTONES]
//     .reverse()
//     .find(m => streak >= m.days) || STREAK_MILESTONES[0];

//   return {
//     reward: DAILY_BASE_REWARD * milestone.multiplier,
//     multiplier: milestone.multiplier
//   };
// };

// export const IndexPage: React.FC = () => {
//   const { user, isLoading: isAuthLoading, error: authError, playerData, lastLoginTime } = useAuth();
//   const levelInfo = playerData ? getLevel(playerData.balance) : null;
//   const [currentTab, setCurrentTab] = useState(tabs[0].id);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showRankModal, setShowRankModal] = useState(false);

//   // Remove localStorage initialization, use simple state instead
//   const [miningBalance, setMiningBalance] = useState<number>(0);
//   const [displayStreak, setDisplayStreak] = useState(0);
//   const [isMiningActive, setIsMiningActive] = useState<boolean>(false);
//   const [stakingBalance, setStakingBalance] = useState<number>(0);
//   const [playerBalance, setPlayerBalance] = useState<number>(0);

//   const initializeData = useCallback(async () => {
//     if (!user) return;
    
//     setIsLoading(true);
//     try {
//       // Initialize your app data here
      
//     } catch (err) {
//       console.error('Failed to initialize data:', err);
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     initializeData();
//   }, [initializeData]);

//   const [notifications, setNotifications] = useState<Array<{
//     id: string;
//     type: 'success' | 'info' | 'warning';
//     message: string;
//     subMessage?: string;
//     icon?: string;
//   }>>([]);

//   // Update the calculatePerSecondRate function to be more explicit
//   const calculatePerSecondRate = (amount: number, stakingMultiplier: number = 1) => {
//     const dailyRate = amount * DAILY_MINING_RATE; // 5% daily
//     return (dailyRate * stakingMultiplier) / 86400; // Convert daily to per-second
//   };

//   // Add a helper function for staking calculations
//   const calculateStakingMultiplier = (stakingBalance: number) => {
//     return 1 + (stakingBalance / 100) * STAKING_MULTIPLIER_RATE;
//   };

//   const calculateLevel = (balance: number) => {
//     let level = 0;
//     for (let i = levelMinPoints.length - 1; i >= 0; i--) {
//       if (balance >= levelMinPoints[i]) {
//         level = i;
//         break;
//       }
//     }
//     return level;
//   };

//   const calculateProgress = (balance: number) => {
//     const currentLevel = calculateLevel(balance);
//     if (currentLevel === levelMinPoints.length - 1) return 100;
//     const currentMin = levelMinPoints[currentLevel];
//     const nextMin = levelMinPoints[currentLevel + 1];
//     const progress = ((balance - currentMin) / (nextMin - currentMin)) * 100;
//     return Math.min(Math.max(progress, 0), 100);
//   };

//   const levelIndex = calculateLevel(playerBalance);
//   const levelProgress = calculateProgress(playerBalance);

//   // Notification handler
//   const addNotification = useCallback((notification: {
//     type: 'success' | 'info' | 'warning';
//     message: string;
//     subMessage?: string;
//     icon?: string;
//   }) => {
//     const id = Math.random().toString(36).substr(2, 9);
//     setNotifications(prev => [...prev, { ...notification, id }]);
    
//     // Auto-remove notification after 5 seconds
//     setTimeout(() => {
//       setNotifications(prev => prev.filter(n => n.id !== id));
//     }, 5000);
//   }, []);

//   // Add these to your component state
//   const [isBoostActive, setIsBoostActive] = useState(false);
//   const [boostCooldown, setBoostCooldown] = useState(0);
//   const [boostTimeLeft, setBoostTimeLeft] = useState(0);


//   // Update the mining effect to be smoother
//   useEffect(() => {
//     if (!isMiningActive || miningBalance <= 0) return;

//     const stakingMultiplier = calculateStakingMultiplier(stakingBalance);
//     let perSecondRate = calculatePerSecondRate(miningBalance, stakingMultiplier);
    
//     if (isBoostActive) {
//       perSecondRate *= BOOST_MULTIPLIER;
//     }
    
//     let lastUpdate = performance.now();
//     let accumulatedPoints = 0;
    
//     const updatePoints = (timestamp: number) => {
//       const elapsedMs = timestamp - lastUpdate;
//       const earned = (perSecondRate * elapsedMs) / 1000;
//       accumulatedPoints += earned;
      
//       // Update more frequently (every 100ms) for smoother animation
//       if (accumulatedPoints >= perSecondRate / 10) {
//         setPlayerBalance(prev => {
//           const newBalance = Number((prev + accumulatedPoints).toFixed(5));
//           return newBalance;
//         });
//         accumulatedPoints = 0;
//       }
      
//       lastUpdate = timestamp;
//       return requestAnimationFrame(updatePoints);
//     };

//     const animationId = requestAnimationFrame(updatePoints);
    
//     return () => {
//       cancelAnimationFrame(animationId);
//       // Apply any remaining accumulated points before cleanup
//       if (accumulatedPoints > 0) {
//         setPlayerBalance(prev => {
//           const newBalance = Number((prev + accumulatedPoints).toFixed(5));
//           return newBalance;
//         });
//       }
//     };
//   }, [isMiningActive, miningBalance, stakingBalance, isBoostActive]);

//   // Add boost timer effect
//   useEffect(() => {
//     if (!isBoostActive) return;

//     const startTime = Date.now();
//     const timer = setInterval(() => {
//       const elapsed = Math.floor((Date.now() - startTime) / 1000);
//       const remaining = BOOST_DURATION - elapsed;

//       if (remaining <= 0) {
//         setIsBoostActive(false);
//         setBoostTimeLeft(0);
//         setBoostCooldown(BOOST_COOLDOWN);
//         addNotification({
//           type: 'info',
//           message: 'Boost Ended',
//           subMessage: 'Mining rate returned to normal',
//           icon: '⚡'
//         });
//         clearInterval(timer);
//       } else {
//         setBoostTimeLeft(remaining);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [isBoostActive]);

//   // Add cooldown timer effect
//   useEffect(() => {
//     if (boostCooldown <= 0) return;

//     const timer = setInterval(() => {
//       setBoostCooldown(prev => {
//         const newCooldown = prev - 1;
//         if (newCooldown <= 0) {
//           addNotification({
//             type: 'success',
//             message: 'Boost Ready',
//             subMessage: 'You can now use mining boost again!',
//             icon: '🚀'
//           });
//           clearInterval(timer);
//         }
//         return newCooldown;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [boostCooldown]);

//   // Add this function to handle boost activation
//   const activateBoost = () => {
//     if (isBoostActive || boostCooldown > 0) return;
    
//     // Here you can add your purchase logic
//     // For example, check if player has enough currency
//     const boostCost = 100; // Cost in NOVA tokens
    
//     if (playerBalance >= boostCost) {
//       setPlayerBalance(prev => prev - boostCost);
//       setIsBoostActive(true);
//       setBoostTimeLeft(BOOST_DURATION);
      
//       addNotification({
//         type: 'success',
//         message: 'Boost Activated!',
//         subMessage: `${BOOST_MULTIPLIER}x mining rate for ${BOOST_DURATION} seconds`,
//         icon: '🚀'
//       });
//     } else {
//       addNotification({
//         type: 'warning',
//         message: 'Insufficient Balance',
//         subMessage: `Need ${boostCost} NOVA to activate boost`,
//         icon: '⚠️'
//       });
//     }
//   };

//   // Add debug logging for streak updates
//   useEffect(() => {
//     if (!playerData) return;

//     const now = Date.now();
//     const hoursSinceLastLogin = (now - lastLoginTime) / (1000 * 60 * 60);

//     // Initialize streak display
//     setDisplayStreak(playerData.loginStreak || 0);

//     if (hoursSinceLastLogin > 20) {
//       const { reward, multiplier } = calculateDailyReward(playerData.loginStreak || 0);
      
//       // Show appropriate milestone message
//       const milestone = STREAK_MILESTONES.find(m => m.days === playerData.loginStreak);
//       if (milestone) {
//         addNotification({
//           type: 'success',
//           message: `🎉 Milestone Reached: ${milestone.days} Days!`,
//           subMessage: `Reward multiplier increased to ${milestone.multiplier}x`,
//           icon: '🏆'
//         });
//       }
      
//       addNotification({
//         type: 'success',
//         message: `${playerData.loginStreak} Day Streak! 🔥`,
//         subMessage: `Earned ${formatNumber(reward)} NOVA (${multiplier}x bonus)`,
//         icon: '🏆'
//       });
//     }
//   }, [playerData, lastLoginTime, addNotification]);

//   if (isAuthLoading || isLoading) {
//     return <LoadingSplashScreen />;
//   }

//   if (authError || error) {
//     return <div>Error: {authError || error}</div>;
//   }

//   if (!user) {
//     return <div>No user data available</div>;
//   }

//   const renderRankModal = () => {
//     if (!showRankModal) return null;

//     return (
//       <div 
//         className="fixed inset-0 bg-black/95 flex items-end sm:items-center justify-center z-50 
//                    animate-fade-in backdrop-blur-md px-2 sm:px-4"
//         onClick={() => setShowRankModal(false)}
//       >
//         <div 
//           className="bg-[#0A0A0C] rounded-t-[2rem] sm:rounded-2xl 
//                      w-full max-w-sm h-[85vh] sm:h-[80vh]
//                      flex flex-col
//                      animate-slide-up sm:animate-scale-up
//                      border border-white/10 shadow-[0_0_50px_-12px] shadow-blue-500/20"
//           onClick={e => e.stopPropagation()}
//         >
//           {/* Fixed Header */}
//           <div className="relative px-4 py-6 text-center bg-[#0A0A0C] border-b border-white/5">
//             <h3 className="text-lg font-bold text-white/90">Nova Ranks</h3>
//             <p className="text-xs text-gray-500 mt-0.5">Progress to Quantum Sovereign</p>
//             <button 
//               onClick={() => setShowRankModal(false)}
//               className="absolute right-3 top-3 p-2 hover:bg-white/5 rounded-full 
//                          transition-colors duration-200"
//             >
//               <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {/* Scrollable Content */}
//           <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
//             {/* Current Level Highlight - Sticky */}
//             <div className="sticky top-0 px-4 py-4 bg-[#0A0A0C]/80 backdrop-blur-sm z-10">
//               <div className="bg-gradient-to-br from-blue-500/20 to-blue-400/5 rounded-xl p-4 border border-blue-500/30">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 
//                                 flex items-center justify-center shadow-lg shadow-blue-500/20">
//                     <span className="text-lg font-bold">{levelIndex + 1}</span>
//                   </div>
//                   <div>
//                     <div className="font-bold text-white">{levelNames[levelIndex]}</div>
//                     <div className="text-xs text-blue-300/80">
//                       {formatNumber(playerBalance)} / {formatNumber(levelMinPoints[levelIndex + 1])} NOVA
//                     </div>
//                   </div>
//                 </div>
//                 {/* Progress Bar */}
//                 <div className="mt-3">
//                   <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
//                     <div 
//                       className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
//                       style={{ 
//                         width: `${(playerBalance - levelMinPoints[levelIndex]) / 
//                           (levelMinPoints[levelIndex + 1] - levelMinPoints[levelIndex]) * 100}%` 
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Rank List */}
//             <div className="px-4 pb-6 space-y-2">
//               {levelNames.map((name, index) => (
//                 <div 
//                   key={index} 
//                   className={`relative rounded-lg p-2.5 flex items-center gap-3
//                     ${index === levelIndex 
//                       ? 'bg-blue-500/20 border border-blue-500/30' 
//                       : index < levelIndex 
//                         ? 'bg-white/5 opacity-60' 
//                         : 'bg-white/[0.02] border border-white/[0.05]'}
//                     transition-all duration-200 hover:bg-white/[0.03]`}
//                 >
//                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
//                     ${index === levelIndex 
//                       ? 'bg-blue-500' 
//                       : index < levelIndex 
//                         ? 'bg-white/10' 
//                         : 'bg-white/5'}`}>
//                     {index + 1}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="font-medium text-sm truncate">{name}</div>
//                     <div className="text-xs text-gray-500">
//                       {formatNumber(levelMinPoints[index])} NOVA
//                     </div>
//                   </div>
//                   {index === levelIndex && (
//                     <span className="absolute right-2 top-2 text-[10px] px-1.5 py-0.5 
//                                    rounded-full bg-blue-500/30 text-blue-300 border border-blue-500/30">
//                       CURRENT
//                     </span>
//                   )}
//                   {index < levelIndex && (
//                     <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <ErrorBoundary fallback={<ErrorPage message="Something went wrong. Please try again later." />}>
//       <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
//         <ProfileHeader
//           photoUrl={user?.photoUrl}
//           username={playerData?.username}
//           firstName={playerData?.firstName}
//           lastName={playerData?.lastName}
//           levelInfo={levelInfo ? { name: levelInfo.name, level: levelInfo.level } : undefined}
//           showBoostButton={true}
//           onBoostClick={() => {/* your boost click handler */}}
//         />
//         <List>
//           {currentTab === 'home' && (
//             <div className="p-2 sm:p-6 space-y-6 max-w-md mx-auto w-full mb-20">
//                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4 shadow-lg hover:bg-white/10 transition-all duration-300">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-400 font-medium">Daily Streak</span>
//                   <div className="flex items-center gap-2">
//                     <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold">
//                       🔥 {displayStreak} days
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             <div className="flex flex-col items-center mt-20">
//                 <div className="relative w-32 h-32 mb-4 cursor-pointer group">
//                   {/* Orbital rings */}
//                   <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-orbit" style={{ transform: 'rotate3d(1, 1, 1, 45deg)' }}></div>
//                   <div className="absolute inset-2 rounded-full border-2 border-cyan-400/20 animate-orbit-reverse" style={{ transform: 'rotate3d(1, -1, 1, -45deg)' }}></div>
                  
//                   {/* Glowing sphere core */}
//                   <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 animate-pulse-slow">
//                     <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,190,255,0.5),transparent_70%)]"></div>
//                   </div>
                  
//                   {/* Interactive globe surface */}
//                   <div className="absolute inset-4 rounded-full backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 overflow-hidden group-hover:from-white/20 transition-all duration-300">
//                     {/* Grid pattern */}
//                     <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_1px,rgba(255,255,255,0.1)_2px)] bg-[size:10px_10px] animate-grid-scroll"></div>
//                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_1px,rgba(255,255,255,0.1)_2px)] bg-[size:10px_10px] animate-grid-scroll-horizontal"></div>
                    
//                     {/* Energy particles */}
//                     <div className="absolute inset-0">
//                       {Array.from({ length: 6 }).map((_, i) => (
//                         <div
//                           key={i}
//                           className="absolute w-1 h-1 bg-blue-400 rounded-full animate-particle"
//                           style={{
//                             top: `${Math.random() * 100}%`,
//                             left: `${Math.random() * 100}%`,
//                             animationDelay: `${i * 0.5}s`
//                           }}
//                         ></div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   {/* Status indicator */}
//                   <div className={`absolute inset-0 flex items-center justify-center z-10 ${isMiningActive ? 'text-green-400' : 'text-blue-400'}`}>
//                     <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
//                       {isMiningActive ? 'ACTIVE' : 'NOVA'}
//                     </span>
//                   </div>
                  
//                   {/* Hover effect ring */}
//                   <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping"></div>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-1 text-center">
//                   <div className="text-6xl font-bold mb-1">
//                     <SmoothNumber 
//                       value={playerBalance} 
//                       formatter={formatCompactNumber}
//                       duration={800} // Adjust animation duration
//                       decimals={5}  // Match the precision we're using
//                     />
//                   </div>
//                   <div className="text-white text-2xl">NOVA</div>
//                 </div>
//             </div>
//             <div 
//               onClick={() => setShowRankModal(true)}
//               className="group flex items-center justify-between w-full 
//                          px-5 py-3.5 mt-4 
//                          bg-gradient-to-r from-white/[0.03] to-white/[0.08]
//                          hover:from-white/[0.05] hover:to-white/[0.1]
//                          border border-white/10 hover:border-white/20
//                          rounded-2xl backdrop-blur-sm
//                          transition-all duration-300 ease-out
//                          cursor-pointer shadow-lg hover:shadow-blue-500/10"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center justify-center w-10 h-10 
//                                bg-gradient-to-br from-blue-500/20 to-cyan-500/20 
//                                rounded-xl border border-white/10">
//                   <span className="text-lg">✨</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm text-gray-400 font-medium">Current Rank</span>
//                   <span className="text-base font-semibold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
//                     {levelNames[levelIndex]}
//                   </span>
//                   <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
//                     <div 
//                       className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
//                       style={{ width: `${levelProgress}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="px-2.5 py-1 text-xs font-medium text-gray-400
//                                bg-white/5 rounded-full border border-white/10">
//                   Level {levelIndex + 1}/{levelNames.length}
//                 </span>
//                 <svg 
//                   className="w-5 h-5 text-gray-400 transform transition-transform 
//                              group-hover:translate-x-0.5 group-hover:text-gray-300" 
//                   fill="none" 
//                   viewBox="0 0 24 24" 
//                   stroke="currentColor"
//                 >
//                   <path 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round" 
//                     strokeWidth={1.5} 
//                     d="M9 5l7 7-7 7" 
//                   />
//                 </svg>
//               </div>
//             </div>
//                {/* Mining Card */}
//                <MiningCard
//                 type="mining"
//                 balance={miningBalance}
//                 rate={calculatePerSecondRate(miningBalance, calculateStakingMultiplier(stakingBalance)) * 86400} // Daily rate
//                 isActive={isMiningActive}
//                 stakingBonus={calculateStakingMultiplier(stakingBalance) - 1} // Convert to percentage
//                 onActivate={() => {
//                   setIsMiningActive(!isMiningActive);
//                   addNotification({
//                     type: !isMiningActive ? 'success' : 'info',
//                     message: !isMiningActive ? 'Mining Started' : 'Mining Paused',
//                     subMessage: !isMiningActive ? 'Earning NOVA...' : 'Click to resume',
//                     icon: !isMiningActive ? '⚡' : '⏸️'
//                   });
//                 }}
//                 onDeposit={(amount) => {
//                   setMiningBalance(prev => prev + amount);
//                   setIsMiningActive(true);
//                   addNotification({
//                     type: 'success',
//                     message: 'Deposit Successful',
//                     subMessage: `Added ${amount} TON to mining`,
//                     icon: '⚡'
//                   });
//                 }}
//                 onWithdraw={(amount) => {
//                   if (amount <= miningBalance) {
//                     setMiningBalance(prev => prev - amount);
//                     addNotification({
//                       type: 'info',
//                       message: 'Withdrawal Successful',
//                       subMessage: `Withdrew ${amount} TON from mining`,
//                       icon: '💎'
//                     });
//                   }
//                 }}
//               />
//             </div>
//           )}
//           {/* Add more tab content as needed */}
//         </List>


//         <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur-md border-t border-white/10">
//           <div className="max-w-md mx-auto">
//             <div className="grid grid-cols-5">
//               {tabs.map(({ id, text, Icon }) => (
//                 <button 
//                   key={id} 
//                   onClick={() => setCurrentTab(id)}
//                   className={`flex flex-col items-center py-3 transition-colors ${
//                     currentTab === id 
//                       ? 'text-blue-400 bg-white/5' 
//                       : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
//                   }`}
//                 >
//                   <Icon className="text-xl mb-1" />
//                   <span className="text-[10px] font-medium">
//                     {text}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {renderRankModal()}

//         {/* Notifications */}
//         <div className="fixed bottom-20 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-50">
//           {notifications.map(({ id, type, message, subMessage, icon }) => (
//             <div 
//               key={id}
//               className={`
//                 px-4 py-2 rounded-lg shadow-lg 
//                 animate-slide-up backdrop-blur-md
//                 ${type === 'success' ? 'bg-green-500/20 border border-green-500/30' :
//                   type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30' :
//                   'bg-blue-500/20 border border-blue-500/30'}
//               `}
//             >
//               <div className="flex items-center gap-2">
//                 {icon && <span className="text-lg">{icon}</span>}
//                 <div>
//                   <div className="font-medium text-white">{message}</div>
//                   {subMessage && <div className="text-xs text-white/70">{subMessage}</div>}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Add a boost button to your UI */}
//         <button
//           onClick={activateBoost}
//           disabled={isBoostActive || boostCooldown > 0}
//           className={`
//             px-4 py-2 rounded-lg font-medium
//             flex items-center gap-2
//             ${isBoostActive 
//               ? 'bg-green-500/20 text-green-400' 
//               : boostCooldown > 0
//                 ? 'bg-gray-500/20 text-gray-400'
//                 : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}
//           `}
//         >
//           {isBoostActive ? (
//             <>
//               🚀 Boosted ({boostTimeLeft}s)
//             </>
//           ) : boostCooldown > 0 ? (
//             <>
//               ⏳ Cooldown ({boostCooldown}s)
//             </>
//           ) : (
//             <>
//               🚀 Activate Boost (100 NOVA)
//             </>
//           )}
//         </button>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default IndexPage;