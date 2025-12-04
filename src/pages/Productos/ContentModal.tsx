import React from "react";

interface ContentModalProps {
  modalContent: {
    title: string;
    content: string;
  } | null;
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ modalContent, onClose }) => {
  if (!modalContent) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800/50 rounded-xl p-5 max-w-md w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-white">
            {modalContent.title}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-white text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="text-neutral-400 text-sm whitespace-pre-wrap leading-relaxed">
          {modalContent.content}
        </div>
      </div>
    </div>
  );
};

export default ContentModal;