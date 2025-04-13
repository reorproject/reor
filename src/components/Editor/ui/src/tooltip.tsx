import { Text } from '@tamagui/core'
import React from 'react'
import { ScrollView, Stack } from 'tamagui'
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
        backgroundColor="$gray4"
        enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        scale={1}
        x={0}
        y={0}
        px={0}
        opacity={1}
        paddingVertical="$1"
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
        <ScrollView maxHeight="300px" maxWidth="350px">
          <Stack px={4}>
            <Text fontSize="$1" fontFamily="$body" margin={0} lineHeight="$1" color="$gray11">
              {renderMarkdown ? (
                <MarkdownRenderer content={content as string} />
              ) : (
                <Text fontSize="$1" fontFamily="$body" margin={0} lineHeight="$1" color="$gray11" whiteSpace="pre-wrap">
                  {content}
                </Text>
              )}
            </Text>
          </Stack>
        </ScrollView>
      </TTooltip.Content>
    </TTooltip>
  ) : (
    children
  )
}

export default Tooltip
