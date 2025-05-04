import { EditorToolbarState, EditorToolbarView } from "../EditorToolbar/EditorToolbar";
import { Plugin, PluginKey } from "prosemirror-state";
import { BlockNoteEditor, BlockSchema } from "../..";
import { EditorView } from "prosemirror-view";
import { isTextSelection, isNodeSelection } from "@tiptap/core";
import EventEmitter from "../../shared/EventEmitter";

export class FormattingToolbarView<BSchema extends BlockSchema> extends EditorToolbarView<BSchema> {
  constructor(
    editor: BlockNoteEditor<BSchema>,
    pmView: EditorView,
    updateEditorToolbar: (state: EditorToolbarState) => void
  ) {
    super(editor, pmView, updateEditorToolbar, ({ view, state, from, to }) => {
      const { doc, selection } = state
      const { empty } = selection

      const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)

      return false
    })
  }
}

export const formattingToolbarPluginKey = new PluginKey('FormattingToolbarPlugin')

export class FormattingToolbarProsemirrorPlugin<BSchema extends BlockSchema> extends EventEmitter<any> {
  private view: EditorToolbarView<BSchema> | undefined

  public readonly plugin: Plugin

  constructor(editor: BlockNoteEditor<BSchema>) {
    super()
    this.plugin = new Plugin({
      key: formattingToolbarPluginKey,
      view: (editorView) => {
        this.view = new FormattingToolbarView(editor, editorView, (state) => {
          this.emit('update', state)
        })
        return this.view
      },
    })
  }

  public onUpdate(callback: (state: EditorToolbarState) => void) {
    return this.on('update', callback)
  }
}