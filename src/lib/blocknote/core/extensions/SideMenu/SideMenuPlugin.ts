import { Node } from 'prosemirror-model'
import { NodeSelection, Plugin, PluginKey, Selection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BlockNoteEditor } from '../../BlockNoteEditor'
import styles from '../../editor.module.css'
import EventEmitter from '../../shared/EventEmitter'
import { BlockSchema } from '../Blocks/api/blockTypes'
import MultipleNodeSelection from '../DraggableBlocks/MultipleNodeSelection'
import { getDraggableBlockFromCoords, SideMenuState, SideMenuView } from './SideMenuView'

// const serializeForClipboard = (pv as any).__serializeForClipboard
// code based on https://github.com/ueberdosis/tiptap/issues/323#issuecomment-506637799

let dragImageElement: Element | undefined

function blockPositionFromCoords(coords: { left: number; top: number }, view: EditorView) {
  const block = getDraggableBlockFromCoords(coords, view)

  if (block && block.node.nodeType === 1) {
    // TODO: this uses undocumented PM APIs? do we need this / let's add docs?
    const docView = (view as any).docView
    const desc = docView.nearestDesc(block.node, true)
    if (!desc || desc === docView) {
      return null
    }
    return desc.posBefore
  }
  return null
}

function blockPositionsFromSelection(selection: Selection, doc: Node) {
  // Absolute positions just before the first block spanned by the selection, and just after the last block. Having the
  // selection start and end just before and just after the target blocks ensures no whitespace/line breaks are left
  // behind after dragging & dropping them.
  let beforeFirstBlockPos: number
  let afterLastBlockPos: number

  // Even the user starts dragging blocks but drops them in the same place, the selection will still be moved just
  // before & just after the blocks spanned by the selection, and therefore doesn't need to change if they try to drag
  // the same blocks again. If this happens, the anchor & head move out of the block content node they were originally
  // in. If the anchor should update but the head shouldn't and vice versa, it means the user selection is outside a
  // block content node, which should never happen.
  const selectionStartInBlockContent = doc.resolve(selection.from).node().type.spec.group === 'blockContent'
  const selectionEndInBlockContent = doc.resolve(selection.to).node().type.spec.group === 'blockContent'

  // Ensures that entire outermost nodes are selected if the selection spans multiple nesting levels.
  const minDepth = Math.min(selection.$anchor.depth, selection.$head.depth)

  if (selectionStartInBlockContent && selectionEndInBlockContent) {
    // Absolute positions at the start of the first block in the selection and at the end of the last block. User
    // selections will always start and end in block content nodes, but we want the start and end positions of their
    // parent block nodes, which is why minDepth - 1 is used.
    const startFirstBlockPos = selection.$from.start(minDepth - 1)
    const endLastBlockPos = selection.$to.end(minDepth - 1)

    // Shifting start and end positions by one moves them just outside the first and last selected blocks.
    beforeFirstBlockPos = doc.resolve(startFirstBlockPos - 1).pos
    afterLastBlockPos = doc.resolve(endLastBlockPos + 1).pos
  } else {
    beforeFirstBlockPos = selection.from
    afterLastBlockPos = selection.to
  }

  return { from: beforeFirstBlockPos, to: afterLastBlockPos }
}

function unsetDragImage() {
  if (dragImageElement !== undefined) {
    document.body.removeChild(dragImageElement)
    dragImageElement = undefined
  }
}

