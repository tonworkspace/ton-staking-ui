import { BatteryCharging, Clock, HandIcon, TrendingUp, Zap, ZapIcon } from "lucide-react";
import { LucideIcon } from 'lucide-react';

export interface Task {
    isNew: any;
    id: string;
    description: string;
    reward: number;
    completed: boolean;
    status: string;
    requiredLevel?: number;
    platform?: string;
    link?: string;
    progress?: {
      current: number;
      total: number;
    };
    timeLimit?: string;
    gameplayRequirement?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    socialAction?: string;
    verificationMethod?: string;
    cooldownEndTime: number;
    updated_at: string;
}

export interface UpgradeItem {
  id: string;
  name: string;
  baseCost: number;
  effect: string;
  icon: LucideIcon;
  maxLevel: number;
  resetHours: number;
  bonus?: (level: number) => number;
  miningInterval?: number;
  energyCost?: number;
  catchInterval?: number;
}

export interface LevelInfo {
    name: string;
    level: number;
    minBalance: number;
    maxBalance: number;
}

export interface UpgradeItemLevel {
  level: number;
  lastResetTime: number;
}

export interface UpgradeLevels {
  energyBoost: UpgradeItemLevel;
  regenerationRate: UpgradeItemLevel;
  cooldownReduction: UpgradeItemLevel;
  doubleRewards: UpgradeItemLevel;
  comboTimeExtension: UpgradeItemLevel;
  instantEnergyRefill: UpgradeItemLevel;
  autoCatcher: UpgradeItemLevel;
  [key: string]: UpgradeItemLevel;
}


export const initializeUpgradeLevels = (dbUpgradeLevels: { [key: string]: UpgradeItemLevel } | undefined): UpgradeLevels => {
  return {
    energyBoost: dbUpgradeLevels?.energyBoost || { level: 0, lastResetTime: 0 },
    regenerationRate: dbUpgradeLevels?.regenerationRate || { level: 0, lastResetTime: 0 },
    cooldownReduction: dbUpgradeLevels?.cooldownReduction || { level: 0, lastResetTime: 0 },
    doubleRewards: dbUpgradeLevels?.doubleRewards || { level: 0, lastResetTime: 0 },
    comboTimeExtension: dbUpgradeLevels?.comboTimeExtension || { level: 0, lastResetTime: 0 },
    instantEnergyRefill: dbUpgradeLevels?.instantEnergyRefill || { level: 0, lastResetTime: 0 },
    autoCatcher: dbUpgradeLevels?.autoCatcher || { level: 0, lastResetTime: 0 },
  };
};


export const upgradeItems: UpgradeItem[] = [
  {
    id: '1',
    name: 'Energy Capacity',
    baseCost: 1000,
    effect: 'Increase max energy by 15',
    icon: BatteryCharging,
    maxLevel: 10,
    resetHours: 24,
  },
  {
    id: '2',
    name: 'Quick Recovery',
    baseCost: 2000,
    effect: 'Reduce cooldown time by 15 minutes',
    icon: Clock,
    maxLevel: 5,
    resetHours: 24,
  },
  {
    id: '3',
    name: 'Fortune Boost',
    baseCost: 3000,
    effect: 'Increase scorpion rewards by 25% for 2 hours',
    icon: Zap,
    maxLevel: 3,
    resetHours: 72,
  },
  {
    id: '4',
    name: 'Combo Master',
    baseCost: 2500,
    effect: 'Increase combo time limit by 8 seconds',
    icon: TrendingUp,
    maxLevel: 5,
    resetHours: 24,
  },
  {
    id: '5',
    name: 'Instant Energy Refill',
    baseCost: 3000,
    effect: 'Instantly refill energy and remove cooldown',
    icon: ZapIcon,
    maxLevel: 20,
    resetHours: 72,
  },
  {
    id: '6',
    name: 'Energy Surge',
    baseCost: 400,
    effect: 'Get 30 minutes of no cooldown',
    icon: ZapIcon,
    maxLevel: 1,
    resetHours: 72,
  },
  {
    id: '7',
    name: 'Lucky Charm',
    baseCost: 5000,
    effect: 'Increase chance of finding rare scorpions by 5%',
    icon: ZapIcon,
    maxLevel: 5,
    resetHours: 72,
  },
  {
    id: '8',
    name: 'Auto Catcher',
    effect: 'Automatically catches scorpions every second',
    baseCost: 150000,
    maxLevel: 5,
    icon: HandIcon,
    resetHours: 24,
    bonus: (level: number) => level * 2,
    catchInterval: 1000,
    energyCost: 2,
  },
];

export interface Level {
    name: string;
    minBalance: number;
    maxBalance: number;
    level: number;
}

export const levels: Level[] = [
    { name: 'Nova Initiate', minBalance: 0, maxBalance: 4999, level: 1 },
    { name: 'Stellar Scout', minBalance: 5000, maxBalance: 24999, level: 2 },
    { name: 'Cosmic Pioneer', minBalance: 25000, maxBalance: 99999, level: 3 },
    { name: 'Nebula Explorer', minBalance: 100000, maxBalance: 999999, level: 4 },
    { name: 'Galaxy Voyager', minBalance: 1000000, maxBalance: 1999999, level: 5 },
    { name: 'Solar Guardian', minBalance: 2000000, maxBalance: 9999999, level: 6 },
    { name: 'Celestial Master', minBalance: 10000000, maxBalance: 49999999, level: 7 },
    { name: 'Astral Lord', minBalance: 50000000, maxBalance: 99999999, level: 8 },
    { name: 'Nova Commander', minBalance: 100000000, maxBalance: 999999999, level: 9 },
    { name: 'Quantum Sovereign', minBalance: 1000000000, maxBalance: Infinity, level: 10 }
];

export const getLevel = (balance: number): LevelInfo => {
    for (let i = 0; i < levels.length; i++) {
      if (balance >= levels[i].minBalance && (i === levels.length - 1 || balance < levels[i + 1].minBalance)) {
        return { 
          name: levels[i].name, 
          level: levels[i].level, 
          minBalance: levels[i].minBalance, 
          maxBalance: levels[i].maxBalance 
        };
      }
    }
    return { name: 'Nova Initiate', level: 1, minBalance: 0, maxBalance: levels[0].maxBalance };
};