import React, { useState, useEffect } from 'react';
import adminService, { type AdminUser, type UpdateUserData } from '../../services/admin.service';

interface UserEditModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: () => void;
  onError?: (message: string) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave, onError }) => {
  const [formData, setFormData] = useState<UpdateUserData>({
    email: user.email,
    username: user.username,
    type: user.type,
    isActive: user.isActive,
    bio: user.bio || '',
    creds: user.creds,
    crypts: user.crypts,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      email: user.email,
      username: user.username,
      type: user.type,
      isActive: user.isActive,
      bio: user.bio || '',
      creds: user.creds,
      crypts: user.crypts,
      password: ''
    });
    setErrors({});
  }, [user]);

  // Handle form field changes
  const handleChange = (field: keyof UpdateUserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

    if (formData.creds !== undefined && formData.creds < 0) {
      newErrors.creds = 'Credits must be non-negative';
    }

    if (formData.crypts !== undefined && formData.crypts < 0) {
      newErrors.crypts = 'Crypts must be non-negative';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
             // Prepare update data (exclude empty password)
       const updateData: UpdateUserData = {
         email: formData.email,
         username: formData.username,
         type: formData.type,
         isActive: formData.isActive,
         bio: formData.bio || undefined,
         creds: formData.creds,
         crypts: formData.crypts
       };

      // Only include password if it's provided
      if (formData.password?.trim()) {
        updateData.password = formData.password;
      }

      await adminService.updateUser(user.id, updateData);
      onSave();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update user';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-base-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="bg-error/10 border-b border-error/20 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-error">EDIT_USER.exe</h3>
            <button
              onClick={onClose}
              className="text-base-content/70 hover:text-error transition-colors text-xl"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Editing user: <span className="font-mono text-primary">{user.username}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                EMAIL_ADDRESS*
              </label>
              <input
                type="email"
                className={`input input-bordered w-full bg-base-100 text-base-content ${errors.email ? 'input-error' : ''}`}
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@domain.com"
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                USERNAME*
              </label>
              <input
                type="text"
                className={`input input-bordered w-full bg-base-100 text-base-content ${errors.username ? 'input-error' : ''}`}
                value={formData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="username"
              />
              {errors.username && (
                <p className="text-error text-xs mt-1">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Account Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                ACCOUNT_TYPE
              </label>
              <select
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as 'user' | 'mod' | 'admin')}
              >
                <option value="user">User</option>
                <option value="mod">Moderator</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                STATUS
              </label>
              <select
                className="select select-bordered w-full bg-base-100 text-base-content"
                value={formData.isActive?.toString()}
                onChange={(e) => handleChange('isActive', e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-mono text-base-content/70 mb-1">
              BIO ({formData.bio?.length || 0}/30)
            </label>
            <textarea
              className={`textarea textarea-bordered w-full bg-base-100 text-base-content ${errors.bio ? 'textarea-error' : ''}`}
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="User bio (optional)"
              rows={3}
              maxLength={30}
            />
            {errors.bio && (
              <p className="text-error text-xs mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Virtual Currencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creds */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                CREDITS
              </label>
              <input
                type="number"
                className={`input input-bordered w-full bg-base-100 text-base-content ${errors.creds ? 'input-error' : ''}`}
                value={formData.creds || 0}
                onChange={(e) => handleChange('creds', parseInt(e.target.value) || 0)}
                min="0"
              />
              {errors.creds && (
                <p className="text-error text-xs mt-1">{errors.creds}</p>
              )}
            </div>

            {/* Crypts */}
            <div>
              <label className="block text-sm font-mono text-base-content/70 mb-1">
                CRYPTS
              </label>
              <input
                type="number"
                className={`input input-bordered w-full bg-base-100 text-base-content ${errors.crypts ? 'input-error' : ''}`}
                value={formData.crypts || 0}
                onChange={(e) => handleChange('crypts', parseInt(e.target.value) || 0)}
                min="0"
              />
              {errors.crypts && (
                <p className="text-error text-xs mt-1">{errors.crypts}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-mono text-base-content/70 mb-1">
              NEW_PASSWORD (leave empty to keep current)
            </label>
            <input
              type="password"
              className={`input input-bordered w-full bg-base-100 text-base-content ${errors.password ? 'input-error' : ''}`}
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="New password (optional)"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-error text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-error flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal; 