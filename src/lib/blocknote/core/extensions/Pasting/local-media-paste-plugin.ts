import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { getBlockInfoFromPos } from '@/lib/utils'

// file was taken from https://github.com/seed-hypermedia/seed/blob/main/frontend/packages/editor/src/handle-local-media-paste-plugin.ts
// with some changes on storing the file

async function uploadMedia(file: File, blockID: string) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to load file.'))
        return
      }
      const imageData = event.target.result as string

      try {
        const storedImageUrl = await window.fileSystem.storeImage(imageData, file.name || 'clipboard.png', blockID)
        resolve(storedImageUrl)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file) // Convert image to base64
  })
}

const handleLocalMediaPastePlugin = new Plugin({
  key: new PluginKey('pm-local-media-paste'),
  props: {
    handlePaste(view, event) {
      console.log(`Pasting!`)
      const currentSelection = view.state.selection
      const items = Array.from(event.clipboardData?.items || [])
      const blockInfo = getBlockInfoFromPos(view.state.doc, view.state.selection.from)!
      const { id } = blockInfo

      if (items.length === 0) return false
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const img = item.getAsFile()
          if (img) {
            // return true
            uploadMedia(img, id)
              .then((data) => {
                const { name } = img
                const { schema } = view.state
                const node = schema.nodes.image.create({
                  url: data,
                  name: name,
                })
                view.dispatch(view.state.tr.insert(currentSelection.anchor - 1, node))
              })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error)
              })
          }
          return true
        }
        if (item.type.indexOf('video') === 0) {
          const vid = item.getAsFile()
          if (vid) {
            // return true
            uploadMedia(vid, id)
              .then((data) => {
                const { name } = vid
                const { schema } = view.state
                const node = schema.nodes.video.create({
                  url: data,
                  name: name,
                })
                view.dispatch(view.state.tr.insert(currentSelection.anchor - 1, node))
              })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error)
              })
          }
          return true
        }
      }
      return false
    },
  },
})

const LocalMediaPastePlugin = Extension.create({
  name: 'local-media-paste',
  addProseMirrorPlugins() {
    return [handleLocalMediaPastePlugin]
  },
})

export default LocalMediaPastePlugin
