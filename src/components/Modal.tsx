import React from 'react';
import { MdClose } from 'react-icons/md';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  const overlayClasses = "fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm overflow-y-auto";
  const layoutClasses = "min-h-full flex items-center md:items-start justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 pt-16 sm:pt-20 md:pt-32 pb-10 md:pb-12";
  const cardBaseClasses = "w-full border border-neutral-800 bg-neutral-900 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-6rem)]";

  return (
    <div className={overlayClasses}>
      <div className={layoutClasses}>
        <div className={`${cardBaseClasses} ${sizeClasses[size]} overflow-hidden`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-b border-neutral-800">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-200">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-700 bg-neutral-900 p-2 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 sm:p-6" style={{ scrollbarColor: '#404040 #262626' }}>
          {children}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;