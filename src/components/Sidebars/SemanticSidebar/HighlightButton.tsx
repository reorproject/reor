import React, { useEffect, useState } from 'react'

import { FaArrowRight } from 'react-icons/fa'
import { PiGraph } from 'react-icons/pi'

import '../../styles/global.css'
import { HighlightData } from '@/components/Editor/HighlightExtension'

interface HighlightButtonProps {
  highlightData: HighlightData
  onClick: () => void
}
const HighlightButton: React.FC<HighlightButtonProps> = ({ highlightData, onClick }) => {
  const [showArrow, setShowArrow] = useState<boolean>(false)

  useEffect(() => {
    // Reset to PiGraph icon when the position becomes undefined (unmounted)
    if (!highlightData.position) {
      setShowArrow(false)
    }
  }, [highlightData.position])

  if (!highlightData.position) {
    return null
  }

  const { top, left } = highlightData.position
  // top -= 55;
  // left -= 190;

  const handleClick = () => {
    onClick() // This calls the provided onClick handler
    setShowArrow(true) // Show the arrow icon
  }

  return (
    <button
      onClick={handleClick}
      style={{ top: `${top}px`, left: `${left}px` }}
      className="absolute flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-gray-200 text-white shadow-md hover:bg-gray-300"
      aria-label="Highlight button"
      type="button"
    >
      {showArrow ? <FaArrowRight className="text-gray-800" /> : <PiGraph className="text-gray-800" />}
    </button>
  )
}

export default HighlightButton
