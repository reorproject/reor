import { ComponentProps, PropsWithChildren, ReactNode, useMemo, useState } from 'react'
import { Button, ButtonProps, ListItem, ListItemProps, SizableText, XStack, XStackProps, YStack } from 'tamagui'
import { Copy, ExternalLink } from './icons'
import { Tooltip } from './tooltip'

function useHover() {
  const [hover, setHover] = useState(false)

  return useMemo(
    () => ({
      hover,
      onHoverIn: () => setHover(true),
      onHoverOut: () => setHover(false),
    }),
    [hover],
  )
}

TableList.Header = TableHeader
TableList.Item = TableItem

export function TableList({ children, ...props }: { children: ReactNode } & ComponentProps<typeof YStack>) {
  return (
    <YStack
      userSelect="none"
      hoverStyle={{
        cursor: 'default',
      }}
      borderWidth={1}
      borderColor="$borderColor"
      f={1}
      // aria-label={}
      // aria-labelledby={ariaLabelledBy}
      br="$4"
      ov="hidden"
      // mx="$-4"
      $sm={{
        //@ts-ignore
        mx: 0,
      }}
      {...props}
    >
      {children}
    </YStack>
  )
}

function TableHeader({ children, ...props }: PropsWithChildren<XStackProps>) {
  return (
    <XStack
      alignItems="center"
      //@ts-ignore
      py="$2"
      px="$4"
      backgroundColor="$borderColor"
      gap="$3"
      {...props}
    >
      {children}
    </XStack>
  )
}

function TableItem({ children, ...props }: PropsWithChildren<ListItemProps>) {
  return (
    <ListItem {...props}>
      <XStack alignItems="flex-start" width="100%">
        {children}
      </XStack>
    </ListItem>
  )
}

export function InfoListHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <TableList.Header>
      <SizableText fontWeight="700">{title}</SizableText>
      <XStack flex={1} alignItems="center" justifyContent="flex-end">
        {right}
      </XStack>
    </TableList.Header>
  )
}

export function InfoListItem({
  label,
  value,
  onCopy,
  onOpen,
}: {
  label: string
  value?: string | string[]
  onCopy?: ButtonProps['onPress'] | undefined
  onOpen?: ButtonProps['onPress'] | undefined
}) {
  const values = Array.isArray(value) ? value : [value]
  const { hover, ...hoverProps } = useHover()
  return (
    <TableList.Item {...hoverProps}>
      <SizableText size="$1" flex={0} minWidth={140} width={140}>
        {label}:
      </SizableText>
      <YStack flex={1}>
        {values.map((value, index) => (
          <SizableText
            flex={1}
            key={index}
            fontFamily="$mono"
            size="$1"
            width="100%"
            overflow="hidden"
            textOverflow="ellipsis"
            userSelect="text"
          >
            {value}
          </SizableText>
        ))}
      </YStack>
      {!!value && onCopy ? (
        <Tooltip content={`Copy ${label}`}>
          <Button opacity={hover ? 1 : 0} size="$2" marginLeft="$2" icon={Copy} onPress={onCopy} />
        </Tooltip>
      ) : null}
      {!!value && onOpen ? (
        <Tooltip content={`Open ${label}`}>
          <Button opacity={hover ? 1 : 0} size="$2" marginLeft="$2" icon={ExternalLink} onPress={onOpen} />
        </Tooltip>
      ) : null}
    </TableList.Item>
  )
}
