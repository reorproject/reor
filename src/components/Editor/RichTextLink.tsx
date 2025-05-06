import { InputRule, markInputRule, markPasteRule, PasteRule, mergeAttributes } from '@tiptap/core'
import { isAllowedUri, Link } from '@tiptap/extension-link'
import { Plugin } from '@tiptap/pm/state'
import type { LinkOptions } from '@tiptap/extension-link'
import { BlockNoteEditor } from '@/lib/blocknote/core/BlockNoteEditor'
import autolink from '@/lib/tiptap-extension-link/helpers/autolink'
import clickHandler from '@/lib/tiptap-extension-link/helpers/clickHandler'
import { useFileSearchIndex } from '@/lib/utils/cache/fileSearchIndex'
import { isHypermediaScheme } from '@/lib/utils'

const inputRegex = /(?:^|\s)\[([^\]]*)?\]\((\S+)(?: ["“](.+)["”])?\)$/i
const pasteRegex = /(?:^|\s)\[([^\]]*)?\]\((\S+)(?: ["“](.+)["”])?\)/gi
const fileRegex = /\[\[(.*?)\]\]/


function isInternalLink(href?: string) {
  return href?.startsWith('reor://')
}

function isValidURI(url: string): boolean {
  return isAllowedUri(url) as boolean || isHypermediaScheme(url)
}

function generateRandom32DigitString(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 10)).join('')
}

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

function linkFileInputRule(config: Parameters<typeof markInputRule>[0], bnEditor: BlockNoteEditor) {
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

const createLinkExtension = (bnEditor: BlockNoteEditor, linkExtensionOpts: Partial<LinkOptions> = {}) => {
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
        }, bnEditor),
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
