import React, { useState, useRef, useEffect } from "react";

type OptionType = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  options: OptionType[];
  value: string;
  onChange: (value: string) => void;
  addButton?: {
    label: string;
    onClick: () => void;
  };
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  addButton,
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

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full " ref={wrapperRef}>
      <div
        className="flex justify-between items-center w-full py-2 border border-gray-300 rounded-md bg-gray-200 cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="ml-2 text-[13px] text-gray-600">{value}</span>
        <span
          className="transform transition-transform mr-2"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        >
          &#9660;
        </span>
      </div>
      {isOpen && (
        <div className="absolute w-full text-[13px] border text-gray-600 border-gray-300 rounded-md shadow-lg z-10 bg-white max-h-60 overflow-auto">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 pl-2 pr-2 hover:bg-gray-100 cursor-pointer rounded-md"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
              {value === option.value && (
                <span className="text-blue-500">&#10003;</span> // Tick mark
              )}
            </div>
          ))}

          {addButton && (
            <div
              className="py-2 pl-2 pr-2 mt-1 bg-gray-200 text-gray-700 text-center cursor-pointer rounded-md hover:bg-gray-300 shadow-sm transition-colors"
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
