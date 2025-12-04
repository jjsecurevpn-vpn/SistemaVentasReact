import React from "react";
import Modal from "../../components/Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar producto"
      size="sm"
    >
      <div className="text-center">
        <p className="text-neutral-400 text-sm mb-6">
          ¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;