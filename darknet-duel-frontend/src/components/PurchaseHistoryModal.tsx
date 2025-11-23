import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import infoService, { type PurchaseHistoryItem } from '../services/info.service';
import { useAudioManager } from '../hooks/useAudioManager';
import { useThemeStore } from '../store/theme.store';

interface PurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { triggerClick } = useAudioManager();
  const { theme } = useThemeStore();

  // Fetch purchase history when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchPurchaseHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const history = await infoService.getPurchaseHistory();
          setPurchaseHistory(history);
        } catch (err) {
          console.error('Failed to fetch purchase history:', err);
          setError('Failed to load purchase history');
        } finally {
          setIsLoading(false);
        }
      };

      fetchPurchaseHistory();
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 border border-primary/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>

        {/* Header */}
        <div className="bg-primary/10 border-b border-primary/20 p-4 sticky top-0 bg-base-200 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-mono text-primary">PURCHASE_HISTORY.log</h3>
            </div>
            <button
              onClick={() => {
                triggerClick();
                onClose();
              }}
              className="text-base-content/70 hover:text-primary transition-colors text-xl"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-base-content/70 mt-1 font-mono">
            Complete transaction history
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-error font-mono mb-4">{error}</div>
              <button
                onClick={() => {
                  triggerClick();
                  window.location.reload();
                }}
                className="btn btn-primary btn-sm font-mono"
              >
                RETRY
              </button>
            </div>
          ) : purchaseHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-base-content/50 font-mono text-sm">NO_PURCHASES_FOUND</div>
              <div className="text-base-content/30 font-mono text-xs mt-2">
                Your purchase history will appear here
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="text-left p-3 text-primary">PURCHASE_ID</th>
                    <th className="text-left p-3 text-primary">ITEM_TYPE</th>
                    <th className="text-left p-3 text-primary">ITEM_ID</th>
                    <th className="text-right p-3 text-primary">PRICE</th>
                    <th className="text-left p-3 text-primary">CURRENCY</th>
                    <th className="text-left p-3 text-primary">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.map((purchase, index) => (
                    <tr
                      key={purchase.id}
                      className={`border-b border-primary/10 hover:bg-base-300/30 transition-colors ${
                        index % 2 === 0 ? 'bg-base-300/10' : ''
                      }`}
                    >
                      <td className="p-3 text-base-content/70 font-mono text-xs">
                        {purchase.id}
                      </td>
                      <td className="p-3 text-base-content">
                        {purchase.itemType}
                      </td>
                      <td className="p-3 text-primary">
                        {purchase.itemId}
                      </td>
                      <td className="p-3 text-right text-base-content">
                        {purchase.purchasePrice}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          purchase.currency === 'creds' 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'bg-secondary/20 text-secondary border border-secondary/30'
                        }`}>
                          {purchase.currency.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-base-content/70 text-xs">
                        {formatDate(purchase.purchasedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-base-300/30 border-t border-primary/20 p-4">
          <div className="flex justify-between items-center">
            <div className="text-xs text-base-content/70 font-mono">
              {purchaseHistory.length} {purchaseHistory.length === 1 ? 'transaction' : 'transactions'}
            </div>
            <button
              onClick={() => {
                triggerClick();
                onClose();
              }}
              className="btn btn-primary btn-sm font-mono"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistoryModal;
