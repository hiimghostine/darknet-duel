import React from 'react';
import Toast, { type ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
  onCloseToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onCloseToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
        >
          <Toast
            {...toast}
            onClose={onCloseToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 