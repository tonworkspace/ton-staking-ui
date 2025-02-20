import { FC } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow';
  className?: string;
}

export const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  className = '' 
}) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10'
  };

  return (
    <div className={`bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-xl p-4 ${className}`}>
      <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className={`text-xl font-bold ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </div>
    </div>
  );
}; 