import { InputRule, markInputRule, markPasteRule, PasteRule, mergeAttributes } from '@tiptap/core'
import { isAllowedUri, Link } from '@tiptap/extension-link'
import { Plugin } from '@tiptap/pm/state'
import type { LinkOptions } from '@tiptap/extension-link'
import { useEditorState, isHypermediaScheme } from '@/lib/utils'
import { getSimilarFiles } from '@/lib/semanticService'
import { BlockNoteEditor } from '@/lib/blocknote/core/BlockNoteEditor'
import clickHandler from '@/lib/tiptap-extension-link/helpers/clickHandler'
import autolink from '@/lib/tiptap-extension-link/helpers/autolink'
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
 * Checks if the given URL is a valid URI. This is used to prevent auto-linking of invalid URLs.
 * @param url The URL to check
 */
function isValidURI(url: string) {
  return isAllowedUri(url) || isHypermediaScheme(url)
}

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
      const currentPath = useEditorState.getState().currentFilePath
      void(async () => {
        const searchResults = await getSimilarFiles(currentPath, 5)

      })()

      defaultMarkInputRule.handler(props)
      tr.setMeta('preventAutolink', true)
    },
  })
}

export function linkFileInputRule(config: Parameters<typeof markInputRule>[0], bnEditor: BlockNoteEditor) {
  return new InputRule({
    find: fileRegex,
    handler: (props) => {
      const { tr } = props.state
      const { range, match } = props
      const { from, to } = range
      const hardCodedFilePath = 'reor:///Users/mohamed/Documents/notes/Untitled.md'

      const mark = config.type.create({
        href: hardCodedFilePath,
        title: 'Untitled',
      })
      
      tr.deleteRange(from, to)
      tr.insertText('Untitled', from)
      tr.addMark(from, from + 'Untitled'.length, mark)

      // Block autolink if needed
      props.commands.focus()
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
const createLinkExtension = (bnEditor: BlockNoteEditor, linkExtensionsOpts: any) => {  
  const RichTextLink = Link.extend({
    inclusive: false,

    addOptions() {
      return {
        ...this.parent?.(),
        onLinkClick: (href: string) => {},
      }
    },
    
    addAttributes() {
      return {
        ...this.parent?.(),
        title: {
          default: null,
        },
      }
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'span',
        {
          href: '#',
          'data-path': HTMLAttributes.href,
          class: 'link'
        },
        0,
      ]
    },

    parseHTML() {
      // return [{ tag: 'a[href]:not([href *= "javascript:" i])' }]
      return [
        {
          tag: "a[href]",
          getAttrs: dom => {
            const href = (dom as HTMLElement).getAttribute("href")

            if (!href || !isValidURI(href)) {
              return false
            }
            return null
          }
        }
      ]
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
        }, bnEditor),
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

    addProseMirrorPlugins() {
      const plugins: Plugin[] = []
  
      if (this.options.autolink) {
        plugins.push(
          autolink({
            type: this.type,
            validate: (this.options as any).validate,
          }),
        )
      }
      
      if (this.options.openOnClick) {
        // Opens the file path
        plugins.push(
          clickHandler({
            openFile: (this.options as any).onLinkClick,
            type: this.type,
          })
        )
      }

      return plugins 
    }
  })

  return RichTextLink.configure(linkExtensionsOpts)
}

export { createLinkExtension }

export type { LinkOptions as RichTextLinkOptions }
