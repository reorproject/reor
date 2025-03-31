import { Node, NodeType } from 'prosemirror-model'
import { EditorView } from '@tiptap/pm/view'
import { Editor } from '@tiptap/core'
import { Node as TipTapNode } from '@tiptap/pm/model'
import { Block, BlockSchema, BlockNoteEditor, BlockChildrenType } from '../blocknote'
import getNodeById from './node-utils'

export type BlockInfoWithoutPositions = {
  id: string
  node: Node
  contentNode: Node
  contentType: NodeType
  numChildBlocks: number
}

export type BlockInfo = BlockInfoWithoutPositions & {
  startPos: number
  endPos: number
  depth: number
}

/**
 * Helper function for `getBlockInfoFromPos`, returns information regarding
 * provided blockContainer node.
 * @param blockContainer The blockContainer node to retrieve info for.
 */
export function getBlockInfo(blockContainer: Node): BlockInfoWithoutPositions {
  const id = blockContainer.attrs.id
  const contentNode = blockContainer.firstChild!
  const contentType = contentNode.type
  const numChildBlocks = blockContainer.childCount === 2 ? blockContainer.lastChild!.childCount : 0

  return {
    id,
    node: blockContainer,
    contentNode,
    contentType,
    numChildBlocks,
  }
}

/**
 * Retrieves information regarding the nearest blockContainer node in a
 * ProseMirror doc, relative to a position.
 * @param doc The ProseMirror doc.
 * @param pos An integer position.
 * @returns A BlockInfo object for the nearest blockContainer node.
 */
export function getBlockInfoFromPos(doc: Node, pos: number): BlockInfo {
  // If the position is outside the outer block group, we need to move it to the
  // nearest block. This happens when the collaboration plugin is active, where
  // the selection is placed at the very end of the doc.
  const outerBlockGroupStartPos = 1
  const outerBlockGroupEndPos = doc.nodeSize - 2
  if (pos <= outerBlockGroupStartPos) {
    pos = outerBlockGroupStartPos + 1

    while (doc.resolve(pos).parent.type.name !== 'blockContainer' && pos < outerBlockGroupEndPos) {
      pos++
    }
  } else if (pos >= outerBlockGroupEndPos) {
    pos = outerBlockGroupEndPos - 1

    while (doc.resolve(pos).parent.type.name !== 'blockContainer' && pos > outerBlockGroupStartPos) {
      pos--
    }
  }

  // This gets triggered when a node selection on a block is active, i.e. when
  // you drag and drop a block.
  if (doc.resolve(pos).parent.type.name === 'blockGroup') {
    pos++
  }

  const $pos = doc.resolve(pos)

  const maxDepth = $pos.depth
  let node = $pos.node(maxDepth)
  let depth = maxDepth

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (depth < 0) {
      throw new Error(
        'Could not find blockContainer node. This can only happen if the underlying BlockNote schema has been edited.',
      )
    }

    if (node.type.name === 'blockContainer') {
      break
    }

    depth -= 1
    node = $pos.node(depth)
  }

  const { id, contentNode, contentType, numChildBlocks } = getBlockInfo(node)

  const startPos = $pos.start(depth)
  const endPos = $pos.end(depth)

  return {
    id,
    node,
    contentNode,
    contentType,
    numChildBlocks,
    startPos,
    endPos,
    depth,
  }
}

export function updateGroup<BSchema extends BlockSchema>(
  editor: BlockNoteEditor<BSchema>,
  block: any,
  listType: BlockChildrenType,
) {
  const { posBeforeNode } = getNodeById(block.id, editor._tiptapEditor.state.doc)

  const posData = getBlockInfoFromPos(editor._tiptapEditor.state.doc, posBeforeNode + 1)

  if (!posData) return

  const { startPos } = posData
  editor.focus()
  editor._tiptapEditor.commands.UpdateGroup(startPos, listType, false)
}

// Find the next block from provided position or from selection
export function findNextBlock(view: EditorView, pos?: number) {
  const { state } = view
  const currentPos = pos || state.selection.from
  const blockInfo = getBlockInfoFromPos(state.doc, currentPos)!
  let nextBlock: Node | undefined
  let nextBlockPos: number | undefined
  // Find first child
  if (blockInfo.node.lastChild?.type.name === 'blockGroup') {
    state.doc.nodesBetween(blockInfo.startPos, blockInfo.endPos, (node, nodePos) => {
      if (node.attrs.id === blockInfo.node.lastChild?.firstChild?.attrs.id) {
        nextBlock = node
        nextBlockPos = nodePos
      }
    })
  }
  const maybePos = pos ? state.doc.resolve(pos) : state.selection.$to
  const nextBlockInfo = getBlockInfoFromPos(state.doc, maybePos.end() + 3)
  // If there is first child, return it as a next block
  if (nextBlock && nextBlockPos) {
    if (!nextBlockInfo || nextBlockPos <= nextBlockInfo.startPos - 1)
      return {
        nextBlock,
        nextBlockPos,
      }
  }
  if (!nextBlockInfo || nextBlockInfo.startPos < currentPos) return undefined
  return {
    nextBlock: nextBlockInfo.node,
    nextBlockPos: nextBlockInfo.startPos - 1,
  }
}

// Find the previous block from provided position or from selection
export function findPreviousBlock(view: EditorView, pos?: number) {
  const { state } = view
  const currentPos = pos || state.selection.from
  const $currentPos = state.doc.resolve(currentPos)
  if ($currentPos.start() <= 3) return undefined
  const blockInfo = getBlockInfoFromPos(state.doc, currentPos)!
  const prevBlockInfo = getBlockInfoFromPos(state.doc, $currentPos.start() - 3)
  // If prev block has no children, return it
  if (prevBlockInfo.node.childCount === 1)
    return {
      prevBlock: prevBlockInfo.node,
      prevBlockPos: prevBlockInfo.startPos - 1,
    }
  let prevBlock: Node | undefined
  let prevBlockPos: number | undefined
  // Find last child of prev block and return it
  if (prevBlockInfo.node.lastChild?.type.name === 'blockGroup') {
    state.doc.nodesBetween(prevBlockInfo.startPos + 3, blockInfo.startPos - 2, (node, nodePos) => {
      if (node.type.name === 'blockContainer') {
        prevBlock = node
        prevBlockPos = nodePos
      }
    })
  }
  if (prevBlock && prevBlockPos) return { prevBlock, prevBlockPos }
  return undefined
}

export function setGroupTypes(tiptap: Editor, blocks: Array<Partial<Block<BlockSchema>>>) {
  blocks.forEach((block: Partial<Block<BlockSchema>>) => {
    tiptap.state.doc.descendants((node: TipTapNode, pos: number) => {
      if (node.attrs.id === block.id && block.props && block.props.childrenType) {
        node.descendants((child: TipTapNode, childPos: number) => {
          if (child.type.name === 'blockGroup') {
            setTimeout(() => {
              let tr = tiptap.state.tr
              tr = block.props?.start
                ? tr.setNodeMarkup(pos + childPos + 1, null, {
                    listType: block.props?.childrenType,
                    listLevel: block.props?.listLevel,
                    start: parseInt(block.props?.start, 10),
                  })
                : tr.setNodeMarkup(pos + childPos + 1, null, {
                    listType: block.props?.childrenType,
                    listLevel: block.props?.listLevel,
                  })
              tiptap.view.dispatch(tr)
            })
            return false
          }
          return true
        })
      }
    })
    if (block.children) {
      setGroupTypes(tiptap, block.children)
    }
  })
}
