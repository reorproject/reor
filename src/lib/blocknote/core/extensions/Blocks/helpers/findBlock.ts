import { findParentNode } from '@tiptap/core'

const findBlock = findParentNode((node) => node.type.name === 'blockContainer')

export default findBlock
