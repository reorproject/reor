import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearFormatting: {
      clearFormatting: () => ReturnType
    }
  }
}

const ClearFormattingExtension = Extension.create({
  name: 'clearFormatting',

  addCommands() {
    return {
      clearFormatting:
        () =>
        ({ tr, state, dispatch }) => {
          // Get the entire document range
          const from = 0
          const to = state.doc.content.size

          if (dispatch) {
            // Remove all marks in the entire document
            Object.values(state.schema.marks).forEach((mark) => {
              tr.removeMark(from, to, mark)
            })

            // Specifically remove the highlight mark if it exists
            if (state.schema.marks.highlight) {
              tr.removeMark(from, to, state.schema.marks.highlight)
            }
          }

          return true
        },
    }
  },
})

export default ClearFormattingExtension
