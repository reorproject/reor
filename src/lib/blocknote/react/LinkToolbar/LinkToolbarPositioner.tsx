import Tippy from '@tippyjs/react'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { BlockSchema, DefaultBlockSchema, BlockNoteEditor } from '@/lib/blocknote/core'

// import DefaultFormattingToolbar from '../FormattingToolbar/components/DefaultFormattingToolbar'
import LinkToolbarContent from './components/LinkToolbarContent'

export type LinkToolbarPositionerProps<BSchema extends BlockSchema = DefaultBlockSchema> = {
  editor: BlockNoteEditor<BSchema>
}

// We want Tippy to call `getReferenceClientRect` whenever the reference
// DOMRect's position changes. This happens automatically on scroll, but we need
// the `sticky` plugin to make it happen in all cases. This is most evident
// when changing the text alignment using the formatting toolbar.
// const tippyPlugins = [sticky]

export const LinkToolbarPositioner = <BSchema extends BlockSchema = DefaultBlockSchema>(props: {
  editor: BlockNoteEditor<BSchema>
  linkToolbarPositioner?: FC<LinkToolbarPositionerProps<BSchema>>
}) => {
  const [show, setShow] = useState<boolean>(false)
  const referencePos = useRef<DOMRect>()

  useEffect(() => {
    return props.editor.similarFilesToolbar.onUpdate((state) => {
      setShow(state.show)

      referencePos.current = state.referencePos
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

      if (boundingRect.bottom + boundingRect.y > window.innerHeight) {
        newRect.top = window.innerHeight / 2.15
      }

      return () => newRect as DOMRect
    },
    [referencePos.current], // eslint-disable-line
  )

  const linkToolbarElement = useMemo(() => {
    const LinkContentToolbar = props.linkToolbarPositioner || LinkToolbarContent
    return <LinkContentToolbar editor={props.editor} />
  }, [props.editor, props.linkToolbarPositioner])

  return (
    <Tippy
      appendTo={document.body}
      content={linkToolbarElement}
      getReferenceClientRect={getReferenceClientRect}
      interactive
      visible={show}
      animation="fade"
      placement="auto"
    />
  )
}
