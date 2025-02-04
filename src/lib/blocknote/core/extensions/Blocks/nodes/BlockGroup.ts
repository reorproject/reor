import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import { mergeCSSClasses } from '../../../shared/utils'
import { BlockNoteDOMAttributes } from '../api/blockTypes'
import styles from './Block.module.css'

export const BlockGroup = Node.create<{
  domAttributes?: BlockNoteDOMAttributes
}>({
  name: 'blockGroup',
  group: 'blockGroup',
  content: 'blockContainer+',

  addAttributes() {
    return {
      listLevel: {
        default: '1',
        parseHTML: (element) => element.getAttribute('data-list-level'),
        renderHTML: (attributes) => {
          return {
            'data-list-level': attributes.listLevel,
          }
        },
      },
      listType: {
        default: 'div',
        parseHTML: (element) => element.getAttribute('data-list-type'),
        renderHTML: (attributes) => {
          return {
            'data-list-type': attributes.listType,
          }
        },
      },
      start: {
        default: undefined,
        renderHTML: (attributes) => {
          if (attributes.listType === 'ol' && attributes.start) {
            const offset = 0.65 * attributes.start.toString().length
            return {
              start: attributes.start,
              // style: `margin-left: calc(1em + ${offset}em);`,
            }
          }
        },
      },
    }
  },

  addInputRules() {
    return [
      // Creates an unordered list when starting with "-", "+", or "*".
      new InputRule({
        find: new RegExp(`^[-+*]\\s$`),
        handler: ({ state, chain, range }) => {
          chain()
            .UpdateGroup(state.selection.from, 'ul', false)
            // Removes the "-", "+", or "*" character used to set the list.
            .deleteRange({ from: range.from, to: range.to })
        },
      }),
      new InputRule({
        // ^\d+\.\s
        find: new RegExp(/^\d+\.\s/),
        handler: ({ state, chain, range }) => {
          chain()
            .UpdateGroup(state.selection.from, 'ol', false, this.editor.state.doc.textBetween(range.from, range.to - 1))
            // Removes the "1." characters used to set the list.
            .deleteRange({ from: range.from, to: range.to })
        },
      }),
    ]
  },
  parseHTML() {
    return [
      {
        tag: 'ul',
        // attrs: {listType: 'ul'},
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false
          }
          return { listType: 'ul' }
        },
        priority: 200,
      },
      {
        tag: 'ol',
        // attrs: {listType: 'ol'},
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false
          }
          return { listType: 'ol', start: element.getAttribute('start') }
        },
        priority: 200,
      },
      {
        tag: 'div',
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false
          }

          if (element.getAttribute('data-node-type') === 'blockGroup') {
            // Null means the element matches, but we don't want to add any attributes to the node.
            return null
          }

          return false
        },
        priority: 100,
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const blockGroupDOMAttributes = this.options.domAttributes?.blockGroup || {}

    return [
      node.attrs.listType,
      mergeAttributes(
        {
          ...blockGroupDOMAttributes,
          class: mergeCSSClasses(styles.blockGroup, blockGroupDOMAttributes.class),
          'data-node-type': 'blockGroup',
        },
        HTMLAttributes,
      ),
      0,
    ]
  },
})
