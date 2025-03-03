// import {HMBlockSchema} from '@/editor/schema'
// import {youtubeParser} from '@/editor/utils'
// import {
//   createHMUrl,
//   isHypermediaScheme,
//   isPublicGatewayLink,
//   normalizeHmId,
//   StateStream,
//   UnpackedHypermediaId,
// } from '@shm/shared'
// import {
//   File as FileIcon,
//   ImageIcon,
//   Link,
//   Spinner,
//   TwitterXIcon,
//   VideoIcon,
// } from '@shm/ui'
// import {CircleDot, PanelBottom, Quote} from '@tamagui/lucide-icons'
// import {Fragment, Node} from '@tiptap/pm/model'
// import {BlockNoteEditor} from '../../BlockNoteEditor'
// import {getBlockInfoFromPos} from '../Blocks/helpers/getBlockInfoFromPos'
// import {LinkMenuItem} from './LinkMenuItem'

// export function getLinkMenuItems({
//   isLoading,
//   hmId,
//   media,
//   sourceUrl,
//   fileName,
//   docTitle,
//   gwUrl,
// }: {
//   isLoading: boolean // true is spinner needs to be shown
//   hmId?: UnpackedHypermediaId | null // if the link is an embeddable link
//   media?: string // type of media block if link points to a media file
//   sourceUrl?: string // the inserted link into the editor. needed to correctly replace the link with block
//   fileName?: string // file name if any
//   docTitle?: string | null // document title if any
//   gwUrl: StateStream<string>
// }) {
//   let linkMenuItems: LinkMenuItem[] = []

//   if (sourceUrl && !isHypermediaScheme(sourceUrl)) {
//     linkMenuItems = [
//       {
//         name: 'Link',
//         disabled: false,
//         icon: <Link size={18} />,
//         execute: (editor: BlockNoteEditor<HMBlockSchema>, ref: string) => {
//           const {state, schema, view} = editor._tiptapEditor
//           const {selection} = state
//           const pos = selection.from - docTitle!.length
//           view.dispatch(
//             view.state.tr
//               .deleteRange(pos, pos + docTitle!.length)
//               .insertText(docTitle!, pos)
//               .addMark(
//                 pos,
//                 pos + docTitle!.length,
//                 schema.mark('link', {
//                   href: sourceUrl,
//                 }),
//               ),
//           )
//         },
//       },
//       {
//         name: 'Button',
//         disabled: false,
//         icon: <CircleDot size={18} />,
//         execute: (editor: BlockNoteEditor<HMBlockSchema>, ref: string) => {
//           const {state, schema} = editor._tiptapEditor
//           const {selection} = state
//           if (!selection.empty) return
//           const node = schema.nodes.button.create({
//             url: sourceUrl,
//             name: sourceUrl,
//           })

//           insertNode(editor, sourceUrl, node)
//         },
//       },
//       ...linkMenuItems,
//     ]
//   }

//   if (isLoading) {
//     const loadingItem = {
//       name: 'Checking link...',
//       // hm://z6Mkj5NQAYGQSLRAV2L6g4R2LC8D2FL47XW5miJsPaRvkerg?v=bafy2bzacecwv74orbeuwfdzyvnbyzqnwzdn3gorznjku7ythcyyj6aqqktcqu
//       icon: <Spinner size="small" />,
//       disabled: true,
//       execute: (_editor: BlockNoteEditor<HMBlockSchema>, _ref: string) => {},
//     }

//     linkMenuItems = [loadingItem, ...linkMenuItems]
//   } else {
//     if (hmId) {
//       // if (hmId.type !== 'c') {
//       //   // comments are not supported for card embeds yet

//       //   linkMenuItems = [
//       //     {
//       //       name: `Insert Card of ${
//       //         docTitle
//       //           ? '"' + docTitle + '"'
//       //           : HYPERMEDIA_ENTITY_TYPES[hmId.type]
//       //       }`,
//       //       disabled: false,
//       //       icon: <SquareAsterisk size={18} />,
//       //       execute: (editor: BlockNoteEditor<HMBlockSchema>, ref: string) => {
//       //         const {state, schema} = editor._tiptapEditor
//       //         const {selection} = state
//       //         if (!selection.empty) return
//       //         const node = schema.nodes.embed.create(
//       //           {
//       //             url: createHMUrl(hmId),
//       //             view: 'Card',
//       //           },
//       //           schema.text(' '),
//       //         )

