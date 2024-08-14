import React, { useState, useEffect, useRef } from 'react'
import { FaRegArrowAltCircleDown } from 'react-icons/fa'

/**
 * Displays "Click to scroll to bottom" when the bottom of the container
 *   is out of view.
 */
const ScrollableContainer = ({ children }) => {
  const [isAtBottom, setIsAtBottom] = useState(true)
  const scrollableRef = useRef(null)

  const handleScroll = () => {
    if (scrollableRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 1
      setIsAtBottom(isScrolledToBottom)
    }
  }

  const scrollToBottom = () => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({ top: scrollableRef.current.scrollHeight, behavior: 'smooth' })
    }
  }

  const checkIfAtBottom = () => {
    if (scrollableRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 1 || scrollHeight <= clientHeight)
    }
  }

  useEffect(() => {
    console.log('Scrollable View re-rendered!')
    const scrollableElement = scrollableRef.current
    if (scrollableElement) scrollableElement.addEventListener('scroll', handleScroll)
    return () => {
      if (scrollableElement) scrollableElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    // Check if at bottom when the component is mounted or updated
    checkIfAtBottom()
  }, [children])

  return (
    <div className="relative flex h-full flex-col overflow-auto bg-transparent pt-0" ref={scrollableRef}>
      <div className="mt-2 grow space-y-2">{children}</div>
      {!isAtBottom && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 cursor-pointer p-2 pl-60 text-white"
          onClick={scrollToBottom}
        >
          <FaRegArrowAltCircleDown size={28} color="white" />
        </div>
      )}
    </div>
  )
}

export default ScrollableContainer