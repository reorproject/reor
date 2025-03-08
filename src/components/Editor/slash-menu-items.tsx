import React from 'react'

import { RiCodeBoxFill, RiHeading, RiImage2Fill, RiText, RiVideoAddFill } from 'react-icons/ri'
import { BlockNoteEditor, BlockSpec, PartialBlock, PropSchema, insertOrUpdateBlock } from '@/lib/blocknote'
import { HMBlockSchema } from './schema'

const slashMenuItems = [
  {
    name: 'Heading',
    aliases: ['h', 'heading1', 'subheading'],
    group: 'Text blocks',
    icon: <RiHeading size={18} />,
    hint: 'Group content with a title',
    execute: (editor: BlockNoteEditor<Record<string, BlockSpec<string, PropSchema>>>) => {
      insertOrUpdateBlock(editor, {
        type: 'heading',
        props: { level: '2' },
      } as PartialBlock<HMBlockSchema>)
      const { state, view } = editor._tiptapEditor
      view.dispatch(state.tr.scrollIntoView())
    },
  },
  {
    name: 'Paragraph',
    aliases: ['p'],
    group: 'Text blocks',
    icon: <RiText size={18} />,
    hint: 'Used for the body of your document',
    execute: (editor: BlockNoteEditor<Record<string, BlockSpec<string, PropSchema>>>) => {
      insertOrUpdateBlock(editor, {
        type: 'paragraph',
      } as PartialBlock<HMBlockSchema>)
      const { state, view } = editor._tiptapEditor
      view.dispatch(state.tr.scrollIntoView())
    },
  },
  {
    name: 'Code Block',
    aliases: ['code', 'pre', 'code-block'],
    group: 'Text blocks',
    icon: <RiCodeBoxFill size={18} />,
    hint: 'Insert a Code Block',
    execute: (editor: BlockNoteEditor) => {
      insertOrUpdateBlock(editor, {
        type: 'code-block',
        props: {
          language: '',
        },
      } as PartialBlock<HMBlockSchema>)
      const { state, view } = editor._tiptapEditor
      view.dispatch(state.tr.scrollIntoView())
    },
  },
  {
    name: 'Image',
    aliases: ['image', 'img', 'picture'],
    group: 'Media blocks',
    icon: <RiImage2Fill size={18} />,
    hint: 'Insert an Image',
    execute: (editor: BlockNoteEditor<Record<string, BlockSpec<string, PropSchema>>>) => {
      insertOrUpdateBlock(
        editor,
        {
          type: 'image',
          props: {
            url: '',
            defaultOpen: 'true',
          },
        } as PartialBlock<HMBlockSchema>,
        true,
      )
      const { state, view } = editor._tiptapEditor
      view.dispatch(state.tr.scrollIntoView())
    },
  },
  {
    name: 'Video',
    aliases: ['video', 'vid', 'media'],
    group: 'Media blocks',
    icon: <RiVideoAddFill size={18} />,
    hint: 'Insert a Video',
    execute: (editor: BlockNoteEditor<Record<string, BlockSpec<string, PropSchema>>>) => {
      insertOrUpdateBlock(
        editor,
        {
          type: 'video',
          props: {
            url: '',
            defaultOpen: 'true',
          },
        } as PartialBlock<HMBlockSchema>,
        true,
      )
      const { state, view } = editor._tiptapEditor
      view.dispatch(state.tr.scrollIntoView())
    },
  },
]

export default slashMenuItems
