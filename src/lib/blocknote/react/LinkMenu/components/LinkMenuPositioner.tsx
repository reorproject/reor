import Tippy from '@tippyjs/react'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import {
  BlockNoteEditor,
  BlockSchema,
  DefaultBlockSchema,
  LinkMenuProsemirrorPlugin,
  LinkMenuState,
  LinkMenuItem,
} from '@/lib/blocknote/core'

import DefaultLinkMenu from './DefaultLinkMenu'

export type LinkMenuProps<BSchema extends BlockSchema = DefaultBlockSchema> = Pick<
  LinkMenuProsemirrorPlugin<BSchema, any>,
  'itemCallback'
> &
  Pick<LinkMenuState<LinkMenuItem<BSchema>>, 'items' | 'keyboardHoveredItemIndex'>

export const LinkMenuPositioner = <BSchema extends BlockSchema = DefaultBlockSchema>(props: {
  editor: BlockNoteEditor<BSchema>
  linkMenu?: FC<LinkMenuProps<BSchema>>
}) => {
  const [placement, setPlacement] = useState('bottom-start')
  const [show, setShow] = useState<boolean>(false)
  const [ref, setRef] = useState<string>('')
  const [items, setItems] = useState<LinkMenuItem<BSchema>[]>([])
  const [keyboardHoveredItemIndex, setKeyboardHoveredItemIndex] = useState<number>()
  const scroller = useRef<HTMLElement | null>(null)

  const referencePos = useRef<DOMRect>()
  useEffect(() => {
    setTimeout(() => {
      scroller.current = document.getElementById('scroll-page-wrapper')
    }, 100)
  }, [])

  useEffect(() => {
    return props.editor.linkMenu.onUpdate((linkMenuState) => {
      setShow(linkMenuState.show)
      setRef(linkMenuState.ref)
      // @ts-ignore
      setItems(linkMenuState.items)
      setKeyboardHoveredItemIndex(linkMenuState.keyboardHoveredItemIndex)

      referencePos.current = linkMenuState.referencePos
    })
  }, [props.editor, props.editor.linkMenu])

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
      if (boundingRect.bottom > window.innerHeight || window.innerHeight / boundingRect.bottom < 1.2) {
        setPlacement('top-start')
        switch (items.length) {
          case 4:
            newRect.top = window.innerHeight / 1.25
            break
          case 2:
            newRect.top = window.innerHeight / 1.14
            break
          case 1:
          default:
            break
        }
      } else {
        setPlacement('bottom-start')
      }

      return () => newRect as DOMRect
    },
    [referencePos.current, items], // eslint-disable-line
  )

  const linkMenuElement = useMemo(
    () => {
      if (keyboardHoveredItemIndex === undefined) {
        return null
      }

      const LinkMenu = props.linkMenu || DefaultLinkMenu

      return (
        <LinkMenu
          items={items}
          itemCallback={(item) => props.editor.linkMenu.itemCallback(item, ref)}
          keyboardHoveredItemIndex={keyboardHoveredItemIndex}
        />
      )
    },
    [keyboardHoveredItemIndex, props.editor.linkMenu, props.linkMenu, ref, items], // eslint-disable-line
  )

  return (
    <Tippy
      appendTo={scroller.current ?? document.body}
      content={linkMenuElement}
      getReferenceClientRect={getReferenceClientRect}
      interactive
      visible={show}
      animation="fade"
      // @ts-ignore
      placement={placement}
    />
  )
}
