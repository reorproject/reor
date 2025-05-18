import { isTextSelection, isNodeSelection } from '@tiptap/core'
import { EditorView } from 'prosemirror-view'
import { BlockNoteEditor, BlockSchema } from '../..'
import { EditorToolbarState, EditorToolbarView } from '../EditorToolbar/EditorToolbar'

class FormattingToolbarView<BSchema extends BlockSchema> extends EditorToolbarView<BSchema> {
  constructor(
    editor: BlockNoteEditor<BSchema>,
    pmView: EditorView,
    updateEditorToolbar: (state: EditorToolbarState) => void,
  ) {
    super(editor, pmView, updateEditorToolbar, ({ view, state, from, to }) => {
      const { doc, selection } = state
      const { empty } = selection

      const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)

      return !(!view.hasFocus() || empty || isEmptyTextBlock || isNodeSelection(state.selection))
    })
  }
}

export default FormattingToolbarView
