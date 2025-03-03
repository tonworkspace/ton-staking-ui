import React, { useState, useEffect } from 'react';
import { useTokenPrice } from '../hooks/useTokenPrice';
import { FaWallet } from 'react-icons/fa';
import { BsCoin } from 'react-icons/bs';

interface MiningCardProps {
  type: 'mining' | 'staking';
  balance: number;
  rate: number;
  isActive: boolean;
  onActivate: () => void;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  stakingBonus?: number;
  isLoading?: boolean;
  levelMinPoints?: number[];
  levelIndex?: number;
  playerBalance?: number;
  levelNames?: string[];
  getTimeEstimate?: (currentBalance: number, currentLevelIndex: number) => string;
  connected?: boolean;
  calculateProfitPerSecond?: (amount: number) => number;
  updateMiningBalance?: (amount: number) => void;
  setIsMiningActive?: (active: boolean) => void;
  setProfitPerHour?: (profit: number) => void;
  miningBalance?: number;
  onUpgrade?: (upgrade: string) => void;
}

export const MiningCard: React.FC<MiningCardProps> = ({
  type,
  balance,
  rate,
  isActive,
  onActivate,
  onDeposit,
  onWithdraw,
  stakingBonus = 0,
  isLoading = false,
  levelMinPoints = [],
  levelIndex = 0,
  playerBalance = 0,
  levelNames = [],
  getTimeEstimate = () => "",
  connected = false,
  calculateProfitPerSecond = () => 0,
  updateMiningBalance = () => {},
  setIsMiningActive = () => {},
  setProfitPerHour = () => {},
  miningBalance = 0,
  onUpgrade = () => {},
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDepositCard, setShowDepositCard] = useState(true);
  const { price: tonPrice } = useTokenPrice();
  
  const isStaking = type === 'staking';
  const title = isStaking ? 'Nova Staking' : 'Nova Mining';
  const icon = isStaking ? '🔒' : '⚡';
  const apy = isStaking ? '12%' : '365%';
  
  // Add this function to calculate progress percentage
  const calculateProgress = () => {
    if (levelIndex >= levelNames.length - 1) return 100;
    
    const currentLevelMin = levelMinPoints[levelIndex] || 0;
    const nextLevelMin = levelMinPoints[levelIndex + 1] || currentLevelMin;
    const range = nextLevelMin - currentLevelMin;
    
    if (range <= 0) return 100;
    
    const progress = ((playerBalance - currentLevelMin) / range) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };
  
  // Update the deposit handler to hide the deposit card after successful deposit
  const handleDepositSubmit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      // Call the parent component's onDeposit handler
      onDeposit(amount);
      setDepositAmount('');
      
      // Hide the deposit card after successful deposit
      if (balance === 0) { // Only transition on first deposit
        setTimeout(() => {
          setShowDepositCard(false);
        }, 500); // Short delay for better UX
      }
    }
  };

  // Show deposit card if balance is 0 or if explicitly shown
  useEffect(() => {
    if (balance > 0 && showDepositCard) {
      setShowDepositCard(false);
    } else if (balance === 0 && !showDepositCard) {
      setShowDepositCard(true);
    }
  }, [balance]);
  
  // Add state for upgrade options
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  
  return (
    <div className="p-4">
      {/* Balance and Rate Display */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#1A1A1F] rounded-lg p-3 hover:bg-[#2A2A2F] transition-colors">
          <p className="text-sm text-gray-400 mb-1.5">Nova Power</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium">{balance.toFixed(5)}</span>
            <span className="text-sm text-gray-400">TON</span>
          </div>
          <div className="text-xs text-gray-500 mt-1.5">
            ≈ ${(balance * (tonPrice || 0)).toFixed(2)} USD
            {!tonPrice && <span className="ml-1 opacity-75">(Loading price...)</span>}
          </div>
        </div>
        <div className="bg-[#1A1A1F] rounded-lg p-3 hover:bg-[#2A2A2F] transition-colors">
          <p className="text-sm text-gray-400 mb-1.5">Nova Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium text-blue-400">
              {(balance * 100).toFixed(2)}
            </span>
            <span className="text-sm text-gray-400">H/s</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span>≈ {rate.toFixed(5)} NOVA/day</span>
            <span>Difficulty: {(1000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Deposit UI or Mining Console based on conditions */}
      {!isStaking && (
        <>
          {!connected ? (
            <div className="w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FaWallet className="text-2xl text-blue-400" />
                </div>
                <p className="text-lg font-medium text-gray-300">Connect Wallet to Start Mining</p>
                <p className="text-sm text-gray-500 mt-2">Use the wallet button in the header to connect</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conditional rendering based on showDepositCard state */}
              <div className="w-full space-y-4">
                {showDepositCard ? (
                  <>
                    <div className="bg-[#1A1A1F] p-3 rounded-lg">
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => setDepositAmount('1')}
                          className="px-3 py-2 text-sm font-medium rounded-lg
                                   bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                   transition-all active:transform active:scale-95"
                        >
                          1 TON
                        </button>
                        <button 
                          onClick={() => setDepositAmount('10')}
                          className="px-3 py-2 text-sm font-medium rounded-lg
                                   bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                   transition-all active:transform active:scale-95"
                        >
                          10 TON
                        </button>
                        <button 
                          onClick={() => setDepositAmount('50')}
                          className="px-3 py-2 text-sm font-medium rounded-lg
                                   bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                   transition-all active:transform active:scale-95"
                        >
                          50 TON
                        </button>
                        <button 
                          onClick={() => setDepositAmount('100')}
                          className="px-3 py-2 text-sm font-medium rounded-lg
                                   bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                   transition-all active:transform active:scale-95"
                        >
                          100 TON
                        </button>
                        <button 
                          onClick={() => setDepositAmount('250')}
                          className="px-3 py-2 text-sm font-medium rounded-lg
                                   bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                   transition-all active:transform active:scale-95"
                        >
                          250 TON
                        </button>
                        <button 
                          onClick={() => setDepositAmount('500')}
                          className="px-3 py-2 text-sm font-medium rounded-lg
                                   bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                   transition-all active:transform active:scale-95"
                        >
                          500 TON
                        </button>
                      </div>

                      <div className="mt-3">
                        <div className="relative">
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Enter custom amount"
                            className="w-full px-4 py-2 bg-[#1A1A1F] border border-[#2d2d2e] 
                                     rounded-lg text-white placeholder-gray-500 focus:outline-none 
                                     focus:border-blue-500 transition-colors"
                            min="0"
                            step="0.1"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                         text-gray-400 text-sm">
                            TON
                          </span>
                        </div>
                        
                        {/* Earnings Calculator Display */}
                        {depositAmount && Number(depositAmount) > 0 && (
                          <div className="mt-2 p-3 bg-[#1A1A1F]/50 rounded-lg border border-[#2d2d2e]">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Daily Earnings:</span>
                              <span className="text-blue-400 font-medium">
                                {(Number(depositAmount) * 0.01 * 100).toFixed(1)} NOVA
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span className="text-gray-400">Monthly Earnings:</span>
                              <span className="text-blue-400 font-medium">
                                {(Number(depositAmount) * 0.01 * 100 * 30).toFixed(1)} NOVA
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span className="text-gray-400">APY:</span>
                              <span className="text-green-400 font-medium">365%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleDepositSubmit}
                      disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isLoading}
                      className={`shine-effect w-full bg-[#ffffff0d] border-[1px] border-[#2d2d2e] rounded-lg px-4 py-2 flex items-center justify-between mb-4 ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 font-medium">
                        <BsCoin className="w-8 h-8" />
                        <span>{isLoading ? 'Processing...' : 'Start Mining Nova'}</span>
                      </div>
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="w-6 h-6 text-gray-400">→</span>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mining Console UI */}
                    <div className="rounded-lg transition-all duration-300 animate-fade-in">

                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            ⛏️
                          </div>
                          <span className="font-medium">Mining Console</span>
                        </div>
                        <button 
                          onClick={() => setShowDepositCard(true)}
                          className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          Add More TON
                        </button>
                      </div>
                      
                      <div className="mt-4 mb-5 animate-fade-in">
                  {/* Progress bar content - existing code */}
                  <div className="flex justify-between text-sm mb-2">
                    <span>{levelNames[levelIndex]}</span>
                    <span>{levelIndex + 1} / {levelNames.length}</span>
                  </div>
                  <div className="relative h-3 bg-[#252529] rounded-full overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-repeat-x animate-slide-left"
                          style={{
                            backgroundImage: 'linear-gradient(45deg, transparent 45%, #ffffff 45%, #ffffff 55%, transparent 55%)',
                            backgroundSize: '20px 20px'
                          }}
                      />
                    </div>

                    {/* Milestone markers */}
                    {levelMinPoints.map((_, index) => (
                      index > 0 && index < levelNames.length && (
                        <div
                          key={index}
                          className={`absolute top-0 bottom-0 w-0.5 
                                    ${playerBalance >= levelMinPoints[index] ? 'bg-blue-400' : 'bg-white/20'}`}
                          style={{
                            left: `${(levelMinPoints[index] / levelMinPoints[levelIndex + 1 || levelIndex]) * 100}%`,
                            zIndex: 2
                          }}
                        />
                      )
                    ))}

                    {/* Main progress bar */}
                    <div 
                      className="relative h-full bg-gradient-to-r from-blue-500 to-blue-400 
                                transition-all duration-300 ease-out rounded-full
                                animate-pulse-subtle"
                      style={{ width: `${calculateProgress()}%` }}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-blue-400 blur-sm opacity-50" />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 animate-shimmer"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                              transform: 'skewX(-20deg)'
                            }}
                        />
                      </div>
                    </div>
                  </div>
                  {balance > 0 && levelIndex < levelNames.length - 1 && (
                    <div className="text-sm text-gray-400 mt-2">
                      {/* Next Level Target */}
                      <div className="flex justify-between items-center bg-[#252529] rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            ⛏️
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">Next Mining Level</span>
                            <div className="text-sm font-medium text-white">{levelNames[levelIndex + 1]}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">Time Left</span>
                          <div className="text-sm font-medium text-blue-400">{getTimeEstimate(playerBalance, levelIndex)}</div>
                        </div>
                      </div>

                      {/* Nova Required */}
                      <div className="flex justify-between items-center mt-2 bg-[#252529] rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            💎
                          </div>
                          <span className="text-gray-400">Nova Required</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-400 font-medium">{(levelMinPoints[levelIndex + 1] - playerBalance).toLocaleString()}</span>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                      
                      <div className="flex items-center justify-between bg-[#252529] p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                          <span className="text-sm">Mining Status</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {isActive ? 'Active' : 'Paused'}
                          </span>
                          
                          {/* Replace pause/resume button with upgrade button */}
                          <button 
                            onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                            className="px-3 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-400 
                                     hover:bg-purple-500/30 transition-colors flex items-center gap-1"
                          >
                            <span>⚡</span> Upgrade
                          </button>
                        </div>
                      </div>
                      
                      {/* Upgrade options panel */}
                      {showUpgradeOptions && (
                        <div className="bg-[#252529] p-3 rounded-lg mb-3 animate-fade-in">
                          <div className="text-sm font-medium mb-2">Mining Upgrades</div>
                          <div className="grid grid-cols-1 gap-2">
                            <button 
                              onClick={() => {
                                onUpgrade('speed');
                                setShowUpgradeOptions(false);
                              }}
                              className="flex items-center justify-between p-2 bg-[#1A1A1F] rounded-lg
                                       hover:bg-[#2A2A2F] transition-colors border border-purple-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                  🚀
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Speed Booster</div>
                                  <div className="text-xs text-gray-400">+50% mining speed for 1 hour</div>
                                </div>
                              </div>
                              <div className="text-xs px-2 py-1 bg-purple-500/20 rounded-lg text-purple-400">
                                100 NOVA
                              </div>
                            </button>
                            
                            <button 
                              onClick={() => {
                                onUpgrade('efficiency');
                                setShowUpgradeOptions(false);
                              }}
                              className="flex items-center justify-between p-2 bg-[#1A1A1F] rounded-lg
                                       hover:bg-[#2A2A2F] transition-colors border border-blue-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                  ⚙️
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Efficiency Module</div>
                                  <div className="text-xs text-gray-400">+25% mining efficiency permanently</div>
                                </div>
                              </div>
                              <div className="text-xs px-2 py-1 bg-blue-500/20 rounded-lg text-blue-400">
                                500 NOVA
                              </div>
                            </button>
                            
                            <button 
                              onClick={() => {
                                onUpgrade('quantum');
                                setShowUpgradeOptions(false);
                              }}
                              className="flex items-center justify-between p-2 bg-[#1A1A1F] rounded-lg
                                       hover:bg-[#2A2A2F] transition-colors border border-green-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                  🔮
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Quantum Accelerator</div>
                                  <div className="text-xs text-gray-400">2x mining rate for 30 minutes</div>
                                </div>
                              </div>
                              <div className="text-xs px-2 py-1 bg-green-500/20 rounded-lg text-green-400">
                                250 NOVA
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* <div className="grid grid-cols-2 gap-2 mb-3">
                        <button 
                          onClick={onActivate}
                          className={`py-2 text-sm rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {isActive ? 'Pause Mining' : 'Resume Mining'}
                        </button>
                        
                        <button 
                          onClick={() => onWithdraw(balance)}
                          className="py-2 text-sm bg-[#252529] text-red-400 rounded-lg hover:bg-[#2A2A2F] transition-colors"
                        >
                          Withdraw All TON
                        </button>
                      </div> */}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
      
      {isStaking && (
        <div className="mt-2 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span>{levelNames[levelIndex]}</span>
            <span>{levelIndex + 1} / {levelNames.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}; 



