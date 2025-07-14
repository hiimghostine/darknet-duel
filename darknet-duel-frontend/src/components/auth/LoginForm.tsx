import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface LoginFormProps {
  onToggleForm: () => void;
}

// Define login schema with Zod for validation
const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof LoginSchema>;

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const [showAuthErrorFlash, setShowAuthErrorFlash] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  // Clear error when typing
  React.useEffect(() => {
    if (error) {
      const subscription = watch(() => clearError());
      return () => subscription.unsubscribe();
    }
  }, [error, watch, clearError]);
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Authentication state and redirect handled by parent component
    } catch (error) {
      // Show error animation for visual feedback with longer duration
      setShowErrorAnimation(true);
      setTimeout(() => setShowErrorAnimation(false), 1500);
      
      // Show auth error flash animation (red flash + vibration for 500ms)
      setShowAuthErrorFlash(true);
      setTimeout(() => setShowAuthErrorFlash(false), 500);
      
      // Note: The actual error handling is managed by the auth store
      console.error('Authentication error:', error);
    }
  };
  
  return (
    <div className="w-full">
      {/* Error display with animation */}
      {error && (
        <div className={`mb-4 p-2 border border-error/30 bg-error/10 text-error text-xs sm:text-sm font-mono flex items-start ${showErrorAnimation ? 'pulse-error' : ''}`}>
          <div className="mr-2 text-base">!</div>
          <div>
            <div className="font-bold mb-0.5">AUTHENTICATION_ERROR</div>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <div className="form-control">
            <label className="label py-0.5">
              <span className="font-mono text-xs text-primary">EMAIL</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary ${errors.email ? 'border-error' : ''} ${showErrorAnimation ? 'border-error' : ''} ${showAuthErrorFlash ? 'auth-error-flash' : ''}`}
                {...register('email')}
                disabled={isLoading}
              />
              <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                <span className="text-xs font-mono">ID</span>
              </div>
            </div>
            {errors.email && (
              <div className="text-error text-xs mt-1 font-mono">{errors.email.message}</div>
            )}
          </div>

          <div className="form-control">
            <label className="label py-0.5">
              <span className="font-mono text-xs text-primary">PASSWORD</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className={`input w-full bg-base-300/50 border-primary/30 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary ${errors.password ? 'border-error' : ''} ${showErrorAnimation ? 'border-error' : ''} ${showAuthErrorFlash ? 'auth-error-flash' : ''}`}
                {...register('password')}
                disabled={isLoading}
              />
              <div className="absolute top-0 right-0 h-full px-3 flex items-center text-base-content/30 pointer-events-none">
                <span className="text-xs font-mono">SEC</span>
              </div>
            </div>
            {errors.password && (
              <div className="text-error text-xs mt-1 font-mono">{errors.password.message}</div>
            )}
          </div>

          <div className="form-control mt-4">
            <button 
              type="submit" 
              className={`btn btn-sm sm:btn-md btn-primary w-full font-mono relative overflow-hidden group btn-cyberpunk ${isLoading ? 'pulse-glow' : ''} ${showAuthErrorFlash ? 'auth-error-flash' : ''}`}
              disabled={isLoading}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <span className="loading-dot bg-base-100 animation-delay-0"></span>
                    <span className="loading-dot bg-base-100 animation-delay-200"></span>
                    <span className="loading-dot bg-base-100 animation-delay-400"></span>
                    <span className="ml-2 text-flicker">AUTHENTICATING</span>
                  </>
                ) : (
                  <span>AUTHENTICATE</span>
                )}
              </div>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      </form>
      
      {/* Register link */}
      <div className="mt-3 pt-2 border-t border-base-content/10 text-center font-mono text-xs">
        <div className="text-base-content/70 mb-0.5">NEW USER REGISTRATION</div>
        <button 
          onClick={onToggleForm}
          className="inline-block text-primary hover:text-primary/80 transition-colors"
        >
          [ CREATE_NEW_IDENTITY ]
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
