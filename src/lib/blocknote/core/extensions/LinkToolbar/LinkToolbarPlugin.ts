import { EditorToolbarState, EditorToolbarView } from "../EditorToolbar/EditorToolbar";
import { Plugin, PluginKey } from "prosemirror-state";
import { BlockNoteEditor, BlockSchema } from "../..";
import { EditorView } from "prosemirror-view";
import { isNodeSelection } from "@tiptap/core";
import EventEmitter from "../../shared/EventEmitter";

export class LinkToolbarView<BSchema extends BlockSchema> extends EditorToolbarView<BSchema> {
  constructor(
    editor: BlockNoteEditor<BSchema>,
    pmView: EditorView,
    updateEditorToolbar: (state: EditorToolbarState) => void
  ) {
    super(editor, pmView, updateEditorToolbar, ({ view, state, from, to }) => {
      const { selection } = state

      if (!view.hasFocus() || !selection.empty || isNodeSelection(selection)) {
        return false
      }      

      const $from = state.doc.resolve(from)
      const start = $from.start()

      const maxSearchLength = 100;
      const searchStart = Math.max(0, from - maxSearchLength);
      const cleanedStart = searchStart < start ? start : searchStart
    
      const textBefore = state.doc.textBetween(cleanedStart, from, undefined, '\0');
      const lastBracketIndex = textBefore.lastIndexOf('[[');
      return lastBracketIndex !== -1
    })
  }
}

export const linkToolbarPluginKey = new PluginKey('LinkToolbarPlugin')

export class LinkToolbarProsemirrorPlugin<BSchema extends BlockSchema> extends EventEmitter<any> {
  private view: EditorToolbarView<BSchema> | undefined

  public readonly plugin: Plugin

  constructor(editor: BlockNoteEditor<BSchema>) {
    super()
    this.plugin = new Plugin({
      key: linkToolbarPluginKey,
      view: (editorView) => {
        this.view = new LinkToolbarView(editor, editorView, (state) => {
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