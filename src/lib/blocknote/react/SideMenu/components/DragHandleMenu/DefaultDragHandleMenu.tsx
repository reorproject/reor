import { Block, BlockNoteEditor } from '@lib/blocknote'
import { updateGroup } from '@/lib/utils'
import { Box, Menu } from '@mantine/core'
import { Forward, RefreshCcw, XStack } from '@shm/ui'
import * as _ from 'lodash'
import { useCallback, useRef, useState } from 'react'
import {
  RiChatQuoteLine,
  RiCodeBoxLine,
  RiHeading,
  RiListOrdered,
  RiListUnordered,
  RiMenuLine,
  RiText,
} from 'react-icons/ri'
import { RemoveBlockButton } from './DefaultButtons/RemoveBlockButton'
import { DragHandleMenu, DragHandleMenuProps } from './DragHandleMenu'
import { DragHandleMenuItem } from './DragHandleMenuItem'
import { HMBlockSchema } from '@/components/Editor/schema'

export const DefaultDragHandleMenu = <BSchema extends HMBlockSchema>(props: DragHandleMenuProps<BSchema>) => (
  <DragHandleMenu>
    <RemoveBlockButton {...props}>Delete</RemoveBlockButton>
    <TurnIntoMenu {...props} />
  </DragHandleMenu>
)

function TurnIntoMenu(props: DragHandleMenuProps<HMBlockSchema>) {
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
  let index = 0

  _.forEach(groups, (groupedItems) => {
    renderedItems.push(<Menu.Label key={groupedItems[0].group}>{groupedItems[0].group}</Menu.Label>)

    for (const item of groupedItems) {
      renderedItems.push(
        <Menu.Item
          key={item.label}
          onClick={() => {
            item.onClick(props)
          }}
          component="div"
          icon={<item.Icon size={12} />}
        >
          {item.label}
        </Menu.Item>,
      )
      index++
    }
  })

  if (!props.block.type) {
    return null
  }

  return (
    <DragHandleMenuItem onMouseOver={stopMenuCloseTimer} onMouseLeave={startMenuCloseTimer}>
      <Menu opened={opened} position="right">
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
      </Menu>
    </DragHandleMenuItem>
  )
}

var turnIntoItems = [
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
