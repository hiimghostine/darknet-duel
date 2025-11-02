import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaImage, FaLock, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import accountService, { type UpdateAccountData } from '../services/account.service';
import authService from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { useAudioManager } from '../hooks/useAudioManager';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { user, loadUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { triggerPositiveClick, triggerNegativeClick } = useAudioManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UpdateAccountData>({
    email: user?.email || '',
    username: user?.username || '',
    bio: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens and load current account data
  useEffect(() => {
    const loadAccountData = async () => {
      if (isOpen && user) {
        try {
          const accountData = await accountService.getMyAccount();
          setFormData({
            email: accountData.email || '',
            username: accountData.username || '',
            bio: accountData.bio || '',
            password: ''
          });
        } catch (error) {
          console.error('Failed to load account data:', error);
          setFormData({
            email: user.email || '',
            username: user.username || '',
            bio: '',
            password: ''
          });
        }
        setAvatarFile(null);
        setAvatarPreview(null);
        setConfirmPassword('');
        setCurrentPassword('');
        setIsPasswordVerified(false);
        setErrors({});
      }
    };

    loadAccountData();
  }, [isOpen, user]);

  // Handle form field changes
  const handleChange = (field: keyof UpdateAccountData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Verify current password
  const handleVerifyPassword = async () => {
    if (!currentPassword.trim()) {
      setErrors(prev => ({ ...prev, currentPassword: 'Enter your current password' }));
      return;
    }

    setVerifyingPassword(true);
    try {
      // Use the dedicated verify-password endpoint (doesn't log user out on failure)
      const result = await authService.verifyPassword(currentPassword);
      
      if (result.success) {
        setIsPasswordVerified(true);
        setErrors(prev => ({ ...prev, currentPassword: '' }));
        addToast({
          title: 'Access Granted',
          message: 'Current password verified. You may now set a new password.',
          type: 'success'
        });
      } else {
        setErrors(prev => ({ ...prev, currentPassword: 'Invalid password. Access denied.' }));
        setIsPasswordVerified(false);
      }
    } catch (error: any) {
      console.error('Password verification failed:', error);
      setErrors(prev => ({ ...prev, currentPassword: 'Invalid password. Access denied.' }));
      setIsPasswordVerified(false);
    } finally {
      setVerifyingPassword(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Image must be less than 5MB' }));
      return;
    }

    try {
      // Resize image to 256x256
      const resizedFile = await accountService.resizeImage(file, 256);
      setAvatarFile(resizedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(resizedFile);

      // Clear avatar error
      setErrors(prev => ({ ...prev, avatar: '' }));
    } catch (error) {
      console.error('Error resizing image:', error);
      setErrors(prev => ({ ...prev, avatar: 'Failed to process image' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.bio && formData.bio.length > 30) {
      newErrors.bio = 'Bio must be 30 characters or less';
    }

    // Password validation - only if password is being changed
    if (formData.password || confirmPassword) {
      // Must verify current password first
      if (!isPasswordVerified) {
        newErrors.password = 'You must verify your current password first';
      } else {
        if (formData.password && formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password && formData.password !== confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }

        if (confirmPassword && !formData.password) {
          newErrors.password = 'Please enter a password';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare update data
      const updateData: UpdateAccountData = {
        email: formData.email,
        username: formData.username,
        bio: formData.bio || undefined
      };

      // Only include password if it's provided
      if (formData.password?.trim()) {
        updateData.password = formData.password;
      }

      // Add avatar if selected
      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      await accountService.updateMyAccount(updateData);
      
      // Refresh user data
      await loadUser();
      
      // Force refresh avatar by updating the preview with cache buster
      if (avatarFile) {
        const cacheBuster = Date.now().toString();
        setAvatarPreview(accountService.getAvatarUrl(user?.id || '', cacheBuster));
      }
      
      addToast({
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
        type: 'success'
      });

      onSave();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update profile';
      addToast({
        title: 'Update Failed',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 border border-primary/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>

        {/* Header */}
        <div className="bg-primary/10 border-b border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaUser className="text-primary" />
              <h3 className="text-lg font-mono text-primary">EDIT_PROFILE.exe</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-base-content/70 hover:text-primary transition-colors text-xl"
              disabled={loading}
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-base-content/70 mt-1 font-mono">
            Update your user profile information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Section */}
          <div>
            <label className="block text-sm font-mono text-base-content/70 mb-3">
              AVATAR_IMAGE (256x256)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50">
                <img
                  src={avatarPreview || accountService.getAvatarUrl(user?.id || '', Date.now().toString())}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                  }}
                />
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline btn-sm border-primary/30 hover:border-primary text-primary font-mono"
                  disabled={loading}
                >
                  <FaImage className="mr-2" />
                  SELECT_IMAGE
                </button>
                <div className="text-xs text-base-content/50 font-mono mt-1">
                  JPG, PNG, GIF up to 5MB. Will be resized to 256x256.
                </div>
              </div>
            </div>
            {errors.avatar && (
              <p className="text-error text-xs mt-1 font-mono">{errors.avatar}</p>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                EMAIL_ADDRESS*
              </label>
              <input
                type="email"
                className={`input input-bordered w-full bg-base-100 text-base-content font-mono ${errors.email ? 'input-error' : ''}`}
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@domain.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-error text-xs mt-1 font-mono">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                USERNAME*
              </label>
              <input
                type="text"
                className={`input input-bordered w-full bg-base-100 text-base-content font-mono ${errors.username ? 'input-error' : ''}`}
                value={formData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="username"
                disabled={loading}
              />
              {errors.username && (
                <p className="text-error text-xs mt-1 font-mono">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-mono text-base-content/70 mb-1">
              BIO ({formData.bio?.length || 0}/30)
            </label>
            <textarea
              className={`textarea textarea-bordered w-full bg-base-100 text-base-content font-mono ${errors.bio ? 'textarea-error' : ''}`}
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={30}
              disabled={loading}
            />
            {errors.bio && (
              <p className="text-error text-xs mt-1 font-mono">{errors.bio}</p>
            )}
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <FaLock className="text-primary" />
              <h4 className="text-sm font-mono text-primary">SECURITY_CREDENTIALS</h4>
            </div>
            
            {!isPasswordVerified ? (
              // Step 1: Verify current password
              <div className="bg-base-300/50 border border-primary/30 p-4 space-y-3">
                <div className="text-sm font-mono text-warning mb-2">
                  <FaLock className="inline mr-2" />
                  AUTHENTICATION REQUIRED :: VERIFY IDENTITY TO MODIFY CREDENTIALS
                </div>
                <div>
                  <label className="block text-sm font-mono text-base-content/70 mb-1">
                    CURRENT_PASSWORD
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      className={`input input-bordered flex-1 bg-base-100 text-base-content font-mono ${errors.currentPassword ? 'input-error' : ''}`}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (errors.currentPassword) {
                          setErrors(prev => ({ ...prev, currentPassword: '' }));
                        }
                      }}
                      placeholder="Enter current password to unlock"
                      autoComplete="current-password"
                      disabled={loading || verifyingPassword}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleVerifyPassword();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyPassword}
                      className="btn btn-primary font-mono"
                      disabled={loading || verifyingPassword || !currentPassword.trim()}
                    >
                      {verifyingPassword ? (
                        <>
                          <span className="loading loading-dots loading-xs"></span>
                          VERIFYING...
                        </>
                      ) : (
                        'VERIFY'
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-error text-xs mt-1 font-mono">{errors.currentPassword}</p>
                  )}
                </div>
                <div className="text-xs text-base-content/50 font-mono">
                  Skip this section if you don't want to change your password.
                </div>
              </div>
            ) : (
              // Step 2: Set new password (only shown after verification)
              <div className="bg-success/10 border border-success/30 p-4 space-y-4">
                <div className="text-sm font-mono text-success mb-2">
                  <FaCheck className="inline mr-2" />
                  ACCESS GRANTED :: CREDENTIALS VERIFIED :: NEW PASSWORD AUTHORIZED
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-mono text-base-content/70 mb-1">
                      NEW_PASSWORD
                    </label>
                    <input
                      type="password"
                      className={`input input-bordered w-full bg-base-100 text-base-content font-mono ${errors.password ? 'input-error' : ''}`}
                      value={formData.password || ''}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    {errors.password && (
                      <p className="text-error text-xs mt-1 font-mono">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-mono text-base-content/70 mb-1">
                      CONFIRM_PASSWORD
                    </label>
                    <input
                      type="password"
                      className={`input input-bordered w-full bg-base-100 text-base-content font-mono ${errors.confirmPassword ? 'input-error' : ''}`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        // Clear confirm password error when user starts typing
                        if (errors.confirmPassword) {
                          setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    {errors.confirmPassword && (
                      <p className="text-error text-xs mt-1 font-mono">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordVerified(false);
                    setCurrentPassword('');
                    setFormData(prev => ({ ...prev, password: '' }));
                    setConfirmPassword('');
                  }}
                  className="btn btn-sm btn-ghost text-base-content/70 font-mono"
                  disabled={loading}
                >
                  ← CANCEL PASSWORD CHANGE
                </button>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/30 p-3">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-warning text-lg mt-0.5" />
              <div className="text-xs font-mono text-warning">
                <div className="font-bold mb-1">SECURITY_NOTICE</div>
                <div>Profile changes are immediately visible to other users. Choose your information carefully.</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-primary/20">
            <button
              type="button"
              onClick={() => {
                triggerNegativeClick();
                handleClose();
              }}
              className="btn btn-outline flex-1 border-base-content/30 hover:bg-base-content/10 font-mono"
              disabled={loading}
            >
              CANCEL
            </button>
            <button
              type="submit"
              onClick={() => {
                if (!loading) {
                  triggerPositiveClick();
                }
              }}
              className="btn btn-primary flex-1 font-mono"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  UPDATING...
                </>
              ) : (
                'UPDATE_PROFILE'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 