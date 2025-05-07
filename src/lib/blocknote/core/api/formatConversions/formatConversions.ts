import { DOMParser, DOMSerializer, Schema } from 'prosemirror-model'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype, { defaultHandlers } from 'remark-rehype'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { Styles } from '@/lib/blocknote'
import { Block, BlockSchema } from '../../extensions/Blocks/api/blockTypes'

import { blockToNode, nodeToBlock } from '../nodeConversions/nodeConversions'
import simplifyBlocks from './simplifyBlocksRehypePlugin'
import { removeSingleSpace, preserveEmptyParagraphs, code, handleMedia } from './customRehypePlugins'

/**
 * Converts our blocks to HTML:
 *
 *  ImageBlock -> <img src=".." alt=".." />
 *
 * @param blocks Blocks created and stored by our editor
 * @param schema  The schema of the editor
 * @returns Returns the blocks in HTML format
 */
export async function blocksToHTML<BSchema extends BlockSchema>(
  blocks: Block<BSchema>[],
  schema: Schema,
): Promise<string> {
  const htmlParentElement = document.createElement('div')
  const serializer = DOMSerializer.fromSchema(schema)

  for (const block of blocks) {
    const node = blockToNode(block, schema)
    const htmlNode = serializer.serializeNode(node)
    htmlParentElement.appendChild(htmlNode)
  }

  const htmlString = await unified()
    // @ts-expect-error
    .use(rehypeParse, { fragment: true })
    .use(simplifyBlocks, {
      orderedListItemBlockTypes: new Set<string>(['numberedListItem']),
      unorderedListItemBlockTypes: new Set<string>(['bulletListItem']),
    })
    // @ts-expect-error
    .use(rehypeStringify)
    .process(htmlParentElement.innerHTML)
  return htmlString.value as string
}

/**
 * Converts an HTML element to our custom block
 *
 * <img src=".." alt=".." /> -> ImageBlock
 *
 * @param html The HTML string that we want to convert to our custom blocks
 * @param blockSchema The schema of the block
 * @param schema Schema of the tiptap editor
 * @returns
 */
export async function HTMLToBlocks<BSchema extends BlockSchema>(
  html: string,
  blockSchema: BSchema,
  schema: Schema,
): Promise<Block<BSchema>[]> {
  const htmlNode = document.createElement('div')
  htmlNode.innerHTML = html.trim()

  const parser = DOMParser.fromSchema(schema)
  const parentNode = parser.parse(htmlNode) // , { preserveWhitespace: "full" });
  const blocks: Block<BSchema>[] = []

  for (let i = 0; i < parentNode.firstChild!.childCount; i++) {
    blocks.push(nodeToBlock(parentNode.firstChild!.child(i), blockSchema))
  }

  return blocks
}

/**
 *
 * **Hello** -> <b>Hello</b>
 *
 * @param text The text to apply the style to
 * @param styles The styles to apply to the text
 * @returns
 */
const applyStyles = (text: string, styles: Styles) => {
  if (styles.bold) text = `<b>${text}</b>`
  if (styles.italic) text = `<i>${text}</i>`
  if (styles.strike) text = `<del>${text}</del>`
  if (styles.underline) text = `<u>${text}</u>`
  if (styles.code) text = `<code>${text}</code>`
  return text
}

/**
 * Converts link to HTML with css properties.
 *
 * @param contentItem The content item to convert to HTML
 * @returns
 */
const convertContentItemToHtml = (contentItem: any) => {
  let text = contentItem.text || ''
  const { styles = {} } = contentItem

  text = applyStyles(text, styles)

  if (contentItem.type === 'link') {
    const linkText = applyStyles(contentItem.content[0].text, contentItem.content[0].styles || {})
    const docPath = contentItem.href
    return `<a href="${docPath}">${linkText}</a>`
  }
  return text
}

/**
 * Converts a block to HTML
 *
 * @param block The block to convert to HTML
 * @param isListItem True if this is a list item (needs a <li> tag)
 * @returns
 */
function convertBlockToHtml<BSchema extends BlockSchema>(block: Block<BSchema>, isListItem = false) {
  let childrenHtml = ''
  if (block.children) {
    const childrenContent = block.children
      .map((child) => convertBlockToHtml(child, block.props.childrenType === 'ul' || block.props.childrenType === 'ol'))
      .join('\n')
    if (block.props.childrenType === 'ul') {
      childrenHtml = `<ul>${childrenContent}</ul>`
    } else if (block.props.childrenType === 'ol') {
      childrenHtml = `<ol start="${block.props.start || 1}">${childrenContent}</ol>`
    } else {
      childrenHtml = childrenContent
    }
  }

  const contentHtml = block.content
    ? block.content.map((contentItem) => convertContentItemToHtml(contentItem)).join('')
    : ''

  const blockHtml = (() => {
    switch (block.type) {
      case 'heading':
        return `<h${block.props.level}>${contentHtml}</h${block.props.level}>`
      case 'paragraph':
        return `<p>${contentHtml}</p>`
      case 'image':
        return `[${block.props.alt}](${block.props.url} "width=${block.props.width}")`
      case 'code-block':
        return `<pre><code class="language-${block.props.language || 'plaintext'}">${contentHtml}</code></pre>`
      case 'video':
        return `![${block.props.name}](${block.props.url} "width=${block.props.width}")`
      default:
        return contentHtml
    }
  })()

  if (isListItem) {
    // Wrap the block content in <li> if it's a list item
    return `<li>${blockHtml}${childrenHtml}</li>`
  }
  // Return the block content and any children it may have
  return `${blockHtml}\n${childrenHtml}`
}

/**
 * Converts a series of blocks to HTML
 *
 * @param blocks The blocks to convert to HTML
 * @returns
 */
function convertBlocksToHtml<BSchema extends BlockSchema>(blocks: Block<BSchema>[]) {
  const htmlContent: string = blocks.map((block) => convertBlockToHtml(block, undefined)).join('\n\n')
  return htmlContent
}

/**
 * Converts a series of blocks into markdown
 *
 * @param blocks Blocks that we want to convert to markdown
 * @param schema the schema of our editor
 * @returns
 */
export async function blocksToMarkdown<BSchema extends BlockSchema>(blocks: Block<BSchema>[]): Promise<string> {
  const tmpMarkdownString = await unified()
    // @ts-expect-error
    .use(rehypeParse, { fragment: true })
    .use(preserveEmptyParagraphs)
    // @ts-expect-error
    .use(rehypeRemark)
    // @ts-expect-error
    .use(remarkGfm)
    // @ts-expect-error
    .use(remarkStringify)
    .process(convertBlocksToHtml(blocks))

  return tmpMarkdownString.value as string
}

/**
 * Converts markdown to blocks
 *
 * @param markdown markdown we stored
 * @param blockSchema the schema of our editor
 * @param schema tiptap's schema
 * @returns
 */
export async function markdownToBlocks<BSchema extends BlockSchema>(
  markdown: string,
  blockSchema: BSchema,
  schema: Schema,
): Promise<Block<BSchema>[]> {
  const htmlString = await unified()
    // @ts-expect-error
    .use(remarkParse)
    .use(removeSingleSpace)
    // @ts-expect-error
    .use(remarkGfm)
    // @ts-expect-error
    .use(remarkRehype, {
      handlers: {
        ...(defaultHandlers as any),
        code,
        paragraph: handleMedia,
      },
    })
    // @ts-expect-error
    .use(rehypeStringify)
    .process(markdown)

  return HTMLToBlocks(htmlString.value as string, blockSchema, schema)
}
