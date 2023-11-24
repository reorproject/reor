import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl p-5">
        <button
          className="float-right text-gray-400 hover:text-gray-200"
          onClick={onClose}
        >
          &#10005; {/* This is a simple 'X' close icon */}
        </button>
        {/* {children} */}
        hello
      </div>
    </div>
  );
};

export default SettingsModal;
