import { PluginView } from '@tiptap/pm/state'
import { EditorView } from 'prosemirror-view'
import { BlockSchema, Block } from '../Blocks/api/blockTypes'
import { getBlockInfoFromPos } from '../Blocks/helpers/getBlockInfoFromPos'
import { slashMenuPluginKey } from '../SlashMenu/SlashMenuPlugin'
import { BaseUiElementState } from '../../shared/BaseUiElementTypes'
import { BlockNoteEditor } from '../../BlockNoteEditor'

export type SideMenuState<BSchema extends BlockSchema> = BaseUiElementState & {
  // The block that the side menu is attached to.
  block: Block<BSchema>
  lineHeight: string
}

export function getDraggableBlockFromCoords(coords: { left: number; top: number }, view: EditorView) {
  if (!view.dom.isConnected) {
    // view is not connected to the DOM, this can cause posAtCoords to fail
    // (Cannot read properties of null (reading 'nearestDesc'), https://github.com/TypeCellOS/BlockNote/issues/123)
    return undefined
  }

  const pos = view.posAtCoords(coords)

  if (!pos) {
    return undefined
  }

  let node = view.nodeDOM(pos.inside) || (view.domAtPos(pos.pos).node as HTMLElement)
  // let atomNode = view.nodeDOM(pos.inside) as HTMLElement

  if (node === view.dom) {
    // mouse over root
    return undefined
  }

  while (node && node.parentNode && node.parentNode !== view.dom && !node.hasAttribute?.('data-id')) {
    node = node.parentNode as HTMLElement
  }
  if (!node) {
    return undefined
  }

  return { node, id: node.getAttribute('data-id')! }
}

export class SideMenuView<BSchema extends BlockSchema> implements PluginView {
  private sideMenuState?: SideMenuState<BSchema>

  // When true, the drag handle with be anchored at the same level as root elements
  // When false, the drag handle with be just to the left of the element
  // TODO: Is there any case where we want this to be false?
  private horizontalPosAnchoredAtRoot: boolean

  private horizontalPosAnchor: number

  private hoveredBlock: HTMLElement | undefined

  // Used to check if currently dragged content comes from this editor instance.
  public isDragging = false

  public menuFrozen = false

  constructor(
    private readonly editor: BlockNoteEditor<BSchema>,
    private readonly pmView: EditorView,
    private readonly updateSideMenu: (sideMenuState: SideMenuState<BSchema>) => void,
  ) {
    this.horizontalPosAnchoredAtRoot = true
    this.horizontalPosAnchor = (this.pmView.dom.firstChild! as HTMLElement).getBoundingClientRect().x

    document.body.addEventListener('drop', this.onDrop, true)
    document.body.addEventListener('dragover', this.onDragOver)
    this.pmView.dom.addEventListener('dragstart', this.onDragStart)

    // Shows or updates menu position whenever the cursor moves, if the menu isn't frozen.
    document.body.addEventListener('mousemove', this.onMouseMove, true)

    // Makes menu scroll with the page.
    document.addEventListener('scroll', this.onScroll)

    // Hides and unfreezes the menu whenever the user presses a key.
    document.body.addEventListener('keydown', this.onKeyDown, true)
  }

  /**
   * Sets isDragging when dragging text.
   */
  onDragStart = () => {
    this.isDragging = true
  }

