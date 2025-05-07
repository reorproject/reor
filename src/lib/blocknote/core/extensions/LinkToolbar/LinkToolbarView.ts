import { EditorView } from 'prosemirror-view'
import { isNodeSelection } from '@tiptap/core'
import { BlockNoteEditor, BlockSchema } from '../..'
import { EditorToolbarState, EditorToolbarView } from '../EditorToolbar/EditorToolbar'

class LinkToolbarView<BSchema extends BlockSchema> extends EditorToolbarView<BSchema> {
  constructor(
    editor: BlockNoteEditor<BSchema>,
    pmView: EditorView,
    updateEditorToolbar: (state: EditorToolbarState) => void,
  ) {
    super(editor, pmView, updateEditorToolbar, ({ view, state, from }) => {
      const { selection } = state

      if (!view.hasFocus() || !selection.empty || isNodeSelection(selection)) {
        return false
      }

      const $from = state.doc.resolve(from)
      const start = $from.start()

      const maxSearchLength = 100
      const searchStart = Math.max(0, from - maxSearchLength)
      const cleanedStart = searchStart < start ? start : searchStart

      const textBefore = state.doc.textBetween(cleanedStart, from, undefined, '\0')
      const lastBracketIndex = textBefore.lastIndexOf('[[')
      return lastBracketIndex !== -1
    })
  }
}

export default LinkToolbarView
