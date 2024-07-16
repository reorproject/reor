import React, { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  tailwindStylesOnBackground?: string;
  widthType?: ModalWidthType;
}

/*
 * Modal is used in many places for different functions. The dimensions that newNote window
 * should display is different than what settings should be. This is a wrapper to select the width
 * that should be displayed.
 */
type ModalWidthType =
  | "newNote"
  | "newDirectory"
  | "renameNote"
  | "renameDirectory"
  | "flashcardMode"
  | "flashcardReviewMode"
  | "newEmbeddingModel"
  | "localLLMSetting"
  | "remoteLLMSetting"
  | "indexingProgress"
  | "settingsContainer";

type Dimension =
  | "[500px]"
  | "[750px]"
  | "[300px]"
  | "full"
  | "[850px]"
  | "[900px]";

const customDimensionsMap: Record<ModalWidthType, Dimension> = {
  newNote: "[500px]",
  newDirectory: "[500px]",
  renameNote: "[500px]",
  renameDirectory: "[500px]",
  flashcardMode: "[750px]",
  flashcardReviewMode: "[300px]",
  newEmbeddingModel: "[500px]",
  localLLMSetting: "[500px]",
  remoteLLMSetting: "[500px]",
  indexingProgress: "[850px]",
  settingsContainer: "[900px]",
};

const getDimension = (name: ModalWidthType | undefined): Dimension => {
  if (name === undefined) {
    return "full";
  }
  return customDimensionsMap[name] || "full";
};

const ReorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hideCloseButton,
  tailwindStylesOnBackground,
  widthType,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const widthClass = getDimension(widthType as ModalWidthType);

  const handleOffClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${tailwindStylesOnBackground}`}
    >
      <div
        ref={modalRef}
        className={`bg-dark-gray-c-three rounded-lg shadow-xl w-${widthClass} max-w-6xl  flex flex-col justify-center items-center border-solid border-gray-600 border`}
      >
        <div className="w-full items-end border-b border-gray-700 px-4 h-0 z-50">
          {!hideCloseButton && (
            <div className="flex justify-end m-2">
              <button
                onClick={onClose}
                className="w-5 h-5 flex items-center justify-center text-gray-600 cursor-pointer bg-transparent border-none hover:bg-slate-700 hover:bg-opacity-40"
              >
                <span className="text-3xl leading-none">&times;</span>
              </button>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default ReorModal;
