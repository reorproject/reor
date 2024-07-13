import React, { useEffect, useRef, useState } from "react";

import { FaTrash } from "react-icons/fa";

interface OptionType {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: OptionType[];
  selectedValue: string;
  onChange: (value: string) => void;
  addButton?: {
    label: string;
    onClick: () => void;
  };
  onDelete?: (value: string) => void;
  centerText?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  selectedValue,
  onChange,
  addButton,
  onDelete,
  centerText = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const toggleDropdown = () => { setIsOpen(!isOpen); };
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleDeleteModelInDropdown = async (selectedModel: string) => {
    if (onDelete) {
      onDelete(selectedModel);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-end w-full" ref={wrapperRef}>
      <div
        className="flex justify-between w-full items-center  py-2 border border-gray-300 rounded-md cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten"
        onClick={toggleDropdown}
      >
        {centerText ? <span></span> : null}
        <span className="pl-2 pr-2 text-[13px] text-gray-100">
          {selectedValue}
        </span>
        <span
          className="transform transition-transform mr-2"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        >
          &#9660;
        </span>
      </div>
      {isOpen && (
        <div
          className="absolute  text-[13px] border text-gray-600 border-gray-300 rounded-md shadow-lg z-10 bg-white max-h-60 overflow-auto"
          style={{
            position: "fixed",
            top: "auto",
            left: wrapperRef.current?.getBoundingClientRect().left,
            width: wrapperRef.current?.getBoundingClientRect().width,
          }}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 pl-6 pr-2 bg-dark-gray-c-eight cursor-pointer text-white hover:bg-dark-gray-c-ten "
              onClick={() => { handleOptionClick(option.value); }}
            >
              <span className="w-full">{option.label}</span>
              {selectedValue === option.value ? (
                <span className="text-blue-500">&#10003;</span>
              ) : onDelete ? (
                <span
                  onClick={() => handleDeleteModelInDropdown(option.value)}
                  className="ml-2 text-[13px] text-red-700"
                >
                  <FaTrash />
                </span>
              ) : null}
            </div>
          ))}

          {addButton && (
            <div
              className="py-2 pl-2 pr-2 mt-1 bg-neutral-200 text-gray-700 text-center cursor-pointer rounded-md hover:bg-neutral-300 shadow-sm transition-colors"
              onClick={addButton.onClick}
            >
              {addButton.label}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
