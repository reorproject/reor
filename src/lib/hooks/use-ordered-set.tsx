import { useState, useCallback } from 'react'

// Custom hook for managing ordered set
const useOrderedSet = (initialValues: string[] = []) => {
  const [set, setSet] = useState(new Set(initialValues))

  const add = useCallback((value: string) => {
    setSet((prevSet) => {
      const newSet = new Set(prevSet)
      if (newSet.has(value)) {
        newSet.delete(value)
      }
      newSet.add(value)
      return newSet
    })
  }, [])

  const remove = useCallback((value: string) => {
    setSet((prevSet) => {
      const newSet = new Set(prevSet)
      newSet.delete(value)
      return newSet
    })
  }, [])

  const clear = useCallback(() => {
    setSet(new Set())
  }, [])

  return {
    set,
    add,
    remove,
    clear,
    values: Array.from(set),
  }
}

export default useOrderedSet
