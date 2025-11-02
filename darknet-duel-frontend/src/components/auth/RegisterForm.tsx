import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAudioManager } from '../../hooks/useAudioManager';
// Toasts are centralized in the auth store; avoid direct toast calls here

interface RegisterFormProps {
  onToggleForm: () => void;
}

// Define registration schema with Zod for validation
const RegisterSchema = z.object({
  username: z.string()
    .min(6, 'Username must be at least 6 characters')
    .max(16, 'Username must be at most 16 characters')
    .regex(/^[\x00-\x7F]*$/, 'Username can only contain ASCII characters'),
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email must be at most 254 characters')
    .regex(/^[\x00-\x7F]*$/, 'Email can only contain ASCII characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(63, 'Password must be at most 63 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^\w\s]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const { triggerClick, triggerError, triggerNotification } = useAudioManager();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  // Clear error when typing
  React.useEffect(() => {
    if (error) {
      const subscription = watch(() => clearError());
      return () => subscription.unsubscribe();
    }
  }, [error, watch, clearError]);
  
  
  const onSubmit = async (data: RegisterFormData) => {
    try {
      triggerClick();
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password
      };
      
      await registerUser(userData);
      triggerNotification();
      setSuccessMessage('Registration successful! Redirecting to your dashboard...');
      
      // Success toast handled by auth store
      
      // Redirect will be handled by the parent component
    } catch (error: any) {
      triggerError();
      
      // Show error animation for visual feedback with longer duration
      setShowErrorAnimation(true);
      setTimeout(() => setShowErrorAnimation(false), 1500);
      
      // Error toast handled by auth store
      
      console.error('Registration error:', error);
    }
  };
  
  return (
    <div className="w-full">
      {/* Error display with animation */}
      {error && (
        <div className={`mb-4 p-2 border border-error/30 bg-error/10 text-error text-xs sm:text-sm font-mono flex items-start ${showErrorAnimation ? 'pulse-error' : ''}`}>
          <div className="mr-2 text-base">!</div>
          <div>
            <div className="font-bold mb-0.5">REGISTRATION_ERROR</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-2 border border-success/30 bg-success/10 text-success text-xs sm:text-sm font-mono flex items-start">
          <div className="mr-2 text-base">✓</div>
          <div>
            <div className="font-bold mb-0.5">IDENTITY_CREATED</div>
            <div>{successMessage}</div>
          </div>
        </div>
      )}

      {/* Registration form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block mb-1">
              <span className="font-mono text-xs text-primary">USERNAME</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="System login name"
                maxLength={16}
                className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary ${errors.username ? 'border-error' : ''}`}
                {...register('username')}
                onInput={(e) => {
                  // Filter out non-ASCII characters
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^\x00-\x7F]/g, '');
                }}
                disabled={isLoading || !!successMessage}
              />
              <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                <span className="text-xs font-mono">ID</span>
              </div>
            </div>
            <div className="text-xs text-primary/70 mt-1 font-mono">6-16 characters</div>
            {errors.username && (
              <div className="text-error text-xs mt-1 font-mono">{errors.username.message}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">
              <span className="font-mono text-xs text-primary">EMAIL</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                maxLength={254}
                className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary ${errors.email ? 'border-error' : ''}`}
                {...register('email')}
                onInput={(e) => {
                  // Filter out non-ASCII characters
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^\x00-\x7F]/g, '');
                }}
                disabled={isLoading || !!successMessage}
              />
              <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                <span className="text-xs font-mono">@</span>
              </div>
            </div>
            {errors.email && (
              <div className="text-error text-xs mt-1 font-mono">{errors.email.message}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">
              <span className="font-mono text-xs text-primary">PASSWORD</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Create a secure password"
                className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary ${errors.password ? 'border-error' : ''}`}
                {...register('password')}
                disabled={isLoading || !!successMessage}
              />
              <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                <span className="text-xs font-mono">SEC</span>
              </div>
            </div>
            <div className="text-xs text-primary/70 mt-1 font-mono">8-63 chars, 1 upper, 1 lower, 1 number, 1 special</div>
            {errors.password && (
              <div className="text-error text-xs mt-1 font-mono">{errors.password.message}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">
              <span className="font-mono text-xs text-primary">CONFIRM PASSWORD</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm your password"
                className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary ${errors.confirmPassword ? 'border-error' : ''}`}
                {...register('confirmPassword')}
                disabled={isLoading || !!successMessage}
              />
              <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                <span className="text-xs font-mono">VER</span>
              </div>
            </div>
            {errors.confirmPassword && (
              <div className="text-error text-xs mt-1 font-mono">{errors.confirmPassword.message}</div>
            )}
          </div>

          <div className="mt-3">
            <button 
              type="submit" 
              className={`btn btn-sm sm:btn-md btn-primary w-full font-mono relative overflow-hidden group btn-cyberpunk ${isLoading ? 'pulse-glow' : ''}`}
              disabled={isLoading || !!successMessage}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <span className="loading-dot bg-base-100 animation-delay-0"></span>
                    <span className="loading-dot bg-base-100 animation-delay-200"></span>
                    <span className="loading-dot bg-base-100 animation-delay-400"></span>
                    <span className="ml-2 text-flicker">CREATING_IDENTITY</span>
                  </>
                ) : (
                  <span>CREATE_IDENTITY</span>
                )}
              </div>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      </form>

      {/* Login link */}
      <div className="mt-3 pt-2 border-t border-base-content/10 text-center font-mono text-xs">
        <div className="text-base-content/70 mb-0.5">EXISTING USER LOGIN</div>
        <button 
          onClick={() => {
            triggerClick();
            onToggleForm();
          }}
          className="inline-block text-primary hover:text-primary/80 transition-colors"
        >
          [ ACCESS_NETWORK ]
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
