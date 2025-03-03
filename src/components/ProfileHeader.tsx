import React from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';

interface ProfileHeaderProps {
  photoUrl?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  levelInfo?: {
    name: string;
    level: number;
    minBalance?: number;
    maxBalance?: number;
  };
  showBoostButton?: boolean;
  customButton?: React.ReactNode;
  onBoostClick?: () => void;
  children?: React.ReactNode;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  photoUrl,
  username,
  firstName,
  lastName,
  levelInfo,
  showBoostButton = false,
  customButton,
  children
}) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-indigo-600/20 shadow-lg shadow-indigo-500/10 px-2 py-1.5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar with hexagonal frame */}
            <div className="relative">
              {photoUrl && !imageError ? (
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 clip-hex animate-pulse-slow"></div>
                  <img 
                    src={photoUrl} 
                    alt={username || 'User'}
                    className="absolute inset-[1.5px] object-cover clip-hex"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 clip-hex animate-pulse-slow"></div>
                  <div className="absolute inset-[1.5px] bg-gradient-to-br from-indigo-900 to-blue-700 clip-hex flex items-center justify-center">
                    <span className="text-blue-100 font-bold text-xs">
                      {(username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Level badge */}
              {levelInfo && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-600 text-[8px] font-bold text-black px-1 rounded-full border border-amber-300 shadow-md">
                  {levelInfo.level}
                </div>
              )}
            </div>
            
            {/* User info */}
            <div className="flex flex-col justify-center">
              <h2 className="font-bold text-white text-xs tracking-wide leading-tight flex items-center">
                {username || 'User'} 
                {levelInfo && (
                  <span className="ml-1 text-[10px] text-cyan-300 font-medium bg-cyan-900/30 px-1 py-0.5 rounded">
                    {levelInfo.name}
                  </span>
                )}
              </h2>
              {(firstName || lastName) && (
                <p className="text-[10px] text-blue-300/70 leading-tight">
                  {[firstName, lastName].filter(Boolean).join(' ')}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {showBoostButton && (
              <div className="relative scale-90">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md blur-sm opacity-70"></div>
                <TonConnectButton />
              </div>
            )}
            {customButton && (
              <div className="scale-90">
                {customButton}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 