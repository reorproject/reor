import { Editor, Extension } from '@tiptap/core'
import { Fragment, Node } from '@tiptap/pm/model'
import { Plugin } from 'prosemirror-state'
import { youtubeParser } from '@/components/Editor/types/utils'
import { BlockNoteEditor } from '../../BlockNoteEditor'
import { getBlockInfoFromPos } from '@/lib/utils'
import * as BlockUtils from '@/lib/utils/block-utils'

function containsMarkdownSymbols(pastedText: string) {
  // Regex to detect unique Markdown symbols at the start of a line
  // eslint-disable-next-line no-useless-backreference
  const markdownUniqueSymbols = new RegExp(
    [
      '^#{1,6} ', // Headers
      '^[\\s]*[-+*] ', // Unordered Lists
      '^\\d+\\. ', // Ordered Lists
      '^[\\s]*> ', // Blockquotes
      '^```', // Code Fences
      '^`[^`]+`$', // Inline Code
      '^!\\[([^\\]]*)\\]\\(([^)]+)\\)$', // Images
      '^(\\*\\*|__)(.*?)\\1$',
      '^(\\*|_)(.*?)\\1$',
    ].join('|'),
    'm',
  )

  // Split the text by lines and check each line
  const lines = pastedText.split('\n').map((line) => line.trim())

  // Ensure that at least one line contains valid Markdown symbols
  return lines.some((line) => markdownUniqueSymbols.test(line))
}

// Get nodes of a fragment or block group to be pasted
function getPastedNodes(parent: Node | Fragment, editor: Editor) {
  const nodes: Node[] = []
  parent.forEach((node) => {
    if (node.type.name === 'blockGroup') {
      const prevContainer = nodes.pop()
      if (prevContainer) {
        const container = editor.schema.nodes.blockContainer.create(
          prevContainer.attrs,
          prevContainer.content.addToEnd(node),
        )
        nodes.push(container)
      }
    } else if (node.type.name !== 'blockContainer') {
      let nodeToInsert = node
      if (node.type.name === 'text') {
        nodeToInsert = editor.schema.nodes.paragraph.create({}, node)
      }
      const container = editor.schema.nodes.blockContainer.create(null, nodeToInsert)
      nodes.push(container)
    } else nodes.push(node)
  })
  return nodes
}

const createMarkdownExtension = (bnEditor: BlockNoteEditor) => {
  const MarkdownExtension = Extension.create({
    name: 'MarkdownPasteHandler',
    priority: 900,

    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handlePaste: (view, event, slice) => {
              const selectedNode = view.state.selection.$from.parent
              // Don't proceed if pasting into code block
              console.log(`Pasting content`)
              if (selectedNode.type.name === 'code-block' || selectedNode.firstChild?.type.name === 'code-block') {
                return false
              }
              const pastedText = event.clipboardData!.getData('text/plain')
              const pastedHtml = event.clipboardData!.getData('text/html')
              const hasList = pastedHtml.includes('<ul') || pastedHtml.includes('<ol')
              const hasVideo = pastedText.includes('youtube')
              const { state } = view
              const { selection } = state

              const isMarkdown = pastedHtml ? containsMarkdownSymbols(pastedText) : true

              if (!isMarkdown) {
                if (hasList) {
                  const firstBlockGroup = slice.content.firstChild?.type.name === 'blockGroup'
                  const nodes: Node[] = getPastedNodes(
                    firstBlockGroup ? slice.content.firstChild : slice.content,
                    this.editor,
                  )
                  const root = this.editor.schema.nodes.blockGroup.create({}, nodes)
                  let tr = state.tr
                  tr = tr.replaceRangeWith(
                    selection.from,
                    selection.to,
                    // @ts-ignore
                    root.content.content,
                  )
                  view.dispatch(tr)
                  return true
                }
                return false
              } else if (hasVideo) {
                let embedUrl = 'https://www.youtube.com/embed/'
                if (pastedText.includes('youtu.be') || pastedText.includes('youtube')) {
                  const ytId = youtubeParser(pastedText)
                  if (ytId) {
                    embedUrl += ytId
                    const node = view.state.schema.nodes.video.create({
                      url: embedUrl,
                      name: 'youtube',
                    })
                    view.dispatch(view.state.tr.replaceSelectionWith(node))
                  }
                }
              } else {
                // This is not a media file, just plaintext
                bnEditor.markdownToBlocks(pastedText).then((organizedBlocks: any) => {
                  const blockInfo = getBlockInfoFromPos(state.doc, selection.from)
                  console.log(`BLockINfo type: `, blockInfo.node.type.name)
                  bnEditor.replaceBlocks(
                    [blockInfo.node.attrs.id],
                    // @ts-ignore
                    organizedBlocks,
                  )
                  BlockUtils.setGroupTypes(bnEditor._tiptapEditor, organizedBlocks)
                })
              }
              return true
            },
          },
        }),
      ]
    },
  })

  return MarkdownExtension
}

export default createMarkdownExtension
