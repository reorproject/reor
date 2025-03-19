import { Block, BlockNoteEditor, BlockSchema } from '@lib/blocknote'
import { Box, Menu } from '@mantine/core'
import { XStack } from 'tamagui'
import { Forward, RefreshCcw } from '@tamagui/lucide-icons'
import * as _ from 'lodash'
import React, { useCallback, useRef, useState } from 'react'
import {
  RiChatQuoteLine,
  RiCodeBoxLine,
  RiHeading,
  RiListOrdered,
  RiListUnordered,
  RiMenuLine,
  RiText,
} from 'react-icons/ri'
import { updateGroup } from '@/lib/utils'
import RemoveBlockButton from './DefaultButtons/RemoveBlockButton'
import { DragHandleMenu, DragHandleMenuProps } from './DragHandleMenu'
import DragHandleMenuItem from './DragHandleMenuItem'
import { HMBlockSchema } from '@/components/Editor/schema'
import ThemedMenu, { ThemedMenuItem, ThemedLabel } from '@/components/ui/ThemedMenu'


const turnIntoItems = [
  {
    label: 'Paragraph',
    group: 'Block operations',
    Icon: RiText,
    onClick: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) => {
      editor.focus()
      editor.updateBlock(block, {
        type: 'paragraph',
        props: {},
      })
    },
  },
  {
    label: 'Heading',
    group: 'Block operations',
    Icon: RiHeading,
    onClick: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) => {
      editor.focus()
      editor.updateBlock(block, {
        type: 'heading',
        props: {},
      })
    },
  },
  {
    label: 'Code',
    group: 'Block operations',
    Icon: RiCodeBoxLine,
    onClick: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) => {
      editor.focus()
      editor.updateBlock(block, {
        type: 'code-block',
        props: {},
      })
    },
  },
  // {
  //   label: 'Block Quote',
  //   group: 'Group operations',
  //   Icon: RiChatQuoteFill,
  //   onClick: ({
  //     block,
  //     editor,
  //   }: {
  //     block: Block<HMBlockSchema>
  //     editor: BlockNoteEditor<HMBlockSchema>
  //   }) => {
  //     editor.focus()
  //     updateGroup(editor, block, 'Blockquote')
  //   },
  // },
  {
    label: 'Bullet item',
    group: 'Group operations',
    Icon: RiListUnordered,
    onClick: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) => {
      editor.focus()
      updateGroup(editor, block, 'ul')
    },
  },
  {
    label: 'Numbered item',
    group: 'Group operations',
    Icon: RiListOrdered,
    onClick: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) => {
      editor.focus()
      updateGroup(editor, block, 'ul')
    },
  },
  {
    label: 'Group item',
    group: 'Group operations',
    Icon: RiMenuLine,
    onClick: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) => {
      editor.focus()
      updateGroup(editor, block, 'group')
    },
  },

  {
    label: 'Blockquote item',
    group: 'Group operations',
    Icon: RiChatQuoteLine,
    onClick: ({ block, editor }: { block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema> }) => {
      editor.focus()
      updateGroup(editor, block, 'blockquote')
    },
  },
]

const TurnIntoMenu = <BSchema extends BlockSchema>(props: DragHandleMenuProps<BSchema>) => {
  const [opened, setOpened] = useState(false)

  const menuCloseTimer = useRef<NodeJS.Timeout | null>(null)

  const startMenuCloseTimer = useCallback(() => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current)
    }
    menuCloseTimer.current = setTimeout(() => {
      setOpened(false)
    }, 250)
  }, [])

  const stopMenuCloseTimer = useCallback(() => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current)
    }
    setOpened(true)
  }, [])

  const groups = _.groupBy(turnIntoItems, (i) => i.group)
  const renderedItems: any[] = []

  _.forEach(groups, (groupedItems) => {
    renderedItems.push(<ThemedLabel key={groupedItems[0].group}>{groupedItems[0].group}</ThemedLabel>)

    for (const item of groupedItems) {
      renderedItems.push(
        <ThemedMenuItem
          key={item.label}
          onClick={() => {
            item.onClick(props)
          }}
          component="div"
          icon={<item.Icon size={12} />}
        >
          {item.label}
        </ThemedMenuItem>,
      )
    }
  })

  if (!props.block.type) {
    return null
  }

  return (
    <DragHandleMenuItem onMouseOver={stopMenuCloseTimer} onMouseLeave={startMenuCloseTimer}>
      <ThemedMenu opened={opened} position="right">
        <Menu.Target>
          <XStack gap="$2">
            <RefreshCcw size={14} />
            <div style={{ flex: 1 }}>Turn into</div>
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Forward size={12} />
            </Box>
          </XStack>
        </Menu.Target>
        <Menu.Dropdown
          onMouseLeave={startMenuCloseTimer}
          onMouseOver={stopMenuCloseTimer}
          style={{ marginLeft: '5px' }}
        >
          {renderedItems}
        </Menu.Dropdown>
      </ThemedMenu>
    </DragHandleMenuItem>
  )
}

const DefaultDragHandleMenu = <BSchema extends BlockSchema>(props: DragHandleMenuProps<BSchema>) => (
  <DragHandleMenu>
    <RemoveBlockButton {...props}>Delete</RemoveBlockButton>
    <TurnIntoMenu {...props} />
  </DragHandleMenu>
)

export default DefaultDragHandleMenu
