import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { isNodeSelection, posToDOMRect } from '@tiptap/core'
import { BaseUiElementCallbacks, BaseUiElementState, BlockNoteEditor, BlockSchema } from '../..'

export type EditorToolbarCallbacks = BaseUiElementCallbacks
export type EditorToolbarState = BaseUiElementState

export class EditorToolbarView<BSchema extends BlockSchema> {
  private editorToolbarState?: EditorToolbarState

  public updateEditorToolbar: () => void

  public preventHide = false

  public preventShow = false

  public prevWasEditable: boolean | null = null

  public shouldShow: (props: { view: EditorView; state: EditorState; from: number; to: number }) => boolean

  constructor(
    private readonly editor: BlockNoteEditor<BSchema>,
    private readonly pmView: EditorView,
    updateEditorToolbar: (editorToolbarState: EditorToolbarState) => void,
    shouldShow: (props: { view: EditorView; state: EditorState; from: number; to: number }) => boolean,
  ) {
    this.updateEditorToolbar = () => {
      if (!this.editorToolbarState) {
        throw new Error('Attempting to update uninitialized editor toolbar')
      }

      updateEditorToolbar(this.editorToolbarState)
    }

    this.shouldShow = shouldShow

    pmView.dom.addEventListener('mousedown', this.viewMousedownHandler)
    pmView.dom.addEventListener('mouseup', this.viewMouseupHandler)
    pmView.dom.addEventListener('dragstart', this.updateEditorToolbar)

    pmView.dom.addEventListener('focus', this.focusHandler)
    pmView.dom.addEventListener('blur', this.blurHandler)

    document.addEventListener('scroll', this.scrollHandler)
  }

  viewMousedownHandler = () => {
    this.preventShow = true
  }

  viewMouseupHandler = () => {
    this.preventShow = false
    setTimeout(() => this.update(this.pmView))
  }

  dragStartHandler = () => {
    if (this.editorToolbarState?.show) {
      this.editorToolbarState.show = false
      this.updateEditorToolbar()
    }
  }

  focusHandler = () => {
    setTimeout(() => this.update(this.pmView))
  }

  blurHandler = (event: FocusEvent) => {
    if (this.preventHide) {
      this.preventHide = false
      return
    }

    const editorWrapper = this.pmView.dom.parentElement!

    // Check if we are moving the focus to an element outside the editor
    if (
      event &&
      event.relatedTarget &&
      (editorWrapper === (event.relatedTarget as Node) || editorWrapper?.contains(event.relatedTarget as Node))
    ) {
      return
    }

    if (this.editorToolbarState?.show) {
      this.editorToolbarState.show = false
      this.updateEditorToolbar()
    }
  }

  scrollHandler = () => {
    if (this.editorToolbarState?.show) {
      this.editorToolbarState.referencePos = this.getSelectionBoundingBox()
      this.updateEditorToolbar()
    }
  }

  update = (view: EditorView, oldState?: EditorState) => {
    const { state, composing } = view
    const { doc, selection } = state
    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)

    if ((this.prevWasEditable === null || this.prevWasEditable === this.editor.isEditable) && (composing || isSame)) {
      return
    }

    this.prevWasEditable = this.editor.isEditable

    // support for CellSelections
    const { ranges } = selection
    const from = Math.min(...ranges.map((range) => range.$from.pos))
    const to = Math.max(...ranges.map((range) => range.$to.pos))

    // Call child component of shouldShow
    const shouldShow = this.shouldShow?.({
      view,
      state,
      from,
      to,
    })

    // Checks if menu should be shown/updated.
    if (this.editor.isEditable && !this.preventShow && (shouldShow || this.preventHide)) {
      this.editorToolbarState = {
        show: true,
        referencePos: this.getSelectionBoundingBox(),
      }

      this.updateEditorToolbar()

      return
    }

    // Checks if menu should be hidden.
    if (
      this.editorToolbarState?.show &&
      !this.preventHide &&
      (!shouldShow || this.preventShow || !this.editor.isEditable)
    ) {
      this.editorToolbarState.show = false
      this.updateEditorToolbar()
    }
  }

  getSelectionBoundingBox = () => {
    const { state } = this.pmView
    const { selection } = state

    const { ranges } = selection
    const from = Math.min(...ranges.map((range) => range.$from.pos))
    const to = Math.max(...ranges.map((range) => range.$to.pos))

    if (isNodeSelection(selection)) {
      const node = this.pmView.nodeDOM(from) as HTMLElement

      if (node) {
        return node.getBoundingClientRect()
      }
    }

    return posToDOMRect(this.pmView, from, to)
  }
}

// export const editorToolbarPluginKey = new PluginKey('EditorToolbarPlugin')

// export class EditorToolbarProsemirrorPlugin<BSchema extends BlockSchema> extends EventEmitter<any> {
//   private view: EditorToolbarView<BSchema> | undefined

//   public readonly plugin: Plugin

//   constructor(editor: BlockNoteEditor<BSchema>) {
//     super()
//     this.plugin = new Plugin({
//       key: editorToolbarPluginKey,
//       view: (editorView) => {
//         this.view = new EditorToolbarView(editor, editorView, (state) => {
//           this.emit("update", state)
//         })
//         return this.view
//       }
//     })
//   }

//   public onUpdate(callback: (state: EditorToolbarState) => void) {
//     this.on("update", callback)
//   }
// }
