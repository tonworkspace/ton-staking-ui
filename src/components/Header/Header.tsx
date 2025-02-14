import { FC } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TonConnectButton } from '@tonconnect/ui-react';

export const Header: FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#1A1B1E]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {user.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-blue-400 font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-medium text-white">{user.username}</h2>
                {(user.first_name || user.last_name) && (
                  <p className="text-sm text-gray-400">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
            </div>
            <TonConnectButton />
          </div>
        ) : (
          <div className="h-10 flex items-center justify-between">
            <span className="text-gray-400">Loading profile...</span>
            <TonConnectButton className="ton-connect-page__button" />
          </div>
        )}
      </div>
    </header>
  );
}; 