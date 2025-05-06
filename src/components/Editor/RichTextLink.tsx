import { InputRule, markInputRule, markPasteRule, PasteRule, mergeAttributes } from '@tiptap/core'
import { isAllowedUri, Link } from '@tiptap/extension-link'
import { Plugin } from '@tiptap/pm/state'
import type { LinkOptions } from '@tiptap/extension-link'
import { BlockNoteEditor } from '@/lib/blocknote/core/BlockNoteEditor'
import autolink from '@/lib/tiptap-extension-link/helpers/autolink'
import clickHandler from '@/lib/tiptap-extension-link/helpers/clickHandler'
import { useFileSearchIndex } from '@/lib/utils/cache/fileSearchIndex'
import { isHypermediaScheme } from '@/lib/utils'

/**
 * Handles conventially markdown link syntax.
 * [title](url)
 */
const inputRegex = /(?:^|\s)\[([^\]]*)?\]\((\S+)(?: ["“](.+)["”])?\)$/i

/**
 * Handles markdown link syntax for pasting.
 * [title](url)
 */
const pasteRegex = /(?:^|\s)\[([^\]]*)?\]\((\S+)(?: ["“](.+)["”])?\)/gi

/**
 * Handles inline linking between files. For instance, triggers when a user types [[filename]].
 */
const fileRegex = /\[\[(.*?)\]\]/

/**
 * Returns true if this is an internal link that represents a file.
 * @param href the absolute path to the file
 * @returns true if this is an internal link
 */
function isInternalLink(href?: string) {
  return href?.startsWith('reor://')
}

/**
 * Retruns true if this is a valid URI or a hypermedia scheme. For instance, http, https, ftp, reor, etc..
 * @param url the url to check
 * @returns 
 */
function isValidURI(url: string): boolean {
  return isAllowedUri(url) as boolean || isHypermediaScheme(url)
}

/**
 * Generates a random 32 digit string. This is used to generate a random file name when the user types [[filename]]
 * towards a file that does not exist.
 * @returns a 32 digit string
 */
function generateRandom32DigitString(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 10)).join('')
}

/**
 * Handles convential markdown link syntax
 * @param config 
 * @returns a configured <a> tag
 */
function linkInputRule(config: Parameters<typeof markInputRule>[0]) {
  const baseRule = markInputRule(config)
  return new InputRule({
    find: config.find,
    handler(props) {
      baseRule.handler(props)
      props.state.tr.setMeta('preventAutolink', true)
    },
  })
}

/**
 * Handles convential markdown pasting syntax
 * @param config 
 */
function linkPasteRule(config: Parameters<typeof markPasteRule>[0]) {
  const baseRule = markPasteRule(config)
  return new PasteRule({
    find: config.find,
    handler(props) {
      baseRule.handler(props)
      props.state.tr.setMeta('preventAutolink', true)
    },
  })
}

/**
 * Deals with the [[filename]] syntax. This is used to link files in the editor.
 * It will create a link to the file if it exists, otherwise it will create a link to a new file.
 * @param config 
 */
function linkFileInputRule(config: Parameters<typeof markInputRule>[0]) {
  return new InputRule({
    find: fileRegex,
    handler(props) {
      const { tr } = props.state
      const { range, match } = props
      const { from, to } = range

      const markedText = match[1]?.trim() || generateRandom32DigitString()
      const fileName = `${markedText}.md`
      const cacheResult = useFileSearchIndex.getState().getPath(fileName)
      const filePath = cacheResult ? `reor://${cacheResult}` : `reor://${fileName}`

      const mark = config.type.create({ href: filePath, title: markedText })

      tr.deleteRange(from, to)
      tr.insertText(markedText, from)
      tr.addMark(from, from + markedText.length, mark)

      props.commands.focus()
    },
  })
}

const createLinkExtension = (linkExtensionOpts: Partial<LinkOptions> = {}) => {
  return Link.extend({
    inclusive: false,

    addOptions() {
      return {
        ...this.parent?.(),
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
        defaultProtocol: 'http',
        protocols: [],
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
          class: null,
        },
        onLinkClick: (href: string) => {},
        ...linkExtensionOpts,
      }
    },

    addAttributes() {
      return {
        ...this.parent?.(),
        title: { default: null },
      }
    },

    renderHTML({ HTMLAttributes }) {
      return isInternalLink(HTMLAttributes.href)
        ? [
            'span',
            {
              'data-path': HTMLAttributes.href,
              class: 'link internal-link',
            },
            0,
          ]
        : ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },

    parseHTML() {
      return [
        {
          tag: 'a[href]',
          getAttrs: dom => {
            const href = (dom as HTMLElement).getAttribute('href')
            if (!href || !isValidURI(href)) return false
            return null
          },
        },
      ]
    },

    addInputRules() {
      return [
        linkInputRule({
          find: inputRegex,
          type: this.type,
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
          getAttributes(match) {
            const title = match.pop()?.trim()
            const fileName = `${title}.md`
            const cacheResult = useFileSearchIndex.getState().getPath(fileName)
            return {
              title,
              href: cacheResult ? `reor://${cacheResult}` : `reor://${fileName}`,
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
            validate: isValidURI,
          }),
        )
      }

      if (this.options.openOnClick) {
        plugins.push(
          clickHandler({
            openFile: (this.options as any).openFile,
            type: this.type,
          }),
        )
      }

      return plugins
    },
  }).configure(linkExtensionOpts)
}

export { createLinkExtension }
