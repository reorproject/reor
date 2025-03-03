import React, { useMemo } from 'react'

type AdaptContextType = {
  when: boolean
  AdaptProvider: React.FC<{ children: React.ReactNode }>
}

const AdaptContext = React.createContext<AdaptContextType | null>(null)

export const useAdapt = () => {
  const context = React.useContext(AdaptContext)
  if (!context) {
    throw new Error('useAdapt must be used within an AdaptProvider')
  }
  return context
}

export const useAdaptParent = (contents: React.ReactNode) => {
  const [when] = React.useState(false)

  const AdaptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const adaptMemo = useMemo(() => ({ when, AdaptProvider }), [])

    return (
      <AdaptContext.Provider value={adaptMemo}>
        {children}
        {when && contents}
      </AdaptContext.Provider>
    )
  }

  return { when, AdaptProvider }
}
