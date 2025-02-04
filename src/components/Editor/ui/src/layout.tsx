import { forwardRef } from 'react'
import { ScrollView, YStack, YStackProps } from 'tamagui'

export const MainWrapper = forwardRef(function MainWrapper(
  {
    children,
    noScroll = false,
    ...props
  }: YStackProps & {
    noScroll?: boolean
  },
  ref,
) {
  return (
    <YStack flex={1} className="content-wrapper" {...props} ref={ref}>
      {noScroll ? (
        children
      ) : (
        // TODO: we cannot remove this ID here because the SlashMenu is referencing this!
        <ScrollView id="scroll-page-wrapper">{children}</ScrollView>
      )}
    </YStack>
  )
})
