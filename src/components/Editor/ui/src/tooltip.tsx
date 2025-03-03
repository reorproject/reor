import { Text } from '@tamagui/core'
import React from 'react'
import { ScrollView } from 'tamagui'
import { Tooltip as TTooltip, TooltipProps } from './TamaguiTooltip'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'

const Tooltip = ({
  children,
  content,
  placement,
  delay = 100,
  open,
  renderMarkdown,
}: {
  children: React.ReactNode
  content: string | React.ReactElement
  placement?: TooltipProps['placement']
  delay?: number
  open?: boolean
  renderMarkdown?: boolean
}) => {
  return content ? (
    <TTooltip placement={placement} delay={delay} open={open}>
      <TTooltip.Trigger asChild>{children}</TTooltip.Trigger>
      <TTooltip.Content
        maxWidth="350px"
        backgroundColor="$gray4"
        enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        scale={1}
        x={0}
        y={0}
        opacity={1}
        paddingVertical="$1"
        paddingHorizontal="$2"
        animation={[
          'fast',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <TTooltip.Arrow />
        <ScrollView maxHeight="300px">
          <Text fontSize="$1" fontFamily="$body" margin={0} padding={0} lineHeight="$1">
            {renderMarkdown ? <MarkdownRenderer content={content as string} /> : content}
          </Text>
        </ScrollView>
      </TTooltip.Content>
    </TTooltip>
  ) : (
    children
  )
}

export default Tooltip
