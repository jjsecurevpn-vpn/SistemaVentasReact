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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-200">
            {modalContent.title}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="text-neutral-300 whitespace-pre-wrap">
          {modalContent.content}
        </div>
      </div>
    </div>
  );
};

export default ContentModal;