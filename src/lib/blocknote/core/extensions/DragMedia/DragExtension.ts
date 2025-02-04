import { toast } from '@shm/ui'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { HMBlockSchema } from '@/components/Editor/schema'
import { BlockNoteEditor } from '../../BlockNoteEditor'
import { getBlockInfoFromPos } from '../Blocks/helpers/getBlockInfoFromPos'

const PLUGIN_KEY = new PluginKey(`drop-plugin`)

export interface DragOptions {
  editor: BlockNoteEditor<HMBlockSchema>
}

export const DragExtension = Extension.create<DragOptions>({
  name: 'drag',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: PLUGIN_KEY,
        props: {
          handleDOMEvents: {
            dragstart: (_, event) => {
              event.preventDefault()
              return false
            },
            dragleave: (_, event) => {
              event.preventDefault()
              return false
            },
            dragend: (_, event) => {
              event.preventDefault()
              return false
            },
            dragover: (_, event) => {
              event.preventDefault()
              return false
            },
            drop: (view, event) => {
              const data = event.dataTransfer

              if (data) {
                console.log(data)
                const files: File[] = []

                if (data.files.length) {
                  for (let i = 0; i < data.files.length; i++) {
                    files.push(data.files[i])
                  }
                } else if (data.items.length) {
                  for (let i = 0; i < data.items.length; i++) {
                    const item = data.items[i].getAsFile()
                    if (item) {
                      files.push(item)
                    }
                  }
                }

                if (files.length > 0) {
                  const pos = this.editor.view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                  })

                  let lastId: string

                  // using reduce so files get inserted sequentially
                  files
                    .reduce((previousPromise, file, index) => {
                      return previousPromise.then(() => {
                        event.preventDefault()
                        event.stopPropagation()

                        if (pos && pos.inside !== -1) {
                          return handleDragMedia(file).then((props) => {
                            if (!props) return false

                            const { state } = view
                            let blockNode
                            const newId = generateBlockId()

                            if (chromiumSupportedImageMimeTypes.has(file.type)) {
                              blockNode = {
                                id: newId,
                                type: 'image',
                                props: {
                                  url: props.url,
                                  name: props.name,
                                },
                              }
                            } else if (chromiumSupportedVideoMimeTypes.has(file.type)) {
                              blockNode = {
                                id: newId,
                                type: 'video',
                                props: {
                                  url: props.url,
                                  name: props.name,
                                },
                              }
                            } else {
                              blockNode = {
                                id: newId,
                                type: 'file',
                                props: {
                                  ...props,
                                },
                              }
                            }

                            const blockInfo = getBlockInfoFromPos(state.doc, pos.pos)

                            if (index === 0) {
                              this.options.editor.insertBlocks(
                                [blockNode],
                                blockInfo.id,
                                blockInfo.node.textContent ? 'after' : 'before',
                              )
                            } else {
                              this.options.editor.insertBlocks([blockNode], lastId, 'after')
                            }

                            lastId = newId
                          })
                        }
                      })
                    }, Promise.resolve())
                    .then(() => true)

                  return true
                }

                return false
              }

              return false
            },
          },
        },
      }),
    ]
  },
})

type FileType = {
  id: string
  props: {
    url: string
    name: string
    size: string
  }
  children: []
  content: []
  type: string
}

async function handleDragMedia(file: File) {
  if (file.size > 62914560) {
    toast.error(`The size of ${file.name} exceeds 60 MB.`)
    return null
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(DAEMON_FILE_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    })
    const data = await response.text()
    return {
      url: data ? `ipfs://${data}` : '',
      name: file.name,
      size: file.size.toString(),
    } as FileType['props']
  } catch (error) {
    console.log(error.message)
    toast.error('Failed to upload file.')
  }
}

function generateBlockId(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

const chromiumSupportedImageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/apng',
  'image/avif',
])

const chromiumSupportedVideoMimeTypes = new Set(['video/mp4', 'video/webm'])
