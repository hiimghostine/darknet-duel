import React, { useState } from 'react';
import { type AdminUser } from '../../services/admin.service';

interface BanUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

const BanUserModal: React.FC<BanUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const [banReason, setBanReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!banReason.trim()) {
      setError('Ban reason is required');
      return;
    }

    if (banReason.trim().length < 3) {
      setError('Ban reason must be at least 3 characters long');
      return;
    }

    onConfirm(banReason.trim());
  };

  const handleClose = () => {
    setBanReason('');
    setError('');
    onClose();
  };

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-base-200 border border-error/30 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-error animate-pulse"></div>
          <h2 className="text-xl font-mono font-bold text-error">
            BAN_USER_CONFIRMATION
          </h2>
        </div>

        {/* User Info */}
        <div className="bg-base-300/50 border border-error/20 rounded p-3 mb-4">
          <div className="font-mono text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-base-content/70">TARGET:</span>
              <span className="text-error font-bold">{user.username}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-base-content/70">EMAIL:</span>
              <span className="text-base-content">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">TYPE:</span>
              <span className="text-base-content uppercase">{user.type}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-mono text-base-content/70 mb-2">
              BAN_REASON <span className="text-error">*</span>
            </label>
            <textarea
              value={banReason}
              onChange={(e) => {
                setBanReason(e.target.value);
                setError('');
              }}
              placeholder="Enter reason for banning this user..."
              className="textarea textarea-bordered w-full font-mono text-sm bg-base-300/50 border-error/30 focus:border-error"
              rows={3}
              disabled={isLoading}
              required
            />
            {error && (
              <p className="text-error text-xs font-mono mt-1">{error}</p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-error/10 border border-error/30 rounded p-3 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-error text-lg">⚠️</span>
              <div className="text-xs font-mono text-error">
                <div className="font-bold mb-1">WARNING: PERMANENT ACTION</div>
                <div>User will be immediately logged out and unable to access their account until unbanned by an admin.</div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline btn-sm flex-1 border-base-content/30 hover:bg-base-content/10"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm bg-error/20 border-error/40 hover:bg-error/30 text-error flex-1"
              disabled={isLoading || !banReason.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Banning...
                </>
              ) : (
                'Ban User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BanUserModal; 