  /**
   * If the event is outside the editor contents,
   * we dispatch a fake event, so that we can still drop the content
   * when dragging / dropping to the side of the editor
   */
  onDrop = (event: DragEvent) => {
    this.editor._tiptapEditor.commands.blur()

    if (
      (event as any).synthetic ||
      (!this.isDragging && (!event.dataTransfer?.types || event.dataTransfer?.types[0] !== 'Files'))
    ) {
      return
    }

    const pos = this.pmView.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    })

    this.isDragging = false

    if (!pos || pos.inside === -1) {
      const evt = new Event('drop', event) as any
      const editorBoundingBox = (this.pmView.dom.firstChild! as HTMLElement).getBoundingClientRect()
      evt.clientX = editorBoundingBox.left + editorBoundingBox.width / 2
      evt.clientY = event.clientY
      evt.dataTransfer = event.dataTransfer
      evt.preventDefault = () => event.preventDefault()
      evt.synthetic = true // prevent recursion
      // console.log("dispatch fake drop");
      this.pmView.dom.dispatchEvent(evt)
    }
  }

  /**
   * If the event is outside the editor contents,
   * we dispatch a fake event, so that we can still drop the content
   * when dragging / dropping to the side of the editor
   */
  onDragOver = (event: DragEvent) => {
    if (
      (event as any).synthetic ||
      (!this.isDragging && (!event.dataTransfer?.types || event.dataTransfer?.types[0] !== 'Files'))
    ) {
      return
    }
    const pos = this.pmView.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    })

    if (!pos || pos.inside === -1) {
      const evt = new Event('dragover', event) as any
      const editorBoundingBox = (this.pmView.dom.firstChild! as HTMLElement).getBoundingClientRect()
      evt.clientX = editorBoundingBox.left + editorBoundingBox.width / 2
      evt.clientY = event.clientY
      evt.dataTransfer = event.dataTransfer
      evt.preventDefault = () => event.preventDefault()
      evt.synthetic = true // prevent recursion
      // console.log("dispatch fake dragover");
      this.pmView.dom.dispatchEvent(evt)
    }
  }

  onKeyDown = () => {
    if (this.sideMenuState?.show) {
      this.sideMenuState.show = false
      this.updateSideMenu(this.sideMenuState)
    }
    this.menuFrozen = false
  }

  onMouseMove = (event: MouseEvent) => {
    if (this.menuFrozen) {
      return
    }

    // Editor itself may have padding or other styling which affects
    // size/position, so we get the boundingRect of the first child (i.e. the
    // blockGroup that wraps all blocks in the editor) for more accurate side
    // menu placement.
    const editorBoundingBox = (this.pmView.dom.firstChild! as HTMLElement).getBoundingClientRect()
    // We want the full area of the editor to check if the cursor is hovering
    // above it though.
    const editorOuterBoundingBox = this.pmView.dom.getBoundingClientRect()
    const cursorWithinEditor =
      event.clientX >= editorOuterBoundingBox.left &&
      event.clientX <= editorOuterBoundingBox.right &&
      event.clientY >= editorOuterBoundingBox.top &&
      event.clientY <= editorOuterBoundingBox.bottom

    const editorWrapper = this.pmView.dom.parentElement!

    // Doesn't update if the mouse hovers an element that's over the editor but
    // isn't a part of it or the side menu.
    if (
      // Cursor is within the editor area
      cursorWithinEditor &&
      // An element is hovered
      event &&
      event.target &&
      // Element is outside the editor
      !(editorWrapper === event.target || editorWrapper?.contains(event.target as HTMLElement))
    ) {
      if (this.sideMenuState?.show) {
        this.sideMenuState.show = false
        this.updateSideMenu(this.sideMenuState)
      }

      return
    }

    this.horizontalPosAnchor = editorBoundingBox.x

    // Gets block at mouse cursor's vertical position.
    const coords = {
      left: editorBoundingBox.left + editorBoundingBox.width / 2, // take middle of editor
      top: event.clientY,
    }
    const block = getDraggableBlockFromCoords(coords, this.pmView)

    // Closes the menu if the mouse cursor is beyond the editor vertically.
    if (!block || !this.editor.isEditable) {
      if (this.sideMenuState?.show) {
        this.sideMenuState.show = false
        this.updateSideMenu(this.sideMenuState)
      }

      return
    }

    // Doesn't update if the menu is already open and the mouse cursor is still hovering the same block.
    if (
      this.sideMenuState?.show &&
      this.hoveredBlock?.hasAttribute('data-id') &&
      this.hoveredBlock?.getAttribute('data-id') === block.id
    ) {
      return
    }

    if (
      !block.node?.hasAttribute('data-node-type') &&
      !block.node?.getAttribute('data-node-type') === 'blockContainer'
    ) {
      return
    }

    this.hoveredBlock = block.node
    // Gets the block's content node, which lets to ignore child blocks when determining the block menu's position.
    const blockContent = block.node.firstChild as HTMLElement

    if (!blockContent) {
      return
    }

    // Shows or updates elements.
    if (this.editor.isEditable) {
      const blockContentBoundingBox = blockContent.getBoundingClientRect()

      this.sideMenuState = {
        show: true,
        referencePos: new DOMRect(
          // this.horizontalPosAnchoredAtRoot
          //   ? this.horizontalPosAnchor
          //   : blockContentBoundingBox.x,
          blockContentBoundingBox.x,
          blockContentBoundingBox.y,
          blockContentBoundingBox.width,
          blockContentBoundingBox.height,
        ),
        block: this.editor.getBlock(this.hoveredBlock!.getAttribute('data-id')!)!,
        lineHeight: window.getComputedStyle(blockContent).lineHeight,
      }

      this.updateSideMenu(this.sideMenuState)
    }
  }

  onScroll = () => {
    if (this.sideMenuState?.show) {
      const blockContent = this.hoveredBlock!.firstChild as HTMLElement
      const blockContentBoundingBox = blockContent.getBoundingClientRect()

      this.sideMenuState.referencePos = new DOMRect(
        blockContentBoundingBox.x,
        blockContentBoundingBox.y,
        blockContentBoundingBox.width,
        blockContentBoundingBox.height,
      )
      this.updateSideMenu(this.sideMenuState)
    }
  }

  destroy() {
    if (this.sideMenuState?.show) {
      this.sideMenuState.show = false
      this.updateSideMenu(this.sideMenuState)
    }
    document.body.removeEventListener('mousemove', this.onMouseMove)
    document.body.removeEventListener('dragover', this.onDragOver)
    this.pmView.dom.removeEventListener('dragstart', this.onDragStart)
    document.body.removeEventListener('drop', this.onDrop, true)
    document.removeEventListener('scroll', this.onScroll)
    document.body.removeEventListener('keydown', this.onKeyDown, true)
  }

  addBlock() {
    if (this.sideMenuState?.show) {
      this.sideMenuState.show = false
      this.updateSideMenu(this.sideMenuState)
    }

    this.menuFrozen = true

    const blockContent = this.hoveredBlock!.firstChild! as HTMLElement
    const blockContentBoundingBox = blockContent.getBoundingClientRect()

    const pos = this.pmView.posAtCoords({
      left: blockContentBoundingBox.left + blockContentBoundingBox.width / 2,
      top: blockContentBoundingBox.top + blockContentBoundingBox.height / 2,
    })
    if (!pos) {
      return
    }

    const blockInfo = getBlockInfoFromPos(this.editor._tiptapEditor.state.doc, pos.pos)
    if (blockInfo === undefined) {
      return
    }

    const { contentNode, endPos } = blockInfo

    // Creates a new block if current one is not empty for the suggestion menu to open in.
    if (contentNode.textContent.length !== 0) {
      const newBlockInsertionPos = endPos + 1
      const newBlockContentPos = newBlockInsertionPos + 2

      this.editor._tiptapEditor
        .chain()
        .BNCreateBlock(newBlockInsertionPos)
        .BNUpdateBlock(newBlockContentPos, { type: 'paragraph', props: {} })
        .setTextSelection(newBlockContentPos)
        .run()
    } else {
      this.editor._tiptapEditor.commands.setTextSelection(endPos)
    }

    // Focuses and activates the suggestion menu.
    this.pmView.focus()
    this.pmView.dispatch(
      this.pmView.state.tr.scrollIntoView().setMeta(slashMenuPluginKey, {
        // TODO import suggestion plugin key
        activate: true,
        type: 'drag',
      }),
    )
  }
}
