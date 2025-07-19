import React, { useEffect, useRef } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onReport: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isVisible,
  position,
  onClose,
  onReport
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-base-100 border border-error/30 rounded-lg shadow-lg backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '150px'
      }}
    >
      <div className="p-1">
        <button
          onClick={onReport}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-mono text-error hover:bg-error/10 transition-colors rounded"
        >
          <FaExclamationTriangle className="text-xs" />
          Report Message
        </button>
      </div>
    </div>
  );
};

export default ContextMenu; 