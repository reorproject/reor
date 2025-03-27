import React, { useState } from 'react'
import { Button, YStack } from 'tamagui'
import { Block, BlockNoteEditor } from '@lib/blocknote'
import type { HMBlockSchema } from '../schema'
import { InlineContent } from '@/lib/blocknote/react'
import { MediaType } from './media-render'

interface ContainerProps {
  editor: BlockNoteEditor<HMBlockSchema>
  block: Block<HMBlockSchema>
  mediaType: string
  styleProps?: Object
  selected: boolean
  assign: any
  children: any
  onHoverIn?: () => void
  onHoverOut?: (e: any) => void
  width?: number | string
  className?: string
  // onPress?: (e: Event) => void
}

const MediaContainer = ({
  editor,
  block,
  mediaType,
  styleProps,
  selected,
  assign,
  children,
  onHoverIn,
  onHoverOut,
  width = '100%',
  className,
  // onPress,
}: ContainerProps) => {
  const [hover, setHover] = useState(false)

  const mediaProps = {
    ...styleProps,
    onHoverIn: () => {
      if (onHoverIn) onHoverIn()
      setHover(true)
    },
    onHoverOut: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (onHoverOut) onHoverOut(e)
      setHover(false)
    },
    outlineWidth: 0,
  }

  return (
    <YStack
      gap="$2"
      group="item"
      maxWidth="100%"
      width={width}
      alignSelf="center"
      borderWidth={0}
      // @ts-expect-error
      draggable="true"
      onDragStart={(e: any) => {
        e.stopPropagation()
        editor.sideMenu.blockDragStart(e)
      }}
      onDragEnd={(e: any) => {
        e.stopPropagation()
        editor.sideMenu.blockDragEnd()
      }}
    >
      <YStack
        borderColor={selected ? '$color8' : '$colorTransparent'}
        borderWidth={3}
        borderRadius="$2"
        {...mediaProps}
        // @ts-ignore
        contentEditable={false}
        className={className ?? block.type}
        group="item"
        maxWidth="100%"
      >
        {(hover || selected) && mediaType !== 'embed'
          ? editor.isEditable && (
              <Button
                position="absolute"
                top="$1.5"
                right="$1.5"
                zIndex="$4"
                size="$1"
                width={60}
                onPress={() =>
                  assign({
                    props: {
                      url: '',
                      name: '',
                      size: '0',
                      width: mediaType === 'image' ? editor.domElement.firstElementChild!.clientWidth : undefined,
                    },
                    children: [],
                    content: [],
                    type: mediaType,
                  } as MediaType)
                }
                hoverStyle={{
                  backgroundColor: '$backgroundHover',
                }}
              >
                replace
              </Button>
            )
          : null}
        {children}
      </YStack>
      {mediaType === 'image' && <InlineContent className="image-caption" />}
    </YStack>
  )
}

export default MediaContainer
