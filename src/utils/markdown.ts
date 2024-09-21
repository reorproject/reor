import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'

import { u } from 'unist-builder'
import { visit } from 'unist-util-visit'

// Custom plugin to convert placeholders to empty paragraph nodes
function remarkNewlinesToEmptyParagraphs(EOL_MARKER: string) {
  return () => (tree) => {
    visit(tree, (node, index, parent) => {
      // Process only text nodes
      if (node.type === 'text') {
        const { value } = node
        if (value.includes(EOL_MARKER)) {
          const parts = value.split(EOL_MARKER)
          const newNodes = []

          parts.forEach((part, i) => {
            if (part) {
              newNodes.push(u('text', part))
            }
            if (i < parts.length - 1) {
              // Insert empty paragraph at the parent level
              newNodes.push(u('paragraph', []))
            }
          })

          // Replace the original text node with new nodes
          parent.children.splice(index, 1, ...newNodes)
          // Adjust traversal to skip over newly inserted nodes
          return [visit.SKIP, index + newNodes.length]
        }
      }
    })

    // After processing, remove any residual EOL_MARKER from text nodes
    visit(tree, 'text', (node) => {
      if (node.value.includes(EOL_MARKER)) {
        node.value = node.value.replace(new RegExp(EOL_MARKER, 'g'), '')
      }
    })
  }
}

export const mdToHtml = async (markdown: string): Promise<string> => {
  const EOL_MARKER = '__EOL__' // Use a marker without angle brackets
  // Replace '\n' with the unique marker
  const preprocessedMarkdown = markdown.replace(/\n/g, EOL_MARKER)

  const result = await unified()
    .use(remarkParse)
    .use(() => (tree) => {
      // Assign parent references for traversal
      visit(tree, (node, index, parent) => {
        if (parent) {
          node.parent = parent
        }
      })
    })
    .use(remarkNewlinesToEmptyParagraphs(EOL_MARKER))
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(preprocessedMarkdown)

  // Post-processing: Remove any residual markers from the output
  const html = String(result).replace(new RegExp(EOL_MARKER, 'g'), '')

  return html
}

export const htmlToMd = async (html: string): Promise<string> => {
  console.log('html in: ', html)
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeRemark, {
      handlers: {
        // Custom handler for <p> elements
        p: (state, node) => {
          if (!node.children || node.children.length === 0) {
            // Return a Markdown paragraph node with an empty text child
            return {
              type: 'paragraph',
              children: [{ type: 'text', value: '' }],
            }
          }
          // Use the default handler for non-empty <p> elements
          return {
            type: 'paragraph',
            children: state.all(node),
          }
        },
      },
    })
    .use(remarkStringify, {
      // Ensure that multiple blank lines are preserved
      // by preventing the collapsing of consecutive newlines
      join: [],
    })
    .process(html)

  console.log('result: ', String(result))
  return String(result)
}
// Markdown to HTML
