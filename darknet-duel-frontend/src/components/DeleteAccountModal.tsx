import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Lock } from 'lucide-react';
import accountService from '../services/account.service';
import { useAudioManager } from '../hooks/useAudioManager';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = first confirmation, 2 = second confirmation, 3 = password entry
  const [countdown, setCountdown] = useState(5);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { triggerClick, triggerError } = useAudioManager();
  const { logout } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCountdown(5);
      setPassword('');
      setError(null);
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (isOpen && step === 2 && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step, countdown]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isDeleting, onClose]);

  const handleFirstConfirm = () => {
    triggerClick();
    setStep(2);
    setCountdown(5);
  };

  const handleSecondConfirm = () => {
    if (countdown > 0) {
      triggerError();
      return;
    }
    triggerClick();
    setStep(3);
  };

  const handleDelete = async () => {
    if (!password.trim()) {
      setError('Password is required');
      triggerError();
      return;
    }

    setIsDeleting(true);
    setError(null);
    triggerClick();

    try {
      await accountService.deleteAccount(password);
      
      addToast({
        type: 'success',
        message: 'Account successfully deleted'
      });

      // Logout user and redirect to auth
      await logout();
      navigate('/auth');
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete account');
      setIsDeleting(false);
      triggerError();
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      triggerClick();
      setStep(1);
      setPassword('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 border border-error/50 w-full max-w-md relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-error"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-error"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-error"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-error"></div>

        {/* Header */}
        <div className="bg-error/10 border-b border-error/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-error" size={20} />
              <h3 className="text-lg font-mono text-error">DELETE_ACCOUNT.exe</h3>
            </div>
            {!isDeleting && (
              <button
                onClick={handleCancel}
                className="text-base-content/70 hover:text-error transition-colors text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div className="text-error font-mono text-sm mb-4">
                <div className="font-bold mb-2">⚠️ WARNING: PERMANENT ACTION</div>
                <div className="text-base-content/80">
                  Deleting your account will permanently anonymize it and cannot be retrieved again. This action cannot be undone.
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost btn-sm flex-1 font-mono"
                  disabled={isDeleting}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleFirstConfirm}
                  className="btn btn-error btn-sm flex-1 font-mono"
                  disabled={isDeleting}
                >
                  CONTINUE
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-error font-mono text-sm mb-4">
                <div className="font-bold mb-2">⚠️ FINAL CONFIRMATION REQUIRED</div>
                <div className="text-base-content/80">
                  Are you absolutely sure you want to delete your account? This is your last chance to cancel.
                </div>
              </div>

              <div className="bg-error/10 border border-error/30 p-4 text-center">
                <div className="text-error font-mono text-sm mb-2">
                  Wait {countdown} second{countdown !== 1 ? 's' : ''} before confirming
                </div>
                {countdown === 0 && (
                  <div className="text-success font-mono text-xs mt-2">
                    ✓ Ready to proceed
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost btn-sm flex-1 font-mono"
                  disabled={isDeleting}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSecondConfirm}
                  className="btn btn-error btn-sm flex-1 font-mono"
                  disabled={isDeleting || countdown > 0}
                >
                  {countdown > 0 ? `WAIT (${countdown}s)` : 'I UNDERSTAND'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-error font-mono text-sm mb-4">
                <div className="font-bold mb-2">🔒 PASSWORD VERIFICATION</div>
                <div className="text-base-content/80">
                  Enter your password to confirm account deletion.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block mb-1">
                    <span className="font-mono text-xs text-error">PASSWORD</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      className="input w-full bg-base-300/50 border-error/30 font-mono text-sm focus:border-error focus:ring-1 focus:ring-error"
                      disabled={isDeleting}
                      autoFocus
                    />
                    <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  {error && (
                    <div className="text-error text-xs mt-1 font-mono">{error}</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost btn-sm flex-1 font-mono"
                  disabled={isDeleting}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-error btn-sm flex-1 font-mono"
                  disabled={isDeleting || !password.trim()}
                >
                  {isDeleting ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      DELETING...
                    </>
                  ) : (
                    'DELETE ACCOUNT'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;

