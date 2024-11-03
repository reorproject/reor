import { useEffect, RefObject } from 'react'

const useResizeObserver = (ref: RefObject<HTMLElement>, callback: (entry: ResizeObserverEntry) => void) => {
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (ref.current) {
      const observer = new ResizeObserver((entries) => {
        callback(entries[0])
      })

      observer.observe(ref.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [ref, callback])
}

export default useResizeObserver
