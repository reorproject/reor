import { Node } from 'hast'
import { Data } from 'unist'
import { visit } from 'unist-util-visit'

export function remarkImageWidth() {
  return (tree: Node<Data>) => {
    visit(tree, 'image', (node: any) => {
      if (node.title && node.title.includes('|')) {
        const [titleText, widthPart] = node.title.split('|').map((part: string) => part.trim())
        const widthMatch = widthPart.match(/width=(\d+)/)
        if (widthMatch) {
          node.data = {
            hProperties: {
              width: widthMatch[1],
            },
          }
          node.title = titleText
        }
      }
    })
  }
}
