import { Button } from '@tamagui/button'
import { YGroup } from '@tamagui/group'
import { MoreHorizontal } from '@tamagui/lucide-icons'
import { Separator } from '@tamagui/separator'
import { XStack } from '@tamagui/stacks'
import { GestureReponderEvent } from '@tamagui/web'
import { FC } from 'react'
import { GestureResponderEvent } from 'react-native'
import { MenuItem } from './menu-item'
import { Popover } from './TamaguiPopover'
import { usePopoverState } from './use-popover-state'

export type MenuItemType = {
  key: string
  label: string
  subLabel?: string
  icon: FC
  onPress: () => void
  color?: string
}

export function OptionsDropdown({
  menuItems,
  hiddenUntilItemHover,
  button,
}: {
  menuItems: (MenuItemType | null)[]
  hiddenUntilItemHover?: boolean
  hover?: boolean
  button?: JSX.Element
}) {
  const popoverState = usePopoverState()
  return (
    <XStack
      opacity={!popoverState.open && hiddenUntilItemHover ? 0 : 1}
      $group-item-hover={{
        opacity: 1,
      }}
    >
      <Popover {...popoverState} placement="bottom-end">
        <Popover.Trigger asChild>
          {button || (
            <Button
              size="$1"
              circular
              data-trigger
              onPress={(e: GestureReponderEvent) => {
                // because we are nested in the outer button, we need to stop propagation or else onPress is triggered by parent button
                e.stopPropagation()
              }}
              icon={MoreHorizontal}
            />
          )}
        </Popover.Trigger>
        <Popover.Content
          padding={0}
          elevation="$2"
          animation={[
            'fast',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate={true}
        >
          <YGroup separator={<Separator />}>
            {menuItems.map(
              (item) =>
                item && (
                  <YGroup.Item key={item.key}>
                    <MenuItem
                      onPress={(e: GestureResponderEvent) => {
                        e.stopPropagation()
                        popoverState.onOpenChange(false)
                        item.onPress()
                      }}
                      subTitle={item.subLabel}
                      title={item.label}
                      icon={item.icon}
                      color={item.color}
                    />
                  </YGroup.Item>
                ),
            )}
          </YGroup>
        </Popover.Content>
      </Popover>
    </XStack>
  )
}
