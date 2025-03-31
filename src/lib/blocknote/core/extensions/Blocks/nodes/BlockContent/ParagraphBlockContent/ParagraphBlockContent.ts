import { mergeAttributes } from '@tiptap/core'
import { mergeCSSClasses } from '../../../../../shared/utils'
import { createTipTapBlock } from '../../../api/block'
import styles from '../../Block.module.css'

const ParagraphBlockContent = createTipTapBlock({
  name: 'paragraph',
  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'p',
        priority: 200,
        node: 'paragraph',
        getAttrs: (node) => {
          // Don't match if has image (for markdown parse)
          if (node.childNodes.length > 0 && node.childNodes[0].nodeName) {
            const hasImage = node.childNodes[0].nodeName === 'IMG'
            return hasImage ? false : null
          }
          return null
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const blockContentDOMAttributes = this.options.domAttributes?.blockContent || {}
    const inlineContentDOMAttributes = this.options.domAttributes?.inlineContent || {}

    return [
      'div',
      mergeAttributes(
        {
          ...blockContentDOMAttributes,
          class: mergeCSSClasses(styles.blockContent, blockContentDOMAttributes.class),
          'data-content-type': this.name,
        },
        HTMLAttributes,
      ),
      [
        'p',
        {
          ...inlineContentDOMAttributes,
          class: mergeCSSClasses(styles.inlineContent, inlineContentDOMAttributes.class),
        },
        0,
      ],
    ]
  },
})

export default ParagraphBlockContent
