import React, { useState, useRef, useEffect } from "react";

type CustomSelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
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
  const handleOptionClick = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full " ref={wrapperRef}>
      <div
        className="flex justify-between items-center  w-full py-2 border border-gray-300 rounded-md bg-gray-200 cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="ml-2 text-[13px] text-gray-600">{value}</span>
        <span
          className="transform transition-transform mr-2"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        >
          &#9660;{" "}
        </span>
      </div>
      {isOpen && (
        <div className="absolute w-full border border-gray-300 rounded-md shadow-lg z-10 bg-white">
          {options.map((option, index) => (
            <div
              key={index}
              className=" py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