//       //         insertNode(editor, sourceUrl || ref, node)
//       //       },
//       //     },
//       //     ...linkMenuItems,
//       //   ]
//       // }

//       if (hmId.type) {
//         linkMenuItems = [
//           {
//             // name: `Embed ${HYPERMEDIA_ENTITY_TYPES[hmId.type]} ${
//             //   docTitle
//             //     ? '"' + docTitle + '"'
//             //     : HYPERMEDIA_ENTITY_TYPES[hmId.type]
//             // }`,
//             name: 'Embed',
//             disabled: false,
//             icon: <PanelBottom size={18} />,
//             execute: (editor: BlockNoteEditor<HMBlockSchema>, ref: string) => {
//               const {state, schema} = editor._tiptapEditor
//               const {selection} = state
//               if (!selection.empty) return
//               const hmRef = createHMUrl(hmId)
//               const node = schema.nodes.embed.create(
//                 {
//                   url: hmRef,
//                   view: 'Content',
//                 },
//                 schema.text(' '),
//               )

//               insertNode(editor, sourceUrl || hmRef, node)
//             },
//           },
//           ...linkMenuItems,
//         ]
//       }

//       if (docTitle && docTitle !== sourceUrl) {
//         linkMenuItems = [
//           {
//             // name: `Link as "${docTitle}"`,
//             name: 'Link',
//             disabled: false,
//             icon: <Link size={18} />,
//             execute: (editor: BlockNoteEditor<HMBlockSchema>, ref: string) => {
//               // this is the default behavior of HM links and is already applied by this time
//             },
//           },
//           {
//             // name: `Mention "${docTitle}"`,
//             name: 'Mention',
//             disabled: false,
//             icon: <Quote size={18} />,
//             execute: (editor: BlockNoteEditor<HMBlockSchema>, link: string) => {
//               if (
//                 isPublicGatewayLink(link, gwUrl) ||
//                 isHypermediaScheme(link)
//               ) {
//                 const hmId = normalizeHmId(link, gwUrl)
//                 if (!hmId) return
//                 link = hmId
//               }
//               const {state, schema} = editor._tiptapEditor
//               const {selection} = state
//               if (!selection.empty) return
//               const node = schema.nodes['inline-embed'].create(
//                 {
//                   link,
//                 },
//                 schema.text(' '),
//               )

//               insertMentionNode(editor, sourceUrl || link, docTitle, node)
//             },
//           },
//           {
//             name: 'Button',
//             disabled: false,
//             icon: <CircleDot size={18} />,
//             execute: (editor: BlockNoteEditor<HMBlockSchema>, ref: string) => {
//               const {state, schema} = editor._tiptapEditor
//               const {selection} = state
//               if (!selection.empty) return
//               const node = schema.nodes.button.create({
//                 url: sourceUrl,
//                 name: docTitle,
//               })

//               insertNode(editor, sourceUrl || ref, node)
//             },
//           },
//           ...linkMenuItems,
//         ]
//       }
//     } else if (media) {
//       let mediaIcon
//       switch (media) {
//         case 'twitter':
//           mediaIcon = <TwitterXIcon width={18} height={18} />
//           break
//         case 'video':
//           mediaIcon = <VideoIcon width={18} height={18} />
//           break
//         case 'image':
//           mediaIcon = <ImageIcon width={18} height={18} />
//           break
//         default:
//           mediaIcon = <FileIcon width={18} height={18} />
//           break
//       }
//       const mediaItem = {
//         name:
//           media === 'twitter'
//             ? 'X Post embed'
//             : media.charAt(0).toUpperCase() + media.slice(1),
//         disabled: false,
//         icon: mediaIcon,
//         execute: (editor: BlockNoteEditor<HMBlockSchema>, link: string) => {
//           const {state, schema} = editor._tiptapEditor
//           const {selection} = state
//           if (!selection.empty) return
//           let embedUrl = ''
//           if (media === 'video') {
//             let videoUrl = link ? link : sourceUrl ? sourceUrl : ''
//             if (videoUrl.includes('youtu.be') || videoUrl.includes('youtube')) {
//               let ytId = youtubeParser(videoUrl)
//               if (ytId) {
//                 videoUrl = `https://www.youtube.com/embed/${ytId}`
//               } else {
//                 videoUrl = ''
//               }
//             } else if (videoUrl.includes('vimeo')) {
//               const urlArray = videoUrl.split('/')
//               videoUrl =
//                 'https://player.vimeo.com/video/' +
//                 urlArray[urlArray.length - 1]
//             }
//             embedUrl = videoUrl
//           }

