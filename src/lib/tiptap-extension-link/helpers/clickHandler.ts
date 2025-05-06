import { getAttributes } from '@tiptap/core'
import { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

type ClickHandlerOptions = {
  type: MarkType
  openUrl?: any
  openFile?: any
}

function clickHandler(options: ClickHandlerOptions): Plugin {
  return new Plugin({
    key: new PluginKey('handleClickLink'),
    props: {
      handleClick: (view, pos, event) => {
        if (event.button !== 0) {
          return false
        }
        const attrs = getAttributes(view.state, options.type.name)
        const link = event.target as HTMLLinkElement

        const href = link?.href ?? attrs.href
        if (options.openFile && link && href) { // Linked to a local file, need to open it
          console.log(`in open file`)
          options.openFile(href.replace('reor://', ''))
          return true
        } else {
          if (link && href) {
            const newWindow = false // todo, check for meta key
            console.log(`options.openUrl`, options.openUrl)
            options.openUrl(href, newWindow)
            return true
          }
        }

        return false
      },
    },
  })
}

export default clickHandler
