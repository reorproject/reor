import Tippy from '@tippyjs/react'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'

import {
  BlockNoteEditor,
  BlockSchema,
  DefaultBlockSchema,
  SlashMenuProsemirrorPlugin,
  SuggestionsMenuState,
} from '@/lib/blocknote/core'

import { ReactSlashMenuItem } from '../ReactSlashMenuItem'
import DefaultSlashMenu from './DefaultSlashMenu'

export type SlashMenuProps<BSchema extends BlockSchema = DefaultBlockSchema> = Pick<
  SlashMenuProsemirrorPlugin<BSchema, any>,
  'itemCallback'
> &
  Pick<SuggestionsMenuState<ReactSlashMenuItem<BSchema>>, 'filteredItems' | 'keyboardHoveredItemIndex'>

export const SlashMenuPositioner = <BSchema extends BlockSchema = DefaultBlockSchema>(props: {
  editor: BlockNoteEditor<BSchema>
  slashMenu?: FC<SlashMenuProps<BSchema>>
}) => {
  const [show, setShow] = useState<boolean>(false)
  const [filteredItems, setFilteredItems] = useState<ReactSlashMenuItem<BSchema>[]>()
  const [keyboardHoveredItemIndex, setKeyboardHoveredItemIndex] = useState<number>()
  const scroller = useRef<HTMLElement | null>(null)

  const referencePos = useRef<DOMRect>()
  useEffect(() => {
    setTimeout(() => {
      scroller.current = document.getElementById('scroll-page-wrapper')
    }, 100)
  }, [])

  useEffect(() => {
    return props.editor.slashMenu.onUpdate((slashMenuState) => {
      setShow(slashMenuState.show)
      setFilteredItems(slashMenuState.filteredItems)
      setKeyboardHoveredItemIndex(slashMenuState.keyboardHoveredItemIndex)

      referencePos.current = slashMenuState.referencePos
    })
  }, [props.editor])

  const getReferenceClientRect = useMemo(
    () => {
      if (!referencePos.current) {
        return undefined
      }

      const boundingRect = referencePos.current!
      const newRect = {
        top: boundingRect.top,
        right: boundingRect.right,
        bottom: boundingRect.bottom,
        left: boundingRect.left,
        width: boundingRect.width,
        height: boundingRect.height,
      }
      if (boundingRect.bottom > window.innerHeight) {
        newRect.top = window.innerHeight / 2.15
      }

      return () => newRect as DOMRect
    },
    [referencePos.current], // eslint-disable-line
  )

  const slashMenuElement = useMemo(() => {
    if (!filteredItems || keyboardHoveredItemIndex === undefined) {
      return null
    }

    const SlashMenu = props.slashMenu || DefaultSlashMenu

    return (
      <SlashMenu
        filteredItems={filteredItems}
        itemCallback={(item) => props.editor.slashMenu.itemCallback(item)}
        keyboardHoveredItemIndex={keyboardHoveredItemIndex}
      />
    )
  }, [filteredItems, keyboardHoveredItemIndex, props.editor.slashMenu, props.slashMenu])

  return (
    <Tippy
      appendTo={scroller.current ?? document.body}
      content={slashMenuElement}
      getReferenceClientRect={getReferenceClientRect}
      interactive
      visible={show}
      animation="fade"
      placement="auto"
    />
  )
}
