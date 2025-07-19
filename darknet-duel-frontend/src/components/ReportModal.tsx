import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { reportService } from '../services/report.service';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporteeId: string;
  reporteeUsername: string;
  reportType: 'profile' | 'chat';
  content?: string; // For chat reports, this is the message content
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reporteeId,
  reporteeUsername,
  reportType,
  content
}) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'Please provide a reason for the report' });
      return;
    }

    if (!user) {
      addToast({ type: 'error', title: 'Error', message: 'You must be logged in to submit a report' });
      return;
    }

    setIsSubmitting(true);

    try {
      await reportService.createReport({
        reporteeId,
        reason: reason.trim(),
        content: content || undefined,
        reportType
      });

      addToast({ type: 'success', title: 'Success', message: 'Report submitted successfully' });
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-base-100 border border-error/30 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-error text-xl" />
            <h3 className="text-lg font-mono font-bold text-error">
              REPORT_USER
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-base-content/60 hover:text-base-content transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-base-content/80 text-sm mb-2">
            You are reporting <span className="text-error font-mono">{reporteeUsername}</span>
          </p>
          <p className="text-base-content/60 text-xs mb-4">
            Report type: <span className="text-primary font-mono">{reportType.toUpperCase()}</span>
          </p>
          
          {content && (
            <div className="bg-base-200/50 border border-base-content/20 rounded p-3 mb-4">
              <p className="text-xs text-base-content/60 mb-1">REPORTED_MESSAGE:</p>
              <p className="text-sm text-base-content/80 font-mono">"{content}"</p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-mono text-base-content/80 mb-2">
              REASON_FOR_REPORT:
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for this report..."
              className="w-full h-24 p-3 bg-base-200 border border-base-content/20 rounded text-sm font-mono resize-none focus:border-error/50 focus:outline-none"
              maxLength={500}
              disabled={isSubmitting}
              required
            />
            <div className="text-xs text-base-content/50 mt-1 text-right">
              {reason.length}/500
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-base-300/50 border border-base-content/20 text-base-content hover:bg-base-300 transition-colors rounded font-mono text-sm disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 px-4 py-2 bg-error/20 border border-error/50 text-error hover:bg-error/30 transition-colors rounded font-mono text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                <>
                  <FaPaperPlane className="text-xs" />
                  SUBMIT_REPORT
                </>
              )}
            </button>
          </div>
        </form>

        {/* Warning */}
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
          <p className="font-mono">
            ⚠️ FALSE_REPORTS_MAY_RESULT_IN_ACCOUNT_SUSPENSION
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportModal; 