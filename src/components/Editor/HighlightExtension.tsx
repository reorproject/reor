import { Plugin } from '@tiptap/pm/state'
import { Extension } from '@tiptap/react'

export interface HighlightData {
  text: string
  position: { top: number; left: number } | null
}

const HighlightExtension = (setHighlightData: (data: HighlightData) => void) =>
  Extension.create({
    name: 'highlight',
    addProseMirrorPlugins() {
      return [
        new Plugin({
          view(editorView) {
            return {
              update: (view) => {
                const { state } = view
                const { selection } = state
                const { from, to } = selection

                if (from !== to) {
                  const highlightedText = state.doc.textBetween(from, to)
                  const { top, left, right } = editorView.coordsAtPos(to)

                  // Calculate the button position below the last word
                  const buttonTop = top >= window.innerHeight ? 50 : top - 125 // Adjust the vertical offset as needed
                  const buttonLeft = (left + right) / 2 - 190 // Position the button horizontally centered
                  setHighlightData({
                    text: highlightedText,
                    position: { top: buttonTop, left: buttonLeft },
                  })
                } else {
                  setHighlightData({ text: '', position: null })
                }
              },
            }
          },
        }),
      ]
    },
  })

export default HighlightExtension
