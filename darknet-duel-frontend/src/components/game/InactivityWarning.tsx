import React from 'react';

interface InactivityWarningProps {
  timeUntilForfeit: number;
  isActive: boolean;
  isVisible: boolean;
}

const InactivityWarning: React.FC<InactivityWarningProps> = ({
  timeUntilForfeit,
  isActive,
  isVisible
}) => {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getWarningLevel = (ms: number) => {
    if (ms <= 60000) return 'critical'; // Last minute
    if (ms <= 180000) return 'warning'; // Last 3 minutes
    return 'info';
  };

  if (!isVisible || !isActive || timeUntilForfeit <= 0) {
    return null;
  }

  const warningLevel = getWarningLevel(timeUntilForfeit);
  const isUrgent = warningLevel === 'critical';

  return (
    <div className={`
      fixed top-4 right-4 z-40 p-4 rounded-lg border-2 shadow-lg
      ${isUrgent ? 'bg-error/90 border-error text-error-content animate-pulse' : 
        warningLevel === 'warning' ? 'bg-warning/90 border-warning text-warning-content' :
        'bg-info/90 border-info text-info-content'}
      transition-all duration-300
    `}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {isUrgent ? '⏰' : '⏱️'}
        </div>
        <div>
          <div className="font-bold text-sm">
            {isUrgent ? 'URGENT: Make Your Move!' : 'Inactivity Warning'}
          </div>
          <div className="text-xs opacity-90">
            Auto-forfeit in: <span className="font-mono font-bold">
              {formatTime(timeUntilForfeit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning;
