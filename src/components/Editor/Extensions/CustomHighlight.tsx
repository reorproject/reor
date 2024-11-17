// ... existing imports ...
import { Extension } from '@tiptap/core'

// Add this custom extension configuration before the EditorManager component
const CustomHighlight = Extension.create({
  name: 'customHighlight',
  addGlobalAttributes() {
    return [
      {
        types: ['highlight'],
        attributes: {
          class: {
            default: 'selection-highlight',
            parseHTML: () => 'selection-highlight',
            renderHTML: () => ({
              class: 'selection-highlight',
            }),
          },
        },
      },
    ]
  },
})

export default CustomHighlight
