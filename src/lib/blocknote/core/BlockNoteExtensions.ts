import { Extensions, extensions } from '@tiptap/core'

// import {debugPlugin} from '@/editor/prosemirror-debugger'
import { Bold } from '@tiptap/extension-bold'
import { Code } from '@tiptap/extension-code'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { History } from '@tiptap/extension-history'
import { Italic } from '@tiptap/extension-italic'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { Underline } from '@tiptap/extension-underline'
// import {createInlineEmbedNode} from '../../mentions-plugin'
import { Link } from '../../tiptap-extension-link'
import BlockManipulationExtension from './extensions/BlockManipulation/BlockManipulationExtension'
import { BlockContainer, BlockGroup, Doc } from './extensions/Blocks'
import { BlockNoteDOMAttributes } from './extensions/Blocks/api/blockTypes'
import CustomBlockSerializerExtension from './extensions/Blocks/api/serialization'
import blockStyles from './extensions/Blocks/nodes/Block.module.css'
import createMarkdownExtension from './extensions/Markdown/MarkdownExtension'
import { Placeholder } from './extensions/Placeholder/PlaceholderExtension'
import { TrailingNode } from './extensions/TrailingNode/TrailingNodeExtension'
import UniqueID from './extensions/UniqueID/UniqueID'
import { HMBlockSchema } from '@/components/Editor/schema'
import SearchAndReplace from '@/components/Editor/Search/SearchAndReplaceExtension'
import TextAlignmentExtension from './extensions/TextAlignment/TextAlignmentExtension'
import { BlockNoteEditor } from './BlockNoteEditor'
import LocalMediaPastePlugin from './extensions/Pasting/local-media-paste-plugin'

/**
 * Get all the Tiptap extensions BlockNote is configured with by default
 */
const getBlockNoteExtensions = <BSchema extends HMBlockSchema>(opts: {
  editable?: boolean
  editor: BlockNoteEditor<BSchema>
  domAttributes: Partial<BlockNoteDOMAttributes>
  blockSchema: BSchema
  linkExtensionOptions: any
  inlineEmbedOptions: any
}) => {
  const ret: Extensions = [
    // createInlineEmbedNode(opts.editor),
    extensions.ClipboardTextSerializer,
    extensions.Commands,
    extensions.Editable,
    extensions.FocusEvents,
    extensions.Tabindex,

    // DevTools,
    Gapcursor,

    // DropCursor,
    Placeholder.configure({
      emptyNodeClass: blockStyles.isEmpty,
      hasAnchorClass: blockStyles.hasAnchor,
      isFilterClass: blockStyles.isFilter,
      includeChildren: true,
      showOnlyCurrent: false,
    }),
    UniqueID.configure({
      types: ['blockContainer'],
    }),
    // Comments,

    // basics:
    Text,

    // copy paste:
    // @ts-ignore
    createMarkdownExtension(opts.editor),

    // block manupulations:
    BlockManipulationExtension,

    // marks:
    Bold,
    Code,
    Italic,
    Strike,
    Underline,
    Link.configure(opts.linkExtensionOptions),
    // TextColorMark,
    // TextColorExtension,
    TextAlignmentExtension,
    LocalMediaPastePlugin,
    // nodes
    Doc,
    BlockGroup.configure({
      domAttributes: opts.domAttributes,
    }),
    ...Object.values(opts.blockSchema).map((blockSpec) => {
      return blockSpec.node.configure({
        editor: opts.editor,
        domAttributes: opts.domAttributes,
      })
    }),
    CustomBlockSerializerExtension,
    Dropcursor.configure({ width: 5, color: '#ddeeff' }),
    HardBreak,
    // This needs to be at the bottom of this list, because Key events (such as enter, when selecting a /command),
    // should be handled before Enter handlers in other components like splitListItem
    TrailingNode,
    BlockContainer.configure({
      domAttributes: opts.domAttributes,
    }),
    SearchAndReplace,
    // debugPlugin,
  ]

  ret.push(History)
  return ret
}

export default getBlockNoteExtensions
