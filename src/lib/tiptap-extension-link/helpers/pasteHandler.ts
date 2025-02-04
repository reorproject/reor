import { getLinkMenuItems } from '@/editor/blocknote/core'
import { linkMenuPluginKey } from '@/editor/blocknote/core/extensions/LinkMenu/LinkMenuPlugin'
import { loadWebLinkMeta } from '@/models/web-links'
import { toPlainMessage } from '@bufbuild/protobuf'
import {
  GRPCClient,
  StateStream,
  UnpackedHypermediaId,
  extractBlockRefOfUrl,
  getDocumentTitle,
  hmId,
  hmIdPathToEntityQueryPath,
  hmIdWithVersion,
  isHypermediaScheme,
  isPublicGatewayLink,
  packHmId,
  unpackHmId,
} from '@shm/shared'
import { Editor } from '@tiptap/core'
import { Mark, MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { find } from 'linkifyjs'
import { nanoid } from 'nanoid'

type PasteHandlerOptions = {
  grpcClient: GRPCClient
  editor: Editor
  type: MarkType
  linkOnPaste?: boolean
  gwUrl: StateStream<string>
  checkWebUrl: (url: string) => Promise<any>
}

export function pasteHandler(options: PasteHandlerOptions): Plugin {
  let pastePlugin = new Plugin({
    key: new PluginKey('handlePasteLink'),
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr, set) {
        // Adjust decoration positions to changes made by the transaction
        set = set.map(tr.mapping, tr.doc)
        // See if the transaction adds or removes any placeholders
        let action = tr.getMeta('link-placeholder')
        if (action && action.add) {
          let widget = document.createElement('span')
          widget.contentEditable = 'false'
          widget.classList.add('link-placeholder')
          let deco = Decoration.widget(action.add.pos, widget, {
            link: action.add.link,
          })
          set = set.add(tr.doc, [deco])
        } else if (action && action.remove) {
          set = set.remove(
            set.find(
              // @ts-expect-error
              null,
              null,
              (spec) => spec.link.href == action.remove.link.href,
            ),
          )
        }
        return set
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
      handlePaste: (view, event, slice) => {
        const { state } = view
        const { selection } = state

        // Do not proceed if in code block.
        if (state.doc.resolve(selection.from).parent.type.spec.code) {
          return false
        }

        const pastedLinkMarks: Mark[] = []
        let textContent = ''

        slice.content.forEach((node) => {
          textContent += node.textContent

          node.marks.forEach((mark) => {
            if (mark.type.name === options.type.name) {
              pastedLinkMarks.push(mark)
            }
          })
        })

        textContent = textContent.trim()

        if (!textContent) {
          return false
        }

        const hasPastedLink = pastedLinkMarks.length > 0
        const link = find(textContent).find((item) => item.isLink && item.value === textContent)
        const unpackedHmId =
          isHypermediaScheme(textContent) || isPublicGatewayLink(textContent, options.gwUrl)
            ? unpackHmId(textContent)
            : null

        if (!selection.empty && options.linkOnPaste) {
          const pastedLink = unpackedHmId
            ? packHmId(unpackedHmId)
            : hasPastedLink
              ? pastedLinkMarks[0].attrs.href
              : link?.href || null
          if (pastedLink) {
            if (unpackedHmId) {
              options.editor
                .chain()
                .setMark(options.type, {
                  href: pastedLink,
                })
                .run()
            } else {
              let id = nanoid(8)
              options.editor
                .chain()
                .command(({ tr }) => {
                  tr.setMeta('hmPlugin:uncheckedLink', id)
                  return true
                })
                .setMark(options.type, {
                  href: pastedLink,
                  id,
                })
                .run()
            }

            return true
          }
        }

        const firstChildIsText = slice.content.firstChild?.type.name === 'text'
        const firstChildContainsLinkMark = slice.content.firstChild?.marks.some(
          (mark) => mark.type.name === options.type.name,
        )

        if (firstChildIsText && firstChildContainsLinkMark) {
          return false
        }

        if (selection.empty && unpackedHmId?.uid && unpackedHmId.type) {
          let tr = view.state.tr

          let pos = tr.selection.from
          const normalizedHmUrl = packHmId(
            hmId(unpackedHmId.type, unpackedHmId.uid, {
              blockRef: unpackedHmId.blockRef,
              blockRange: unpackedHmId.blockRange,
              version: unpackedHmId.version,
              latest: unpackedHmId.latest,
              path: unpackedHmId.path,
            }),
          )

          fetchEntityTitle(unpackedHmId, options.grpcClient)
            .then(({ title }) => {
              if (title) {
                view.dispatch(
                  tr.insertText(title, pos).addMark(
                    pos,
                    pos + title.length,
                    options.editor.schema.mark('link', {
                      href: normalizedHmUrl,
                    }),
                  ),
                )

                view.dispatch(
                  view.state.tr.scrollIntoView().setMeta(linkMenuPluginKey, {
                    activate: true,
                    ref: normalizedHmUrl,
                    items: getLinkMenuItems({
                      isLoading: false,
                      hmId: unpackHmId(normalizedHmUrl),
                      sourceUrl: normalizedHmUrl,
                      docTitle: title,
                      gwUrl: options.gwUrl,
                    }),
                  }),
                )
              } else {
                view.dispatch(
                  tr.insertText(normalizedHmUrl, pos).addMark(
                    pos,
                    pos + normalizedHmUrl.length,
                    options.editor.schema.mark('link', {
                      href: normalizedHmUrl,
                    }),
                  ),
                )

                view.dispatch(
                  view.state.tr.scrollIntoView().setMeta(linkMenuPluginKey, {
                    activate: true,
                    ref: normalizedHmUrl,
                    items: getLinkMenuItems({
                      isLoading: false,
                      sourceUrl: normalizedHmUrl,
                      hmId: unpackHmId(normalizedHmUrl),
                      gwUrl: options.gwUrl,
                    }),
                  }),
                )
              }
            })
            .catch((err) => {
              view.dispatch(
                tr.insertText(normalizedHmUrl, pos).addMark(
                  pos,
                  pos + normalizedHmUrl.length,
                  options.editor.schema.mark('link', {
                    href: normalizedHmUrl,
                  }),
                ),
              )

              view.dispatch(
                view.state.tr.scrollIntoView().setMeta(linkMenuPluginKey, {
                  activate: true,
                  ref: normalizedHmUrl,
                  items: getLinkMenuItems({
                    isLoading: false,
                    sourceUrl: normalizedHmUrl,
                    hmId: unpackHmId(normalizedHmUrl),
                    gwUrl: options.gwUrl,
                  }),
                }),
              )
            })

          return true
        }

        if (link && selection.empty) {
          let tr = view.state.tr
          if (!tr.selection.empty) tr.deleteSelection()

          const [mediaCase, fileName] = checkMediaUrl(link.href)

          const pos = selection.$from.pos

          view.dispatch(
            tr.insertText(link.href, pos).addMark(
              pos,
              pos + link.href.length,
              options.editor.schema.mark('link', {
                href: link.href,
              }),
            ),
          )

          view.dispatch(
            view.state.tr.scrollIntoView().setMeta(linkMenuPluginKey, {
              activate: true,
              link: link.href,
              items: getLinkMenuItems({
                isLoading: true,
                gwUrl: options.gwUrl,
              }),
            }),
          )

          switch (mediaCase) {
            case 1:
              view.dispatch(
                view.state.tr.setMeta(linkMenuPluginKey, {
                  link: link.href,
                  items: getLinkMenuItems({
                    isLoading: false,
                    media: 'image',
                    fileName: fileName,
                    gwUrl: options.gwUrl,
                  }),
                }),
              )
              break
            case 2:
              view.dispatch(
                view.state.tr.setMeta(linkMenuPluginKey, {
                  link: link.href,
                  items: getLinkMenuItems({
                    isLoading: false,
                    media: 'file',
                    fileName: fileName,
                    gwUrl: options.gwUrl,
                  }),
                }),
              )
              break
            case 3:
              view.dispatch(
                view.state.tr.setMeta(linkMenuPluginKey, {
                  link: link.href,
                  items: getLinkMenuItems({
                    isLoading: false,
                    media: 'video',
                    sourceUrl: link.href,
                    fileName: fileName,
                    gwUrl: options.gwUrl,
                  }),
                }),
              )
              break
            case 4:
              view.dispatch(
                view.state.tr.setMeta(linkMenuPluginKey, {
                  link: link.href,
                  items: getLinkMenuItems({
                    isLoading: false,
                    media: 'twitter',
                    sourceUrl: link.href,
                    fileName: fileName,
                    gwUrl: options.gwUrl,
                  }),
                }),
              )
              break
            case 0: {
              const metaPromise = loadWebLinkMeta(link.href)
                .then((res) => {
                  if (res) {
                    const title = res.hypermedia_title
                    const fullHmUrl = hmIdWithVersion(
                      res.hypermedia_id,
                      res.hypermedia_version,
                      extractBlockRefOfUrl(link.href),
                    )
                    if (title && fullHmUrl) {
                      view.dispatch(
                        view.state.tr
                          .deleteRange(pos, pos + link.href.length)
                          .insertText(title, pos)
                          .addMark(
                            pos,
                            pos + title.length,
                            options.editor.schema.mark('link', {
                              href: fullHmUrl,
                            }),
                          ),
                      )
                    }
                    if (fullHmUrl) {
                      view.dispatch(
                        view.state.tr.setMeta(linkMenuPluginKey, {
                          link: fullHmUrl,
                          items: getLinkMenuItems({
                            hmId: unpackHmId(fullHmUrl),
                            isLoading: false,
                            sourceUrl: fullHmUrl,
                            docTitle: res.hypermedia_title,
                            gwUrl: options.gwUrl,
                          }),
                        }),
                      )
                      return true
                    }
                  }
                })
                .catch((err) => {
                  console.log('ERROR FETCHING web link')

                  console.log(err)
                })
              const mediaPromise = options
                .checkWebUrl(link.href)
                .then((response) => {
                  if (response && response.contentType) {
                    let type = response.contentType.split('/')[0]
                    if (type === 'application') type = 'file'
                    if (['image', 'video', 'file'].includes(type)) {
                      view.dispatch(
                        view.state.tr.setMeta(linkMenuPluginKey, {
                          link: link.href,
                          items: getLinkMenuItems({
                            isLoading: false,
                            media: type,
                            sourceUrl: link.href,
                            gwUrl: options.gwUrl,
                          }),
                        }),
                      )
                      return true
                    }
                  }
                })
                .catch((err) => {
                  console.log(err)
                })
              Promise.all([metaPromise, mediaPromise])
                .then((results) => {
                  const [embedResult, mediaResult] = results
                  if (!embedResult && !mediaResult) {
                    view.dispatch(
                      view.state.tr.setMeta(linkMenuPluginKey, {
                        items: getLinkMenuItems({
                          isLoading: false,
                          sourceUrl: link.href,
                          gwUrl: options.gwUrl,
                        }),
                      }),
                    )
                  }
                })
                .catch((err) => {
                  console.log(err)
                })
            }
            default:
              break
          }

          return true
        }

        const { tr } = state
        let deleteOnly = false

        if (!selection.empty) {
          deleteOnly = true

          tr.delete(selection.from, selection.to)
        }

        let currentPos = selection.from
        let fragmentLinks = []

        slice.content.forEach((node) => {
          fragmentLinks = find(node.textContent)

          tr.insert(currentPos - 1, node)

          if (fragmentLinks.length > 0) {
            deleteOnly = false

            fragmentLinks.forEach((fragmentLink) => {
              const linkStart = currentPos + fragmentLink.start
              const linkEnd = currentPos + fragmentLink.end
              const hasMark = tr.doc.rangeHasMark(linkStart, linkEnd, options.type)

              if (!hasMark) {
                let id = nanoid(8)
                tr.addMark(linkStart, linkEnd, options.type.create({ href: fragmentLink.href, id })).setMeta(
                  'hmPlugin:uncheckedLink',
                  id,
                )
              }
            })
          }
          currentPos += node.nodeSize
        })

        const hasFragmentLinks = fragmentLinks.length > 0

        if (tr.docChanged && !deleteOnly && hasFragmentLinks) {
          options.editor.view.dispatch(tr)

          return true
        }

        return false
      },
    },
  })

  function checkMediaUrl(url: string): [number, string] {
    const matchResult = url.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/)
    if (matchResult) {
      const extensionArray = matchResult[0].split('.')
      const extension = extensionArray[extensionArray.length - 1]
      if (['png', 'jpg', 'jpeg'].includes(extension)) return [1, matchResult[0]]
      else if (['pdf', 'xml', 'csv'].includes(extension)) return [2, matchResult[0]]
      else if (['mp4', 'webm', 'ogg'].includes(extension)) return [3, matchResult[0]]
    } else if (['youtu.be', 'youtube', 'vimeo'].some((value) => url.includes(value))) {
      return [3, '']
    } else if (['twitter', 'x.com'].some((value) => url.includes(value))) {
      return [4, '']
    }
    return [0, '']
  }

  return pastePlugin
}

async function fetchEntityTitle(hmId: UnpackedHypermediaId, grpcClient: GRPCClient) {
  if (hmId.type == 'd') {
    const document = await grpcClient.documents.getDocument({
      account: hmId.uid,
      path: hmIdPathToEntityQueryPath(hmId.path),
    })
    const doc = toPlainMessage(document)
    const title = getDocumentTitle(doc)
    return {
      title,
    }
  } else if (hmId.type == 'comment') {
    try {
      const comment = await grpcClient.comments.getComment({
        id: hmId.id,
      })

      if (comment) {
        const profile = await grpcClient.documents.getProfileDocument({
          accountId: comment.author,
        })

        return {
          title: `Comment from ${profile.metadata?.alias || `${profile.id.slice(0, 5)}...${profile.id.slice(-5)}`}`,
        }
      } else {
        return {
          title: null,
        }
      }
    } catch (error) {
      console.error(`fetchEntityTitle error: ${JSON.stringify(error)}`)
      return { title: null }
    }
  }
  return { title: null }
}
