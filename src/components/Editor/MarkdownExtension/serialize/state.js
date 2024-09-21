import { MarkdownSerializerState as BaseMarkdownSerializerState } from 'prosemirror-markdown'
import { trimInline } from '../util/markdown'

export class MarkdownSerializerState extends BaseMarkdownSerializerState {
  inTable = false

  constructor(nodes, marks, options) {
    super(nodes, marks, options ?? {})
    this.inlines = []
    this.lastWasParagraph = false
  }

  render(node, parent, index) {
    if (node.type.name === 'paragraph' && node.content.size === 0) {
      this.out += '\n'
    } else {
      if (this.lastWasParagraph && node.type.name === 'paragraph') {
        this.out += '\n'
      }
      super.render(node, parent, index)
      const top = this.inlines[this.inlines.length - 1]
      if (top?.start && top?.end) {
        const { delimiter, start, end } = this.normalizeInline(top)
        this.out = trimInline(this.out, delimiter, start, end)
        this.inlines.pop()
      }
    }
    this.lastWasParagraph = node.type.name === 'paragraph'
  }

  renderContent(fragment) {
    fragment.forEach((node, _, i) => {
      this.render(node)
    })
  }

  markString(mark, open, parent, index) {
    const info = this.marks[mark.type.name]
    if (info.expelEnclosingWhitespace) {
      if (open) {
        this.inlines.push({
          start: this.out.length,
          delimiter: info.open,
        })
      } else {
        const top = this.inlines.pop()
        this.inlines.push({
          ...top,
          end: this.out.length,
        })
      }
    }
    return super.markString(mark, open, parent, index)
  }

  normalizeInline(inline) {
    let { start, end } = inline
    while (this.out.charAt(start).match(/\s/)) {
      start++
    }
    return {
      ...inline,
      start,
    }
  }

  // Override the closeBlock method to control newline insertion
  closeBlock(node) {
    if (this.lastWasParagraph && node.type.name === 'paragraph') {
      this.out += '\n'
    }
    this.lastWasParagraph = node.type.name === 'paragraph'
  }
}
