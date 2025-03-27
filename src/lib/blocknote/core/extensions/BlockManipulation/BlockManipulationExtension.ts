import { Extension } from '@tiptap/core'
import { ResolvedPos } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'
import { Node } from 'prosemirror-model'
import { NodeSelection, Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { findNextBlock, findPreviousBlock } from '../../../../utils/block-utils'
import { BlockInfo, getBlockInfoFromPos } from '../Blocks/helpers/getBlockInfoFromPos'

const selectableNodeTypes = ['image', 'file', 'embed', 'video', 'web-embed', 'math', 'button', 'query']

const BlockManipulationExtension = Extension.create({
  name: 'BlockManupulation',

  addKeyboardShortcuts() {
    return {
      // 'Shift-Enter': () => {
      //   const {view, state} = this.editor
      //   const {selection} = state
      //   if (selection instanceof NodeSelection) {
      //     const prevBlockInfo = findPreviousBlock(view, selection.from)
      //     if (prevBlockInfo) {
      //       const $pos = state.doc.resolve(prevBlockInfo.prevBlockPos)
      //       this.editor
      //         .chain()
      //         .BNCreateBlock($pos.end() + 1)
      //         .setTextSelection($pos.end() + 3)
      //         .run()
      //       return true
      //     }
      //   }
      //   return false
      // },
      Enter: () => {
        const { state } = this.editor
        const { selection } = state
        if (selection instanceof NodeSelection) {
          const $pos = state.doc.resolve(selection.from + 1)
          this.editor
            .chain()
            .BNCreateBlock($pos.end() + 2)
            .setTextSelection($pos.end() + 3)
            .run()
          return true
        }
        return false
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('CursorSelectPlugin'),
        props: {
          handleClickOn: (view: EditorView, _, node: Node, nodePos: number, event: MouseEvent) => {
            if (!view.editable) return false
            if (
              (node.type.name === 'image' &&
                // @ts-ignore
                event.target?.nodeName === 'IMG') ||
              ['file', 'embed', 'video', 'web-embed', 'math', 'button', 'query'].includes(node.type.name)
            ) {
              let tr = view.state.tr
              const selection = NodeSelection.create(view.state.doc, nodePos)
              tr = tr.setSelection(selection)
              view.dispatch(tr)
              view.focus()
              return true
            }
            return false
          },
        },
      }),
      new Plugin({
        key: new PluginKey('KeyboardShortcutsSelectPlugin'),
        props: {
          handleKeyDown(view, event) {
            const { state } = view
            let blockInfo: BlockInfo | undefined
            if (event.key === 'Delete') {
              const { doc, selection, tr } = state
              if (selection.empty) {
                const $pos = selection.$anchor
                const isEnd = $pos.pos === $pos.end()
                if (isEnd) {
                  const node = getBlockInfoFromPos(doc, $pos.pos)
                  if (node.contentNode.textContent.length === 0) {
                    tr.deleteRange($pos.start() - 1, $pos.end() + 1)
                    view.dispatch(tr)
                    return true
                  }
                  let $nextPos: ResolvedPos | undefined
                  let nextNode
                  if (node.numChildBlocks > 0) {
                    $nextPos = doc.resolve($pos.after() + 3)
                    nextNode = $nextPos.parent
                  } else {
                    doc.descendants((testNode, testPos) => {
                      if (testNode.type.name === 'blockContainer' && testPos > $pos.pos)
                        if (!$nextPos || $nextPos.pos < $pos.pos) {
                          $nextPos = doc.firstChild!.resolve(testPos)
                          nextNode = testNode.firstChild
                        }
                    })
                  }
                  if ($nextPos && nextNode) {
                    if (selectableNodeTypes.includes(nextNode.type.name)) {
                      return false
                    }
                    const mergedTextContent = node.contentNode.textContent + nextNode.textContent
                    const newNode = view.state.schema.node(
                      node.contentType.name,
                      node.contentNode.attrs,
                      view.state.schema.text(mergedTextContent, node.contentNode.lastChild?.marks),
                      node.contentNode.marks,
                    )
                    tr.deleteRange(
                      $nextPos.start() - 1,
                      $nextPos.end() < $nextPos.start() + nextNode.nodeSize
                        ? $nextPos.end() + 1
                        : $nextPos.start() + nextNode.nodeSize + 1,
                    )
                    tr.replaceWith($pos.start() - 1, $pos.end() + 1, newNode)
                    view.dispatch(tr)
                    return true
                  }
                  return false
                }
              }
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
              let hasHardBreak = false
              blockInfo = getBlockInfoFromPos(state.doc, state.selection.from)!
              // Find if the selected node has break line and check if the selection's from position is before or after the hard break
              blockInfo.contentNode.content.descendants((node, pos) => {
                if (node.type.name === 'hardBreak') {
                  if (blockInfo && blockInfo.startPos + pos + 1 < state.selection.from) {
                    hasHardBreak = true
                  }
                }
              })
              // Stop execution and let other handlers be called if the selection if after the hard break
              if (hasHardBreak) return false
              const prevBlockInfo = findPreviousBlock(view, state.selection.from)
              if (prevBlockInfo) {
                const { prevBlock, prevBlockPos } = prevBlockInfo
                const prevNode = prevBlock.firstChild!
                const prevNodePos = prevBlockPos + 1
                if (event.shiftKey) {
                  const blockInfoAtSelectionStart = getBlockInfoFromPos(state.doc, state.selection.from)
                  if (event.key === 'ArrowLeft') {
                    if (
                      (state.selection.from - 1 !== blockInfoAtSelectionStart.startPos &&
                        !selectableNodeTypes.includes(blockInfoAtSelectionStart.contentType.name)) ||
                      !selectableNodeTypes.includes(prevBlock.firstChild!.type.name)
                    )
                      return false
                  }

                  const selection = TextSelection.create(state.doc, state.selection.to, prevNodePos)
                  let tr = state.tr.setSelection(selection)
                  tr = tr.scrollIntoView()
                  view.dispatch(tr)
                  return true
                }
                if (event.key === 'ArrowLeft') {
                  blockInfo = getBlockInfoFromPos(state.doc, state.selection.from)!
                  if (
                    state.selection.$anchor.parentOffset !== 0 &&
                    !selectableNodeTypes.includes(blockInfo.contentType.name)
                  ) {
                    return false
                  }
                }
                if (selectableNodeTypes.includes(prevNode.type.name)) {
                  const selection = NodeSelection.create(state.doc, prevNodePos)
                  let tr = state.tr.setSelection(selection)
                  tr = tr.scrollIntoView()
                  view.dispatch(tr)
                  return true
                }
              } else {
                if (event.shiftKey) return false
                blockInfo = getBlockInfoFromPos(state.doc, state.selection.from)!
                if (selectableNodeTypes.includes(blockInfo.contentType.name)) {
                  const newBlock = state.schema.nodes.blockContainer.createAndFill()!
                  let tr = state.tr.insert(1, newBlock)
                  view.dispatch(tr)

                  tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, 1))
                  tr = tr.scrollIntoView()
                  view.dispatch(tr)
                  return true
                }
              }
              return false
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
              let lastHardBreakPos: number | null = null
              blockInfo = getBlockInfoFromPos(state.doc, state.selection.from)!
              // Find the position of last hard break in node content, if any
              blockInfo.contentNode.content.descendants((node, pos) => {
                if (blockInfo && node.type.name === 'hardBreak') {
                  lastHardBreakPos = blockInfo.startPos + pos + 1
                }
              })
              // Stop execution and let other handlers be called if selection's to position is before the last hard break pos
              if (lastHardBreakPos && state.selection.to <= lastHardBreakPos) return false
              const nextBlockInfo = findNextBlock(view, state.selection.from)
              if (nextBlockInfo) {
                blockInfo = getBlockInfoFromPos(state.doc, state.selection.from)!
                if (event.shiftKey) {
                  const blockInfoAfterSelection = findNextBlock(view, state.selection.to)
                  if (event.key === 'ArrowRight') {
                    const lastBlockInSelection = getBlockInfoFromPos(state.doc, state.selection.to)
                    if (
                      state.selection.to + 1 !==
                        lastBlockInSelection.startPos + lastBlockInSelection.contentNode.nodeSize &&
                      !selectableNodeTypes.includes(lastBlockInSelection.contentType.name)
                    ) {
                      return false
                    }
                  }
                  if (blockInfoAfterSelection) {
                    const { nextBlock, nextBlockPos } = blockInfoAfterSelection
                    if (selectableNodeTypes.includes(nextBlock.firstChild!.type.name)) {
                      const selection = TextSelection.create(state.doc, state.selection.anchor, nextBlockPos + 2)
                      let tr = state.tr.setSelection(selection)
                      tr = tr.scrollIntoView()
                      view.dispatch(tr)
                      return true
                    }
                    return false
                  }
                  return false
                }
                const { nextBlock, nextBlockPos } = nextBlockInfo
                const nextNode = nextBlock.firstChild!
                const nextNodePos = nextBlockPos + 1
                if (event.key === 'ArrowRight') {
                  if (
                    state.selection.$anchor.pos + 1 !== blockInfo.startPos + blockInfo.contentNode.nodeSize &&
                    !selectableNodeTypes.includes(blockInfo.contentType.name)
                  ) {
                    return false
                  }
                }
                if (selectableNodeTypes.includes(nextNode.type.name)) {
                  const selection = NodeSelection.create(state.doc, nextNodePos)
                  let tr = state.tr.setSelection(selection)
                  tr = tr.scrollIntoView()
                  view.dispatch(tr)
                  return true
                }
              }
            }
            return false
          },
        },
      }),
    ]
  },
})

export default BlockManipulationExtension
