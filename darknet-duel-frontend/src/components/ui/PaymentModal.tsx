import React, { useState, useEffect } from 'react';
import paymentService, { type PaymentResult } from '../../services/payment.service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageDetails: {
    crypts: number;
    price: number;
    isPopular?: boolean;
    isBestValue?: boolean;
  };
  onSuccess: (result: PaymentResult) => void;
}

type PaymentState = 'processing' | 'success' | 'error' | 'cancelled';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  packageId,
  packageDetails,
  onSuccess
}) => {
  const [paymentState, setPaymentState] = useState<PaymentState>('processing');
  const [statusMessage, setStatusMessage] = useState('Initializing payment...');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Auto-start payment when modal opens
  useEffect(() => {
    if (isOpen && paymentState === 'processing') {
      startPayment();
    }
  }, [isOpen, packageId]);

  const startPayment = async () => {
    try {
      setPaymentState('processing');
      setStatusMessage('Initializing payment...');
      setErrorMessage('');

      const result = await paymentService.completePurchase(
        packageId,
        (status) => setStatusMessage(status)
      );

      setPaymentResult(result);
      setPaymentState('success');
      setStatusMessage('Payment completed successfully!');
      
      // Notify parent component of success
      onSuccess(result);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setStatusMessage('Payment failed');
    }
  };

  const handleClose = () => {
    if (paymentState === 'processing') {
      setPaymentState('cancelled');
      setStatusMessage('Payment cancelled');
    }
    onClose();
  };

  const handleRetry = () => {
    setPaymentState('processing');
    setErrorMessage('');
    startPayment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 border border-primary/30 p-6 max-w-md w-full relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">💎</span>
            <h3 className="text-xl font-bold font-mono text-primary">
              PAYMENT_PROCESSING
            </h3>
            <span className="text-2xl">💎</span>
          </div>
          <div className="text-sm text-base-content/70 font-mono">
            {packageDetails.crypts.toLocaleString()} CRYPTS • ₱{packageDetails.price}
          </div>
        </div>

        {/* Status indicator */}
        <div className="text-center mb-6">
          {paymentState === 'processing' && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="loading loading-ring loading-lg text-primary"></span>
                <div className="text-primary font-mono">PROCESSING...</div>
              </div>
              <div className="text-sm text-base-content/70">{statusMessage}</div>
            </div>
          )}

          {paymentState === 'success' && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl text-green-500">✅</div>
              <div className="text-green-500 font-mono font-bold">PAYMENT SUCCESSFUL!</div>
              {paymentResult && (
                <div className="text-sm text-base-content/70">
                  +{paymentResult.crypts.toLocaleString()} Crypts added to your account
                </div>
              )}
            </div>
          )}

          {paymentState === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl text-red-500">❌</div>
              <div className="text-red-500 font-mono font-bold">PAYMENT FAILED</div>
              <div className="text-sm text-red-400">{errorMessage}</div>
            </div>
          )}

          {paymentState === 'cancelled' && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl text-yellow-500">⚠️</div>
              <div className="text-yellow-500 font-mono font-bold">PAYMENT CANCELLED</div>
              <div className="text-sm text-base-content/70">Transaction was cancelled by user</div>
            </div>
          )}
        </div>

        {/* Instructions for processing state */}
        {paymentState === 'processing' && (
          <div className="bg-base-300/30 border border-primary/20 p-4 mb-6">
            <div className="text-sm text-base-content/80 font-mono text-center">
              <div className="mb-2">🔒 Complete your purchase in the payment window</div>
              <div className="text-xs text-base-content/60">
                A new window should have opened. If not, please check your popup blocker.
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {paymentState === 'processing' && (
            <button
              onClick={handleClose}
              className="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex-1 font-mono"
            >
              CANCEL
            </button>
          )}

          {paymentState === 'success' && (
            <button
              onClick={handleClose}
              className="btn btn-primary flex-1 font-mono"
            >
              CONTINUE
            </button>
          )}

          {paymentState === 'error' && (
            <>
              <button
                onClick={handleClose}
                className="btn btn-outline border-base-content/30 text-base-content flex-1 font-mono"
              >
                CLOSE
              </button>
              <button
                onClick={handleRetry}
                className="btn btn-primary flex-1 font-mono"
              >
                RETRY
              </button>
            </>
          )}

          {paymentState === 'cancelled' && (
            <button
              onClick={handleClose}
              className="btn btn-primary flex-1 font-mono"
            >
              CLOSE
            </button>
          )}
        </div>

        {/* Security notice */}
        <div className="mt-4 text-center">
          <div className="text-xs text-base-content/50 font-mono">
            🔒 Payments secured by Xendit • SSL encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 