import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'

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
export const mdToHtml = async (markdown: string): Promise<string> => {
  const result = await unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).process(markdown)
  return String(result)
}
