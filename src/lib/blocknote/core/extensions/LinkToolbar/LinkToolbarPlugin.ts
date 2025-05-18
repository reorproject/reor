import { Plugin, PluginKey } from 'prosemirror-state'
import { BlockNoteEditor, BlockSchema } from '../..'
import { EditorToolbarState, EditorToolbarView } from '../EditorToolbar/EditorToolbar'
import EventEmitter from '../../shared/EventEmitter'
import LinkToolbarView from './LinkToolbarView'

export const linkToolbarPluginKey = new PluginKey('LinkToolbarPlugin')

class LinkToolbarProsemirrorPlugin<BSchema extends BlockSchema> extends EventEmitter<any> {
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

export default LinkToolbarProsemirrorPlugin
