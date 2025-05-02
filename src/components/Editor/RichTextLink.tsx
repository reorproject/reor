import { InputRule, markInputRule, markPasteRule, PasteRule } from '@tiptap/core'
import { Link } from '@tiptap/extension-link'
import type { LinkOptions } from '@tiptap/extension-link'
import { useEditorState } from '@/lib/utils'
import { getSimilarFiles } from '@/lib/semanticService'


/**
 * The input regex for Markdown links with title support, and multiple quotation marks (required
 * in case the `Typography` extension is being included).
 */
const inputRegex = /(?:^|\s)\[([^\]]*)?\]\((\S+)(?: ["“](.+)["”])?\)$/i

/**
 * The regex for Markdown links. Executes when it finds '[[' irrespective of the content after or inside
 *  the brackets
 */
const suggestFileRegex = /\[\[$/

/**
 * Regex for finding enclosed brackets [[ .. ]]
 */
const fileRegex = /\[\[(.*?)\]\]/

/**
 * The paste regex for Markdown links with title support, and multiple quotation marks (required
 * in case the `Typography` extension is being included).
 */
const pasteRegex = /(?:^|\s)\[([^\]]*)?\]\((\S+)(?: ["“](.+)["”])?\)/gi

/**
 * Input rule built specifically for the `Link` extension, which ignores the auto-linked URL in
 * parentheses (e.g., `(https://doist.dev)`).
 *
 * @see https://github.com/ueberdosis/tiptap/discussions/1865
 */
function linkInputRule(config: Parameters<typeof markInputRule>[0]) {
  const defaultMarkInputRule = markInputRule(config)

  return new InputRule({
    find: config.find,
    handler(props) {
      const { tr } = props.state

      defaultMarkInputRule.handler(props)
      tr.setMeta('preventAutolink', true)
    },
  })
}

/**
 * Obsidian-style suggestion rule for links. When our editor detects a the start of a link (i.e. `[[`), it
 * will trigger a search for all similar files. 
 * 
 * TODO: It will then display a popup containing the results of the search. Selecting one will automatically
 * build a link to that file.
 */
function linkSuggestFilesInputRule(config: Parameters<typeof markInputRule>[0]) {
  const defaultMarkInputRule = markInputRule(config)

  return new InputRule({
    find: config.find,
    handler(props) {
      const { tr } = props.state
      console.log(`Inside handler!`)
      const currentPath = useEditorState.getState().currentFilePath
      void(async () => {
        const searchResults = await getSimilarFiles(currentPath, 5)
        console.log(`Search results are: `, searchResults)

      })()

      defaultMarkInputRule.handler(props)
      tr.setMeta('preventAutolink', true)
    },
  })
}

/**
 * Obsidian-style linking to file rule
 */
// function linkFileInputRule(config: Parameters<typeof markInputRule>[0]) {
//   const defaultMarkInputRule = markInputRule(config)

//   return new InputRule({
//     find: config.find,
//     handler(props) {
//       const { tr } = props.state

//       const matchedText = props.match[1]?.trim()
//       console.log(`Filename is: ${matchedText}`)
//       void(async () => {
//         const absolutePath = await window.fileSystem.getAbsolutePath(matchedText)
//         console.log(`Absolute path is: ${absolutePath}`)

//         props.chain()
//           .focus()
//           .setMark(config.type, {
//             href: absolutePath,
//             title: matchedText,
//           })
//           .run()
//       })()
//       // const currentPath = useEditorState.getState().currentFilePath
//       // void(async () => {
//       //   const searchResults = await getSimilarFiles(currentPath, 5)
//       //   console.log(`Search results are: `, searchResults)

//       // })()


//       defaultMarkInputRule.handler(props)
//       tr.setMeta('preventAutolink', true)
//     },
//   })
// }

export function linkFileInputRule(config: Parameters<typeof markInputRule>[0]) {
  return new InputRule({
    find: fileRegex,
    handler: (props) => {
      const { range, match } = props

      const matchedText = match[1]?.trim() // The text inside [[ ]]
      if (!matchedText) return
      const { from, to } = range

      // Resolve the file path (async)
      void (async () => {
        const absolutePath = await window.fileSystem.getAbsolutePath(matchedText)
        console.log('Absolute path:', absolutePath)

        props.chain()
          .focus()
          .deleteRange({ from, to })         // Delete [[path]]
          .insertContent(matchedText)        // Insert just Untitled
          .extendMarkRange(config.type.name) // Select the newly inserted text
          .setMark(config.type, {            // Set the link
            href: absolutePath,
            title: matchedText,
          })
          .run()
      })()

      // Block autolink if needed
      props.state.tr.setMeta('preventAutolink', true)
    },
  })
}

/**
 * Paste rule built specifically for the `Link` extension, which ignores the auto-linked URL in
 * parentheses (e.g., `(https://doist.dev)`). This extension was inspired from the multiple
 * implementations found in a Tiptap discussion at GitHub.
 *
 * @see https://github.com/ueberdosis/tiptap/discussions/1865
 */
function linkPasteRule(config: Parameters<typeof markPasteRule>[0]) {
  const defaultMarkPasteRule = markPasteRule(config)

  return new PasteRule({
    find: config.find,
    handler(props) {
      const { tr } = props.state

      defaultMarkPasteRule.handler(props)
      tr.setMeta('preventAutolink', true)
    },
  })
}

/**
 * Custom extension that extends the built-in `Link` extension to add additional input/paste rules
 * for converting the Markdown link syntax (i.e. `[Doist](https://doist.com)`) into links, and also
 * adds support for the `title` attribute.
 */
const RichTextLink = Link.extend({
  inclusive: false,
  addAttributes() {
    return {
      ...this.parent?.(),
      title: {
        default: null,
      },
    }
  },
  addInputRules() {
    return [
      linkInputRule({
        find: inputRegex,
        type: this.type,

        // We need to use `pop()` to remove the last capture groups from the match to
        // satisfy Tiptap's `markPasteRule` expectation of having the content as the last
        // capture group in the match (this makes the attribute order important)
        getAttributes(match) {
          return {
            title: match.pop()?.trim(),
            href: match.pop()?.trim(),
          }
        },
      }),
      // linkSuggestFilesInputRule({
      //   find: suggestFileRegex,
      //   type: this.type,

      //   // We need to use `pop()` to remove the last capture groups from the match to
      //   // satisfy Tiptap's `markPasteRule` expectation of having the content as the last
      //   // capture group in the match (this makes the attribute order important)
      //   getAttributes(match) {
      //     return {
      //       title: match.pop()?.trim(),
      //       href: match.pop()?.trim(),
      //     }
      //   },
      // }),
      linkFileInputRule({
        find: fileRegex,
        type: this.type,

        // We need to use `pop()` to remove the last capture groups from the match to
        // satisfy Tiptap's `markPasteRule` expectation of having the content as the last
        // capture group in the match (this makes the attribute order important)
        getAttributes(match) {
          return {
            title: match.pop()?.trim(),
            href: match.pop()?.trim(),
          }
        },
      }),
    ]
  },
  addPasteRules() {
    return [
      linkPasteRule({
        find: pasteRegex,
        type: this.type,

        // We need to use `pop()` to remove the last capture groups from the match to
        // satisfy Tiptap's `markInputRule` expectation of having the content as the last
        // capture group in the match (this makes the attribute order important)
        getAttributes(match) {
          return {
            title: match.pop()?.trim(),
            href: match.pop()?.trim(),
          }
        },
      }),
    ]
  },
})

export { RichTextLink }

export type { LinkOptions as RichTextLinkOptions }
