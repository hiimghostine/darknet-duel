import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 8000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-success/10 text-success';
      case 'error':
        return 'border-error/30 bg-error/10 text-error';
      case 'warning':
        return 'border-warning/30 bg-warning/10 text-warning';
      case 'info':
        return 'border-info/30 bg-info/10 text-info';
      default:
        return 'border-base-content/30 bg-base-content/10 text-base-content';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📋';
    }
  };

  return (
    <div
      className={`
        w-80 max-w-sm mb-4
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className={`
        border rounded-lg p-4 shadow-2xl backdrop-blur-sm
        ${getTypeStyles()}
        font-mono text-sm
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getIcon()}</span>
            <span className="font-bold text-base">{title}</span>
          </div>
          <button
            onClick={handleClose}
            className="text-current hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        </div>

        {/* Message */}
        <div className="whitespace-pre-line text-sm leading-relaxed">
          {message}
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-current/20 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-current rounded-full ease-linear"
            style={{
              width: '100%',
              transition: `width ${duration}ms linear`,
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast; 