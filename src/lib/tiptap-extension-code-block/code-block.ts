import { Editor, mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import styles from '@/lib/blocknote/core/extensions/Blocks/nodes/Block.module.css'
import { BlockNoteDOMAttributes, getBlockInfoFromPos, mergeCSSClasses } from '../blocknote'
import { getGroupInfoFromPos } from '../blocknote/core/extensions/Blocks/helpers/getGroupInfoFromPos'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    'code-block': {
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType
    }
  }
}

export const backtickInputRegex = /^```([a-z]+)?[\s\n]$/
export const tildeInputRegex = /^~~~([a-z]+)?[\s\n]$/

export interface CodeBlockOptions {
  /**
   * Adds a prefix to language classes that are applied to code tags.
   * Defaults to `'language-'`.
   */
  languageClassPrefix: string
  /**
   * BlockNote's default DOM attributes
   */
  domAttributes?: BlockNoteDOMAttributes
}

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: 'code-block',

  addOptions() {
    return {
      languageClassPrefix: 'language-',
      domAttributes: {},
    }
  },

  content: 'text*',

  marks: '',

  group: 'blockContent',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: '',
        parseHTML: (element) => {
          const { languageClassPrefix } = this.options
          const getClassNames = (classList: DOMTokenList) => Array.from(classList || [])

          const classNames = [
            ...getClassNames(element.classList),
            ...getClassNames(element.firstElementChild?.classList || new DOMTokenList()),
          ]
          const languages = classNames
            .filter((className) => className.startsWith(languageClassPrefix))
            .map((className) => className.replace(languageClassPrefix, ''))
          const language = languages[0]

          if (!language) {
            return ''
          }

          return language
        },
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const blockContentDOMAttributes = this.options.domAttributes?.blockContent || {}
    const inlineContentDOMAttributes = this.options.domAttributes?.inlineContent || {}

    return [
      'pre',
      mergeAttributes(HTMLAttributes, {
        ...blockContentDOMAttributes,
        class: mergeCSSClasses(
          styles.blockContent,
          blockContentDOMAttributes.class,
          node.attrs.language.length ? this.options.languageClassPrefix + node.attrs.language : '',
        ),
        'data-content-type': this.name,
        'data-language': HTMLAttributes.language,
      }),
      [
        'code',
        {
          ...inlineContentDOMAttributes,
          class: mergeCSSClasses(styles.inlineContent, inlineContentDOMAttributes.class),
        },
        0,
      ],
    ]
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
    }
  },

  addKeyboardShortcuts() {
    function splitCodeBlock(editor: Editor) {
      const { state } = editor
      const codePos = state.doc.resolve(state.selection.$from.pos)
      const blockInfo = getBlockInfoFromPos(state.doc, codePos.pos)
      if (blockInfo === undefined) {
        return false
      }

      const { depth } = blockInfo

      const originalBlockContent = state.doc.cut(codePos.start(), codePos.pos)
      const newBlockContent = state.doc.cut(codePos.pos, codePos.end())

      const newBlock = state.schema.nodes.blockContainer.createAndFill()!
      const nextBlockPos = codePos.end() + 2
      const nextBlockContentPos = nextBlockPos + 2

      let tr = state.tr
      tr = tr.insert(nextBlockPos, newBlock)
      tr = tr.replace(
        nextBlockContentPos,
        nextBlockContentPos + 1,
        newBlockContent.content.size > 0 ? new Slice(Fragment.from(newBlockContent), depth + 2, depth + 2) : undefined,
      )
      tr = tr.replace(
        codePos.start(),
        codePos.end(),
        originalBlockContent.content.size > 0
          ? new Slice(Fragment.from(originalBlockContent), depth + 2, depth + 2)
          : undefined,
      )

      editor.view.dispatch(tr)

      let blockContentLength = 0
      if (newBlockContent.textContent) blockContentLength = newBlockContent.textContent.length
      editor.commands.setTextSelection(nextBlockContentPos - blockContentLength)

      return true
    }

    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),

      // Split code block's content on current selection and move other content to the next block.
      'Shift-Enter': ({ editor }) => splitCodeBlock(editor),
      'Mod-Enter': ({ editor }) => splitCodeBlock(editor),

      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === 1

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes()
        }

        return false
      },

      // remove double space (if any) from the current line on shift+tab click
      'Shift-Tab': ({ editor }) => {
        const { state, view } = editor
        const { selection } = state
        const { $from, $to, empty } = selection

        if ($from.parent.type !== this.type) {
          return false
        }

        const codePos = state.doc.resolve($from.pos)

        if (codePos.pos === codePos.start() && empty) {
          return false
        }

        const codeBlock = codePos.parent
        let currentPosInBlock = codePos.pos - codePos.start()
        let currentChar: string = ''
        const tabSpace = '  '

        do {
          currentPosInBlock--

          currentChar = codeBlock.textBetween(currentPosInBlock, currentPosInBlock + 1)
        } while (currentChar !== '\n' && currentPosInBlock !== -1)

        if (currentPosInBlock + 2 >= codePos.end() - codePos.start()) return true

        do {
          currentPosInBlock++
          currentChar = codeBlock.textBetween(currentPosInBlock, currentPosInBlock + 2)
        } while (
          currentChar !== tabSpace &&
          !currentChar.includes('\n') &&
          currentPosInBlock + 2 < codePos.end() - codePos.start()
        )

        const breakLinePositions: number[] = []

        if (!empty) {
          let currentPos = $from.pos - codePos.start()
          currentChar = ''
          while (currentPos !== $to.pos - codePos.start()) {
            currentChar = codeBlock.textBetween(currentPos, currentPos + 1)

            if (currentChar === '\n') {
              const nextChars = codeBlock.textBetween(currentPos + 1, currentPos + 3)
              if (nextChars === tabSpace) breakLinePositions.push(currentPos + 1)
            }

            currentPos++
          }
        }

        let shouldDispatch = false
        let tr = state.tr
        if (currentChar === tabSpace) {
          tr = tr.deleteRange(currentPosInBlock + codePos.start(), currentPosInBlock + codePos.start() + 2)
          shouldDispatch = true
        }
        if (breakLinePositions.length > 0) {
          breakLinePositions.forEach((pos, index) => {
            const startPos = pos + codePos.start()
            const endPos = pos + codePos.start() + 2
            if (shouldDispatch) {
              tr = tr.deleteRange(startPos - (index + 1) * 2, endPos - (index + 1) * 2)
            } else {
              tr = tr.deleteRange(startPos - index * 2, endPos - index * 2)
            }
          })
          shouldDispatch = true
        }

        view.dispatch(tr)

        return true
      },

      // add double space to the current line on tab click
      Tab: ({ editor }) => {
        const { state, view } = editor
        const { selection } = state
        const { $from, $to, empty } = selection
        const tabSpace = '  '

        if ($from.parent.type !== this.type) {
          return false
        }

        const codePos = state.doc.resolve($from.pos)

        if (codePos.pos === codePos.start() && empty) {
          return false
        }

        const codeBlock = codePos.parent
        let currentPosInBlock = codePos.pos - codePos.start()
        let currentChar: string = ''

        while (currentChar !== '\n' && currentPosInBlock !== -1) {
          currentPosInBlock--

          currentChar = codeBlock.textBetween(currentPosInBlock, currentPosInBlock + 1)
        }

        const breakLinePositions: number[] = []

        if (!empty) {
          let currentPos = $from.pos - codePos.start()
          currentChar = ''
          while (currentPos !== $to.pos - codePos.start()) {
            currentChar = codeBlock.textBetween(currentPos, currentPos + 1)

            if (currentChar === '\n') {
              breakLinePositions.push(currentPos)
            }

            currentPos++
          }
        }

        let tr = state.tr
        tr = tr.insert(currentPosInBlock + codePos.start() + 1, state.schema.text(tabSpace))
        if (breakLinePositions.length > 0) {
          breakLinePositions.forEach((pos, index) => {
            tr = tr.insert(pos + codePos.start() + 1 + (index + 1) * 2, state.schema.text(tabSpace))
          })
        }
        view.dispatch(tr)
        return true
      },

      // exit node on enter if at end of the block and at the new line or add a new line
      Enter: ({ editor }) => {
        const { state, view } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const codePos = state.doc.resolve($from.pos)
        const codeBlock = codePos.parent
        const isAtEnd = codePos.parentOffset === codeBlock.nodeSize - 2
        const endsWithNewline = codeBlock.textContent.endsWith('\n')
        if (isAtEnd && endsWithNewline) {
          const nextBlockPos = codePos.end() + 2
          const { group, container, $pos, depth } = getGroupInfoFromPos(codePos.pos, state)
          if (group.type.name === 'blockGroup' && group.lastChild?.firstChild?.eq(codeBlock)) {
            editor
              .chain()
              .command(({ tr }) => {
                if (group.child(group.childCount - 1).childCount > 1) {
                  const groupContent = group.content
                  const lastBlockContent = groupContent.lastChild!.lastChild!
                  const newBlockContent = [state.schema.nodes.paragraph.createAndFill()!, lastBlockContent]
                  const newContainer = state.schema.nodes.blockContainer.createAndFill(null, newBlockContent)!
                  const replaceContainer = state.schema.nodes.blockContainer.createAndFill(container?.attrs, codeBlock)!
                  const newGroupContent = group.content
                    .replaceChild(group.childCount - 1, replaceContainer)
                    .addToEnd(newContainer)
                  const newGroup = state.schema.nodes.blockGroup.createAndFill(group.attrs, newGroupContent)!
                  const groupPos = state.doc.resolve($pos.after(depth + 1))
                  tr.replaceRangeWith(groupPos.start(), groupPos.end(), newGroup)
                } else {
                  const newContainer = state.schema.nodes.blockContainer.createAndFill()!
                  tr.insert(nextBlockPos, newContainer)
                }
                return false
              })
              .focus(nextBlockPos)
              .command(({ tr }) => {
                tr.delete($from.pos - 1, $from.pos)
                return true
              })
              .run()
            return true
          }
          editor
            .chain()
            .focus(nextBlockPos)
            .command(({ tr }) => {
              tr.delete($from.pos - 1, $from.pos)
              return true
            })
            .run()

          return true
        }
        let tr = state.tr
        tr = tr.replaceSelectionWith(state.schema.text('\n'))
        view.dispatch(tr)
        return true
      },

      // exit node on arrow down
      ArrowDown: ({ editor }) => {
        const { state } = editor
        const { selection, doc } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2

        if (!isAtEnd) {
          return false
        }

        const after = $from.after()

        if (after === undefined) {
          return false
        }

        const nodeAfter = doc.nodeAt(after)

        if (nodeAfter) {
          return false
        }

        return editor.commands.exitCode()
      },
    }
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1],
        }),
      }),
      textblockTypeInputRule({
        find: tildeInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1],
        }),
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      // this plugin creates a code block for pasted content from VS Code
      // we can also detect the copied code language
      new Plugin({
        key: new PluginKey('codeBlockVSCodeHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!event.clipboardData) {
              return false
            }

            // don’t create a new code block within code blocks
            if (this.editor.isActive(this.type.name)) {
              return false
            }

            const text = event.clipboardData.getData('text/plain')
            const vscode = event.clipboardData.getData('vscode-editor-data')
            const vscodeData = vscode ? JSON.parse(vscode) : undefined
            const language = vscodeData?.mode

            if (!text || !language) {
              return false
            }

            const { tr } = view.state
            const { selection } = view.state
            const { $from, $to } = selection

            // create an empty code block
            tr.replaceWith($from.before($from.depth), $to.pos, this.type.create({ language }))

            // put cursor inside the newly created code block
            tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(0, $from.pos - 2))))

            // add text to code block
            // strip carriage return chars from text pasted as code
            // see: https://github.com/ProseMirror/prosemirror-view/commit/a50a6bcceb4ce52ac8fcc6162488d8875613aacd
            tr.insertText(text.replace(/\r\n?/g, '\n'))

            // store meta information
            // this is useful for other plugins that depends on the paste event
            // like the paste rule plugin
            tr.setMeta('paste', true)

            view.dispatch(tr)

            return true
          },
        },
      }),
    ]
  },
})
