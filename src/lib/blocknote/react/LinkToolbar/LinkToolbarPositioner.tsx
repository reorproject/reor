import Tippy from '@tippyjs/react'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { sticky } from 'tippy.js'
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
const tippyPlugins = [sticky]

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
      if (!referencePos) {
        return undefined
      }
      return () => referencePos.current!
    },
    [referencePos.current], // eslint-disable-line
  )

  const linkToolbarElement = useMemo(() => {
    const LinkContentToolbar = props.linkToolbarPositioner || LinkToolbarContent
    return <LinkContentToolbar editor={props.editor} />
  }, [props.editor, props.linkToolbarPositioner])

  console.log(`Show: ${show}`)
  return (
    <Tippy
      appendTo={props.editor.domElement.parentElement ?? document.body}
      content={linkToolbarElement}
      getReferenceClientRect={getReferenceClientRect}
      interactive
      visible={show}
      animation="fade"
      placement="top-start"
      sticky
      plugins={tippyPlugins}
    />
  )
}
