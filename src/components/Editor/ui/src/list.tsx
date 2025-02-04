import { ReactNode, forwardRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { View, XStack, YStack } from 'tamagui'

export type ListHandle = VirtuosoHandle

export const List = forwardRef(function ListComponent<Item>(
  {
    items,
    renderItem,
    header,
    footer,
    onEndReached,
    fixedItemHeight,
  }: {
    items: Item[]
    renderItem: (row: { item: Item; containerWidth: number }) => ReactNode
    header?: ReactNode | null
    footer?: ReactNode | null
    onEndReached?: () => void
    fixedItemHeight?: number
  },
  ref: React.Ref<VirtuosoHandle>,
) {
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  return (
    <YStack
      f={1}
      alignSelf="stretch"
      height={'100%'}
      onLayout={(e) => {
        setContainerHeight(e.nativeEvent.layout.height)
        setContainerWidth(e.nativeEvent.layout.width)
      }}
    >
      <Virtuoso
        ref={ref}
        fixedItemHeight={fixedItemHeight}
        endReached={() => {
          onEndReached?.()
        }}
        style={{
          height: containerHeight,
          display: 'flex',
          overflowY: 'scroll',
          overflowX: 'hidden',
        }}
        increaseViewportBy={{
          top: 800,
          bottom: 800,
        }}
        components={{
          Header: () => header || null,
          Footer: () => footer || <View style={{ height: 30 }} />,
        }}
        className="main-scroll-wrapper"
        totalCount={items?.length || 0}
        itemContent={(index) => {
          const item = items?.[index]
          if (!item) return null
          return (
            <XStack jc="center" width={containerWidth} height={fixedItemHeight || undefined}>
              {renderItem({ item, containerWidth })}
            </XStack>
          )
        }}
      />
    </YStack>
  )
})
