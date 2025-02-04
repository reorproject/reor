import { Root } from 'remark-parse/lib'
import { Plugin } from 'unified'
import { Node } from 'unist'
import { visit } from 'unist-util-visit'

export const remarkCodeClass: Plugin<void[], Root> = () => {
  return (tree: Node) => {
    visit(tree, 'code', (node: any) => {
      if (node.lang) {
        node.data = {
          ...node.data,
          hProperties: {
            ...node.data?.hProperties,
            className: node.lang ? [`language-${node.lang}`] : [],
          },
        }
      }
    })
  }
}