//           const node =
//             media !== 'twitter'
//               ? schema.nodes[media].create({
//                   url: embedUrl ? embedUrl : '',
//                   src: embedUrl ? '' : link ? link : sourceUrl ? sourceUrl : '',
//                   name: fileName ? fileName : '',
//                 })
//               : schema.nodes['web-embed'].create({
//                   url: link ? link : sourceUrl,
//                 })

//           insertNode(editor, link ? link : sourceUrl ? sourceUrl : '', node)
//         },
//       }

//       linkMenuItems = [mediaItem, ...linkMenuItems]
//     }
//   }

//   return linkMenuItems
// }

// function insertNode(
//   editor: BlockNoteEditor<HMBlockSchema>,
//   ref: string,
//   node: Node,
// ) {
//   const {state, schema, view} = editor._tiptapEditor
//   const {doc, selection} = state
//   const {$from} = selection
//   const block = getBlockInfoFromPos(doc, selection.$anchor.pos)
//   let tr = state.tr

//   // If inserted link inline with other text (child count will be more than 1)
//   if (block.contentNode.content.childCount > 1) {
//     const $pos = state.doc.resolve($from.pos)
//     let originalStartContent = state.doc.cut(
//       $pos.start(),
//       $pos.pos - ref.length,
//     )
//     let originalLastContent = state.doc.cut($pos.pos, $pos.end())
//     const originalContent: Node[] = []
//     originalStartContent.descendants((childNode) => {
//       if (childNode.type.name === 'text') originalContent.push(childNode)
//     })
//     originalLastContent.descendants((childNode) => {
//       if (childNode.type.name === 'text') originalContent.push(childNode)
//     })
//     const originalNode = schema.node(
//       block.contentType,
//       block.contentNode.attrs,
//       originalContent,
//     )

//     const newBlock = state.schema.nodes['blockContainer'].createAndFill()!
//     const nextBlockPos = $pos.end() + 2
//     const nextBlockContentPos = nextBlockPos + 2
//     tr = tr.insert(nextBlockPos, newBlock)
//     const $nextBlockPos = state.doc.resolve(nextBlockContentPos)
//     tr = tr.replaceWith(
//       $nextBlockPos.before($nextBlockPos.depth),
//       nextBlockContentPos + 1,
//       node,
//     )
//     tr = tr.replaceWith($pos.before($pos.depth), $pos.end(), originalNode)
//   } else {
//     tr = tr.replaceWith($from.before($from.depth), $from.pos, node)
//   }
//   view.dispatch(tr)
// }

// function insertMentionNode(
//   editor: BlockNoteEditor<HMBlockSchema>,
//   link: string,
//   title: string,
//   node: Node,
// ) {
//   const {state, view} = editor._tiptapEditor
//   const {selection} = state
//   const {$from} = selection
//   let tr = state.tr

//   // If inserted link inline with other text (child count will be more than 1)

//   const $pos = state.doc.resolve($from.pos)
//   let originalStartContent = state.doc.cut($pos.start(), $pos.pos - link.length)

//   view.dispatch(
//     tr
//       .insert($pos.pos, Fragment.fromArray([node, view.state.schema.text(' ')]))
//       .deleteRange($pos.pos - title.length, $pos.pos),
//   )
//   // let originalLastContent = state.doc.cut($pos.pos, $pos.end())
//   // const originalContent: Node[] = []
//   // originalStartContent.descendants((childNode) => {
//   //   if (childNode.type.name === 'text') originalContent.push(childNode)
//   // })
//   // originalLastContent.descendants((childNode) => {
//   //   if (childNode.type.name === 'text') originalContent.push(childNode)
//   // })
//   // const originalNode = schema.node(
//   //   block.contentType,
//   //   block.contentNode.attrs,
//   //   originalContent,
//   // )

//   // const newMention = state.schema.nodes['inline-embed'].create({
//   //   ref
//   // })!

//   // view.dispatch(
//   //   view.state.tr.replaceWith(
//   //     range.from,
//   //     range.to,
//   //     Fragment.fromArray([node, view.state.schema.text(' ')]),
//   //   ),
//   // )

//   // view.dispatch(tr)
// }
