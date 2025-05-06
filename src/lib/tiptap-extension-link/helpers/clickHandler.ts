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
        if (!href) return

        if (href.startsWith('reor://')) {
          const path = href.replace('reor://', '')
          console.log('Clicking link', href)
          console.log(`Path: ${path}`)
          options.openFile(path)
          return true
        } else if (/^https?:\/\//.test(href)) {
          window.open(href, '_blank', 'noopener,noreferrer')
          return true
        }

        return false
      },
    },
  })
}

export default clickHandler
