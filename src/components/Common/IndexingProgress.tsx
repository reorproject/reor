import React, { useEffect, useState } from 'react'
import { YStack, H2, SizableText } from 'tamagui'

import CircularProgress from '@mui/material/CircularProgress'

import ReorModal from './Modal'

interface IndexingProgressProps {
  indexingProgress: number
}

const IndexingProgress: React.FC<IndexingProgressProps> = ({ indexingProgress }) => {
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [eta, setEta] = useState<string>('Initializing...')

  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  useEffect(() => {
    if (indexingProgress > 0) {
      const elapsedTime = Date.now() - startTime
      const estimatedTotalTime = elapsedTime / indexingProgress
      const remainingTime = estimatedTotalTime - elapsedTime

      const etaMinutes = Math.floor(remainingTime / 60000)
      const etaSeconds = Math.floor((remainingTime % 60000) / 1000)
      setEta(`${etaMinutes}m ${etaSeconds}s remaining`)
    }
  }, [indexingProgress, startTime])

  return (
    <ReorModal isOpen onClose={() => {}} hideCloseButton>
      <YStack className="mx-3 mb-3 mt-2 h-[100px] w-[500px]">
        <H2 fontWeight="semi-bold" fontSize="xl" color="$gray13">
          {indexingProgress === 0 ? 'Initializing vector database...' : 'Indexing files...'}
        </H2>
        <div
          className={`mb-2 h-4 w-full overflow-hidden rounded-full border-2 border-gray-400 ${
            indexingProgress !== 0 ? 'bg-neutral-800' : ''
          }`}
        >
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${indexingProgress * 100}%` }}
          />
        </div>
        <div className="flex">
          {indexingProgress === 0 && <CircularProgress size={20} thickness={7} className="mr-2" />}

          <SizableText fontSize={14} color="$gray13">
            {indexingProgress > 0 && <>{Math.round(indexingProgress * 100)}% -</>} {eta}
          </SizableText>
        </div>
      </YStack>
    </ReorModal>
  )
}

export default IndexingProgress
