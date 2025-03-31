import React, { useEffect, useState } from 'react'
import { XStack, SizableText } from 'tamagui'
import { MessageSquareMore, MessageSquareOff, PanelRightOpen, PanelRightClose } from '@tamagui/lucide-icons'
import NavigationButtons from './NavigationButtons'
import ExternalLink from '../Common/ExternalLink'

export const titleBarHeight = '30px'

interface TitleBarProps {
  activePanel: 'chat' | 'similarFiles' | null
  togglePanel: (show: 'chat' | 'similarFiles' | null) => void
}

const TitleBar: React.FC<TitleBarProps> = ({ activePanel, togglePanel }) => {
  const [platform, setPlatform] = useState('')

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electronUtils.getPlatform()
      setPlatform(response)
    }

    fetchPlatform()
  }, [])

  return (
    <XStack alignItems="center" backgroundColor="$gray3" className="electron-drag flex justify-between bg-[#303030]">
      <div className="mt-px flex" style={platform === 'darwin' ? { marginLeft: '65px' } : { marginLeft: '2px' }}>
        <NavigationButtons />
      </div>

      <XStack
        className="electron-no-drag flex items-center justify-end"
        style={platform === 'win32' ? { marginRight: '8.5rem' } : { marginRight: '0.3rem' }}
      >
        <ExternalLink href="https://forms.gle/8H4GtEcE6MBnNAUa7" className="mr-4 cursor-pointer">
          <SizableText color="$gray11" fontSize={14} className="mr-4">
            Feedback
          </SizableText>
        </ExternalLink>
        <XStack onPress={() => togglePanel('chat')}>
          {activePanel !== 'chat' ? (
            <MessageSquareMore size={22} title="Show Chatbot" color="$gray11" cursor="pointer" />
          ) : (
            <MessageSquareOff size={22} title="Hide Similar Files" color="$gray11" cursor="pointer" />
          )}
        </XStack>
        <XStack marginLeft={3} onPress={() => togglePanel('similarFiles')}>
          {activePanel !== 'similarFiles' ? (
            <PanelRightOpen size={22} title="Show Similar Files" color="$gray11" cursor="pointer" />
          ) : (
            <PanelRightClose size={22} title="Hide Similar Files" color="$gray11" cursor="pointer" />
          )}
        </XStack>
      </XStack>
    </XStack>
  )
}

export default TitleBar
