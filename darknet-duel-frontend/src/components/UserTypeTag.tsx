import React from 'react';

interface UserTypeTagProps {
  userType: 'user' | 'mod' | 'admin';
  className?: string;
}

const UserTypeTag: React.FC<UserTypeTagProps> = ({ userType, className = '' }) => {
  if (userType === 'user') {
    return null; // Don't show tag for regular users
  }

  const isAdmin = userType === 'admin';
  const isModerator = userType === 'mod';

  const tagStyles = isAdmin 
    ? 'bg-error/20 border-error/50 text-error hover:bg-error/30' 
    : 'bg-warning/20 border-warning/50 text-warning hover:bg-warning/30';

  return (
    <div className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold rounded border transition-colors ${tagStyles} ${className}`}>
      {isAdmin ? 'ADMIN' : 'MOD'}
    </div>
  );
};

export default UserTypeTag; 