function setDragImage(view: EditorView, from: number, to = from) {
  if (from === to) {
    // Moves to position to be just after the first (and only) selected block.
    to += view.state.doc.resolve(from + 1).node().nodeSize
  }

  // Parent element is cloned to remove all unselected children without affecting the editor content.
  const parentClone = view.domAtPos(from).node.cloneNode(true) as Element
  const parent = view.domAtPos(from).node as Element

  const getElementIndex = (parentElement: Element, targetElement: Element) =>
    Array.prototype.indexOf.call(parentElement.children, targetElement)

  const firstSelectedBlockIndex = getElementIndex(
    parent,
    // Expects from position to be just before the first selected block.
    view.domAtPos(from + 1).node.parentElement!,
  )
  const lastSelectedBlockIndex = getElementIndex(
    parent,
    // Expects to position to be just after the last selected block.
    view.domAtPos(to - 1).node.parentElement!,
  )

  for (let i = parent.childElementCount - 1; i >= 0; i--) {
    if (i > lastSelectedBlockIndex || i < firstSelectedBlockIndex) {
      parentClone.removeChild(parentClone.children[i])
    }
  }

  // dataTransfer.setDragImage(element) only works if element is attached to the DOM.
  unsetDragImage()
  dragImageElement = parentClone

  // TODO: This is hacky, need a better way of assigning classes to the editor so that they can also be applied to the
  //  drag preview.
  const classes = view.dom.className.split(' ')
  const inheritedClasses = classes
    .filter(
      (className) => !className.includes('bn') && !className.includes('ProseMirror') && !className.includes('editor'),
    )
    .join(' ')

  dragImageElement.className = `${dragImageElement.className} ${styles.dragPreview} ${inheritedClasses}`

  document.body.appendChild(dragImageElement)
}

function dragStart(e: { dataTransfer: DataTransfer | null; clientY: number }, view: EditorView) {
  if (!e.dataTransfer) {
    return
  }

  const editorBoundingBox = view.dom.getBoundingClientRect()

  const coords = {
    left: editorBoundingBox.left + editorBoundingBox.width / 2, // take middle of editor
    top: e.clientY,
  }

  const pos = blockPositionFromCoords(coords, view)
  if (pos != null) {
    const selection = view.state.selection
    const doc = view.state.doc

    const { from, to } = blockPositionsFromSelection(selection, doc)

    const draggedBlockInSelection = from <= pos && pos < to
    const multipleBlocksSelected =
      selection.$anchor.node() !== selection.$head.node() || selection instanceof MultipleNodeSelection

    if (draggedBlockInSelection && multipleBlocksSelected) {
      view.dispatch(view.state.tr.setSelection(MultipleNodeSelection.create(doc, from, to)))
      setDragImage(view, from, to)
    } else {
      view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))
      setDragImage(view, pos)
    }

    const slice = view.state.selection.content()
    // const {dom, text} = serializeForClipboard(view, slice)
    const { dom, text } = view.serializeForClipboard(slice)

    e.dataTransfer.clearData()
    e.dataTransfer.setData('text/html', dom.innerHTML)
    e.dataTransfer.setData('text/plain', text)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(dragImageElement!, 0, 0)
    view.dragging = { slice, move: true }
  }
}

export const sideMenuPluginKey = new PluginKey('SideMenuPlugin')

export class SideMenuProsemirrorPlugin<BSchema extends BlockSchema> extends EventEmitter<any> {
  private sideMenuView: SideMenuView<BSchema> | undefined

  public readonly plugin: Plugin

  constructor(private readonly editor: BlockNoteEditor<BSchema>) {
    super()
    this.plugin = new Plugin({
      key: sideMenuPluginKey,
      view: (editorView) => {
        this.sideMenuView = new SideMenuView(editor, editorView, (sideMenuState) => {
          this.emit('update', sideMenuState)
        })
        return this.sideMenuView
      },
    })
  }

  public onUpdate(callback: (state: SideMenuState<BSchema>) => void) {
    return this.on('update', callback)
  }

  /**
   * If the block is empty, opens the slash menu. If the block has content,
   * creates a new block below and opens the slash menu in it.
   */
  addBlock = () => this.sideMenuView!.addBlock()

  /**
   * Handles drag & drop events for blocks.
   */
  blockDragStart = (event: { dataTransfer: DataTransfer | null; clientY: number }) => {
    this.sideMenuView!.isDragging = true
    dragStart(event, this.editor.prosemirrorView)
  }

  /**
   * Handles drag & drop events for blocks.
   */
  // eslint-disable-next-line
  blockDragEnd = () => unsetDragImage()

  /**
   * Freezes the side menu. When frozen, the side menu will stay
   * attached to the same block regardless of which block is hovered by the
   * mouse cursor.
   */
  freezeMenu = () => (this.sideMenuView!.menuFrozen = true)

  /**
   * Unfreezes the side menu. When frozen, the side menu will stay
   * attached to the same block regardless of which block is hovered by the
   * mouse cursor.
   */
  unfreezeMenu = () => (this.sideMenuView!.menuFrozen = false)
}
