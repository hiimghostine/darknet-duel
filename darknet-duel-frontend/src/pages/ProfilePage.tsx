import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import logo from '../assets/logo.png';
import LoadingScreen from '../components/LoadingScreen';
import accountService, { type AccountData, type UpdateAccountData } from '../services/account.service';

// Profile form validation schema
const ProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be 20 characters or less'),
  email: z.string().email('Invalid email format'),
  bio: z.string().max(30, 'Bio must be 30 characters or less').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^\w\s]/, 'Password must contain at least one special character')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [showLogoutScreen, setShowLogoutScreen] = useState(false);
  const [theme, setTheme] = useState<'cyberpunk' | 'cyberpunk-dark'>('cyberpunk');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Get theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'cyberpunk' | 'cyberpunk-dark' || 'cyberpunk';
    setTheme(savedTheme);
  }, []);

  // Load account data
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        await loadUser();
        const data = await accountService.getMyAccount();
        setAccountData(data);
        
        // Set form values
        reset({
          username: data.username,
          email: data.email,
          bio: data.bio || '',
          password: '',
          confirmPassword: ''
        });

        setErrorMessage(null);
      } catch (error) {
        console.error('Failed to fetch account data:', error);
        setErrorMessage('Failed to load profile data');
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    fetchAccountData();
  }, [loadUser, reset]);

  const toggleTheme = () => {
    const newTheme = theme === 'cyberpunk' ? 'cyberpunk-dark' : 'cyberpunk';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    setShowLogoutScreen(true);
    setTimeout(() => {
      logout();
      navigate('/auth');
    }, 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setErrorMessage('Please select an image file');
          return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrorMessage('Image must be smaller than 5MB');
          return;
        }

        // Resize image to 256x256
        const resizedFile = await accountService.resizeImage(file, 256);
        setSelectedFile(resizedFile);

        // Create preview
        const previewUrl = URL.createObjectURL(resizedFile);
        setAvatarPreview(previewUrl);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error processing image:', error);
        setErrorMessage('Failed to process image');
      }
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updateData: UpdateAccountData = {
        username: data.username,
        email: data.email,
        bio: data.bio || '',
      };

      // Add password if provided
      if (data.password && data.password.trim().length > 0) {
        updateData.password = data.password;
      }

      // Add avatar if selected
      if (selectedFile) {
        updateData.avatar = selectedFile;
      }

      const updatedAccount = await accountService.updateMyAccount(updateData);
      setAccountData(updatedAccount);
      
      // Clear avatar preview and password fields
      setAvatarPreview(null);
      setSelectedFile(null);
      setValue('password', '');
      setValue('confirmPassword', '');
      
      // Refresh user data in auth store
      await loadUser();
      
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (accountData) {
      reset({
        username: accountData.username,
        email: accountData.email,
        bio: accountData.bio || '',
        password: '',
        confirmPassword: ''
      });
    }
    setAvatarPreview(null);
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Loading screen */}
      {isLoading && <LoadingScreen text="LOADING PROFILE" />}

      {/* Logout screen */}
      {showLogoutScreen && <LoadingScreen text="TERMINATING SESSION" />}

      {/* Background grid and decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg"></div>
        
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-primary to-transparent"></div>
        
        {/* Tech-inspired typography */}
        <div className="absolute top-20 left-10 opacity-5 text-9xl font-mono text-primary">USR</div>
        <div className="absolute bottom-20 right-10 opacity-5 text-9xl font-mono text-primary">CFG</div>
      </div>

      {/* Main content */}
      <div className={`relative z-10 transition-opacity duration-500 ${isLoading || showLogoutScreen ? 'opacity-0' : 'opacity-100'} scanline`}>
        <header className="p-4 border-b border-primary/20 backdrop-blur-sm bg-base-100/80">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={() => navigate('/dashboard')}>
              <img src={logo} alt="Darknet Duel Logo" className="h-8" />
              <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                DARKNET_DUEL
              </h1>
            </div>
        
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
              >
                <span className="mr-1">🏠</span> 
                <span className="hidden sm:inline">DASHBOARD</span>
              </button>
              
              <button 
                onClick={() => navigate('/lobbies')} 
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
              >
                <span className="mr-1">🎮</span> 
                <span className="hidden sm:inline">LOBBY</span>
              </button>
              
              <button 
                onClick={() => navigate('/topup')} 
                className="btn btn-sm bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 hover:border-yellow-300 text-black font-bold btn-cyberpunk pulse-glow relative overflow-hidden group"
                aria-label="Top Up"
              >
                <span className="mr-1">💎</span>
                <span className="hidden sm:inline text-flicker">TOP-UP</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                aria-label="Toggle Theme"
              >
                {theme === 'cyberpunk' ? '🌙' : '☀️'}
              </button>
              
              <button
                onClick={handleLogout}
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                aria-label="Logout"
              >
                <span className="mr-1">🚪</span>
                <span className="hidden sm:inline">EXIT</span>
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          {/* Profile header */}
          <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm mb-8">
            <div className="bg-base-200 border border-primary/20 p-4 relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <div className="font-mono">
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-2xl font-bold mb-2 font-mono">
                    USER_PROFILE: <span className="text-primary data-corrupt" data-text={user?.username}>{user?.username}</span>
                  </h2>
                </div>
                <div className="text-base-content text-sm">
                  CONFIGURATION_MODE: ACTIVE | ACCESS_LEVEL: USER
                </div>
                <div className="text-xs text-primary mt-3">⚠️ SENSITIVE DATA • HANDLE WITH CARE</div>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <div className="max-w-4xl mx-auto">
            <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
              <div className="bg-base-200 border border-primary/20 p-6 relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>

                {/* Success message */}
                {successMessage && (
                  <div className="mb-6 p-3 border border-success/30 bg-success/10 text-success text-sm font-mono flex items-start">
                    <div className="mr-2 text-base">✓</div>
                    <div>
                      <div className="font-bold mb-0.5">UPDATE_SUCCESSFUL</div>
                      <div>{successMessage}</div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {errorMessage && (
                  <div className="mb-6 p-3 border border-error/30 bg-error/10 text-error text-sm font-mono flex items-start">
                    <div className="mr-2 text-base">!</div>
                    <div>
                      <div className="font-bold mb-0.5">SYSTEM_ERROR</div>
                      <div>{errorMessage}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Avatar */}
                    <div className="lg:col-span-1">
                      <div className="text-center">
                        <label className="font-mono text-primary text-sm mb-4 block">PROFILE_IMAGE</label>
                        
                        <div className="relative mx-auto w-64 h-64 group cursor-pointer" onClick={handleAvatarClick}>
                          <div className="w-full h-full border-2 border-primary/30 bg-base-300/50 rounded-lg overflow-hidden relative group-hover:border-primary transition-colors">
                            <img
                              src={avatarPreview || (accountData ? accountService.getAvatarUrl(accountData.id) : logo)}
                              alt="Profile Avatar"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = logo;
                              }}
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white font-mono text-sm text-center">
                                <div className="text-lg mb-1">📷</div>
                                <div>CLICK_TO_CHANGE</div>
                                <div className="text-xs mt-1">256x256 • MAX 5MB</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        <div className="text-xs text-base-content/70 font-mono mt-2">
                          FORMATS: JPG, PNG, GIF, WEBP
                        </div>
                      </div>
                    </div>

                    {/* Right columns - Form fields */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Username */}
                      <div className="form-control">
                        <label className="label py-0.5">
                          <span className="font-mono text-xs text-primary">USERNAME</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary ${errors.username ? 'border-error' : ''}`}
                            {...register('username')}
                            disabled={isSaving}
                          />
                          <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                            <span className="text-xs font-mono">ID</span>
                          </div>
                        </div>
                        {errors.username && (
                          <div className="text-error text-xs mt-1 font-mono">{errors.username.message}</div>
                        )}
                      </div>

                      {/* Bio */}
                      <div className="form-control">
                        <label className="label py-0.5">
                          <span className="font-mono text-xs text-primary">BIO</span>
                          <span className="text-xs text-base-content/50 font-mono">
                            {watch('bio')?.length || 0}/30
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Tell the network about yourself..."
                            className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary ${errors.bio ? 'border-error' : ''}`}
                            {...register('bio')}
                            disabled={isSaving}
                            maxLength={30}
                          />
                          <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                            <span className="text-xs font-mono">BIO</span>
                          </div>
                        </div>
                        {errors.bio && (
                          <div className="text-error text-xs mt-1 font-mono">{errors.bio.message}</div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="form-control">
                        <label className="label py-0.5">
                          <span className="font-mono text-xs text-primary">EMAIL</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary ${errors.email ? 'border-error' : ''}`}
                            {...register('email')}
                            disabled={isSaving}
                          />
                          <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                            <span className="text-xs font-mono">@</span>
                          </div>
                        </div>
                        {errors.email && (
                          <div className="text-error text-xs mt-1 font-mono">{errors.email.message}</div>
                        )}
                      </div>

                      {/* Password */}
                      <div className="form-control">
                        <label className="label py-0.5">
                          <span className="font-mono text-xs text-primary">NEW PASSWORD</span>
                          <span className="text-xs text-base-content/50 font-mono">OPTIONAL</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="Leave blank to keep current password"
                            className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary ${errors.password ? 'border-error' : ''}`}
                            {...register('password')}
                            disabled={isSaving}
                          />
                          <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                            <span className="text-xs font-mono">SEC</span>
                          </div>
                        </div>
                        {errors.password && (
                          <div className="text-error text-xs mt-1 font-mono">{errors.password.message}</div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="form-control">
                        <label className="label py-0.5">
                          <span className="font-mono text-xs text-primary">CONFIRM PASSWORD</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary ${errors.confirmPassword ? 'border-error' : ''}`}
                            {...register('confirmPassword')}
                            disabled={isSaving}
                          />
                          <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                            <span className="text-xs font-mono">VER</span>
                          </div>
                        </div>
                        {errors.confirmPassword && (
                          <div className="text-error text-xs mt-1 font-mono">{errors.confirmPassword.message}</div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className={`btn btn-primary flex-1 font-mono relative overflow-hidden group btn-cyberpunk ${isSaving ? 'pulse-glow' : ''}`}
                          disabled={isSaving}
                        >
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            {isSaving ? (
                              <>
                                <span className="loading-dot bg-base-100 animation-delay-0"></span>
                                <span className="loading-dot bg-base-100 animation-delay-200"></span>
                                <span className="loading-dot bg-base-100 animation-delay-400"></span>
                                <span className="ml-2 text-flicker">UPDATING</span>
                              </>
                            ) : (
                              <>
                                <span>💾</span>
                                <span>SAVE_CHANGES</span>
                              </>
                            )}
                          </div>
                          <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCancel}
                          className="btn btn-outline btn-primary flex-1 font-mono btn-cyberpunk"
                          disabled={isSaving}
                        >
                          <span className="mr-2">↶</span>
                          CANCEL_CHANGES
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-4 border-t border-primary/20 text-center mt-8">
          <div className="text-base-content/60 text-xs font-mono">
            PROFILE_CONFIG v1.0 • {new Date().toISOString().split('T')[0]} • 
            <span className="text-primary ml-1 text-flicker">SECURITY: HIGH</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProfilePage; 