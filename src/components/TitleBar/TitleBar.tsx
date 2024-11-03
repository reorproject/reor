import React, { useEffect, useState } from 'react'
import { PiSidebarFill } from 'react-icons/pi'
import FileHistoryNavigator from './NavigationButtons'
import ExternalLink from '../Common/ExternalLink'
import { useChatContext } from '@/contexts/ChatContext'

export const titleBarHeight = '30px'

const TitleBar: React.FC = () => {
  const { setShowChatbot } = useChatContext()
  const [platform, setPlatform] = useState('')

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electronUtils.getPlatform()
      setPlatform(response)
    }

    fetchPlatform()
  }, [])

  return (
    <div className="electron-drag flex justify-between bg-[#303030]">
      <div className="mt-px flex" style={platform === 'darwin' ? { marginLeft: '65px' } : { marginLeft: '2px' }}>
        <FileHistoryNavigator />
      </div>

      <div
        className="electron-no-drag mt-[0.5px] flex items-center justify-end"
        style={platform === 'win32' ? { marginRight: '8.5rem' } : { marginRight: '0.3rem' }}
      >
        <ExternalLink href="https://forms.gle/8H4GtEcE6MBnNAUa7" className="decoration-gray-200">
          <span className="mr-2 cursor-pointer text-sm text-gray-200 hover:text-gray-300">Feedback</span>
        </ExternalLink>
        <PiSidebarFill
          className="electron-no-drag mt-[0.2rem] -scale-x-100 cursor-pointer text-gray-100"
          size={22}
          title="Hide Similar Files"
          onClick={() => setShowChatbot((show) => !show)}
        />
      </div>
    </div>
  )
}

export default TitleBar
