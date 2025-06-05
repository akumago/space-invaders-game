import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`dq-window w-full ${sizeClasses[size]}`}>
        {title && <h2 className={`text-xl sm:text-2xl font-bold mb-4 text-yellow-400 text-shadow-dq`}>{title}</h2>}
        <div className="modal-content text-shadow-dq">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="dq-button danger w-full-dq-button mt-6"
          >
            とじる
          </button>
        )}
      </div>
    </div>
  );
};
