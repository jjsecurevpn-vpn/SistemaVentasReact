import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  threshold = 80,
}) => {
  const opacity = Math.min(pullDistance / threshold, 1);
  const rotation = Math.min((pullDistance / threshold) * 180, 180);

  return (
    <div
      className="fixed top-14 left-0 right-0 flex justify-center pointer-events-none z-40 transition-all"
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
      }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 transition-all"
        style={{
          opacity: isRefreshing ? 1 : opacity,
          transform: `rotate(${isRefreshing ? 360 : rotation}deg)`,
          transition: isRefreshing ? 'transform 0.6s linear infinite' : 'none',
        }}
      >
        <RefreshCw
          size={20}
          className="text-blue-400"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
