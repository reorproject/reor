import React, { useEffect, useState } from 'react'
import { BsChatLeftDots, BsChatLeftDotsFill } from 'react-icons/bs'
import NavigationButtons from './NavigationButtons'
import ExternalLink from '../Common/ExternalLink'
import { useChatContext } from '@/contexts/ChatContext'
import { XStack, SizableText } from 'tamagui'
import { MessageSquareMore, MessageSquareOff } from '@tamagui/lucide-icons'

export const titleBarHeight = '30px'

const TitleBar: React.FC = () => {
  const { showChatbot, setShowChatbot } = useChatContext()
  const [platform, setPlatform] = useState('')

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electronUtils.getPlatform()
      setPlatform(response)
    }

    fetchPlatform()
  }, [])

  return (
    <XStack backgroundColor="$gray3" className="electron-drag flex justify-between bg-[#303030]">
      <div className="mt-px flex" style={platform === 'darwin' ? { marginLeft: '65px' } : { marginLeft: '2px' }}>
        <NavigationButtons />
      </div>

      <div
        className="electron-no-drag mt-[0.5px] flex items-center justify-end"
        style={platform === 'win32' ? { marginRight: '8.5rem' } : { marginRight: '0.3rem' }}
      >
        <ExternalLink href="https://forms.gle/8H4GtEcE6MBnNAUa7" className="cursor-pointer">
          <SizableText color="$gray13" fontSize={14} className="mr-2">
            Feedback
          </SizableText>
        </ExternalLink>
        {showChatbot ? (
          <MessageSquareOff
            className="electron-no-drag mr-1 mt-[0.2rem] ml-1 -scale-x-100 cursor-pointer p-[2px] text-gray-100"
            size={19}
            title="Hide Similar Files"
            onClick={() => setShowChatbot((show) => !show)}
          />
        ) : (
          <MessageSquareMore
            className="electron-no-drag mr-1 mt-[0.2rem ml-1 -scale-x-100 cursor-pointer p-[2px] text-gray-100"
            size={22}
            title="Show Chatbot"
            onClick={() => setShowChatbot((show) => !show)}
          />
        )}
      </div>
    </XStack>
  )
}

export default TitleBar
