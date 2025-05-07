import { Plugin, PluginKey } from 'prosemirror-state'
import { BlockNoteEditor, BlockSchema } from '../..'
import { EditorToolbarState, EditorToolbarView } from '../EditorToolbar/EditorToolbar'

import FormattingToolbarView from './FormattingToolbarView'
import EventEmitter from '../../shared/EventEmitter'

export const formattingToolbarPluginKey = new PluginKey('FormattingToolbarPlugin')

class FormattingToolbarProsemirrorPlugin<BSchema extends BlockSchema> extends EventEmitter<any> {
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

export default FormattingToolbarProsemirrorPlugin
