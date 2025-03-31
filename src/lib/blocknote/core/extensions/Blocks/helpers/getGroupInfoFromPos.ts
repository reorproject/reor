import { Node, ResolvedPos } from '@tiptap/pm/model'
import { EditorState } from 'prosemirror-state'

export type GroupInfo = {
  group: Node
  container?: Node
  depth: number
  level: number
  $pos: ResolvedPos
}

export function getGroupInfoFromPos(pos: number, state: EditorState): GroupInfo {
  const $pos = state.doc.resolve(pos)
  const maxDepth = $pos.depth
  // Set group to first node found at position
  let group = $pos.node(maxDepth)
  let container
  let depth = maxDepth

  // Find block group, block container and depth it is at
  while (depth >= 0 && group.type.name !== 'blockGroup') {
    if (group.type.name === 'blockContainer') {
      container = group
    }

    depth -= 1
    group = $pos.node(depth)
  }

  return {
    group,
    container,
    depth,
    level: Math.ceil((maxDepth - 1) / 2),
    $pos,
  }
}
