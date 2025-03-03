import { Extension } from '@tiptap/core'
import { getBlockInfoFromPos } from '../Blocks/helpers/getBlockInfoFromPos'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    diff: {
      setDiff: (diff: 'added' | 'deleted' | 'updated' | 'undefined') => ReturnType
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export const DiffExtension = Extension.create({
  name: 'diff',

  addGlobalAttributes() {
    return [
      {
        // Attribute is applied to block content instead of container so that child blocks don't inherit the text
        // alignment styling.
        types: ['paragraph'],
        attributes: {
          diff: {
            default: 'undefined',
            parseHTML: (element) => element.getAttribute('data-diff'),
            renderHTML: (attributes) =>
              attributes.diff !== 'undefined' && {
                'data-diff': attributes.diff,
              },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setDiff:
        (diff) =>
        ({ state }) => {
          const positionsBeforeSelectedContent = []

          const blockInfo = getBlockInfoFromPos(state.doc, state.selection.from)
          if (blockInfo === undefined) {
            return false
          }

          // Finds all blockContent nodes that the current selection is in.
          let pos = blockInfo.startPos
          while (pos < state.selection.to) {
            if (state.doc.resolve(pos).node().type.spec.group === 'blockContent') {
              positionsBeforeSelectedContent.push(pos - 1)

              pos += state.doc.resolve(pos).node().nodeSize - 1
            } else {
              pos += 1
            }
          }

          // Sets text alignment for all blockContent nodes that the current selection is in.
          for (const newPos of positionsBeforeSelectedContent) {
            state.tr.setNodeAttribute(newPos, 'diff', diff)
          }

          return true
        },
    }
  },
})
