/* eslint-disable max-classes-per-file */
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BlockNoteEditor } from '../../BlockNoteEditor'
import { BaseUiElementState } from '../../shared/BaseUiElementTypes'
import EventEmitter from '../../shared/EventEmitter'
import { BlockSchema } from '../Blocks/api/blockTypes'
import findBlock from '../Blocks/helpers/findBlock'
import { LinkMenuItem } from './LinkMenuItem'

export const linkMenuPluginKey = new PluginKey('LinkMenuPlugin')

export type LinkMenuState<LinkMenuItem> = BaseUiElementState & {
  // The items to display.
  items: LinkMenuItem[]
  // Pasted URL
  link: string
  // The index of the suggested item that's currently hovered by the keyboard.
  keyboardHoveredItemIndex: number
}

type LinkPluginState<LinkMenuItem> = {
  // True when the menu is shown, false when hidden.
  active: boolean
  // Pasted URL
  link: string
  // The items that should be shown in the menu.
  items: LinkMenuItem[]
  // The index of the item in the menu that's currently hovered using the keyboard.
  keyboardHoveredItemIndex: number | undefined
  decorationId: string | undefined
}

function getDefaultPluginState<LinkMenuItem>(): LinkPluginState<LinkMenuItem> {
  return {
    active: false,
    link: '',
    items: [] as LinkMenuItem[],
    keyboardHoveredItemIndex: undefined,
    decorationId: undefined,
  }
}

export class LinkMenuView<LinkMenuItem, BSchema extends BlockSchema> {
  private linkMenuState?: LinkMenuState<LinkMenuItem>

  public updateLinkMenu: () => void

  pluginState: LinkPluginState<LinkMenuItem>

  constructor(
    private readonly editor: BlockNoteEditor<BSchema>,
    private readonly pluginKey: PluginKey,
    // private readonly pmView: EditorView,
    updateLinkMenu: (linkMenuState: LinkMenuState<LinkMenuItem>) => void = () => {
      // noop
    },
  ) {
    this.pluginState = getDefaultPluginState<LinkMenuItem>()

    this.updateLinkMenu = () => {
      if (!this.linkMenuState) {
        throw new Error('Attempting to update uninitialized Link menu')
      }

      updateLinkMenu(this.linkMenuState)
    }

    document.addEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    if (this.linkMenuState?.show) {
      const decorationNode = document.querySelector(`[data-decoration-id="${this.pluginState.decorationId}"]`)
      this.linkMenuState.referencePos = decorationNode!.getBoundingClientRect()
      this.updateLinkMenu()
    }
  }

  update(view: EditorView, prevState: EditorState) {
    const prev = this.pluginKey.getState(prevState)
    const next = this.pluginKey.getState(view.state)

    // See how the state changed
    const started = !prev.active && next.active
    const stopped = prev.active && !next.active
    // TODO: Currently also true for cases in which an update isn't needed so selected list item index updates still
    // cause the view to update. May need to be more strict.
    const changed = prev.active && next.active

    // Cancel when link isn't active
    if (!started && !changed && !stopped) {
      return
    }

    this.pluginState = stopped ? prev : next

    if (stopped || !this.editor.isEditable) {
      this.linkMenuState!.show = false
      this.updateLinkMenu()

      return
    }

    const decorationNode = document.querySelector(`[data-decoration-id="${this.pluginState.decorationId}"]`)

    if (this.editor.isEditable) {
      this.linkMenuState = {
        show: true,
        link: this.pluginState.link,
        referencePos: decorationNode!.getBoundingClientRect(),
        items: this.pluginState.items,
        keyboardHoveredItemIndex: this.pluginState.keyboardHoveredItemIndex!,
      }

      this.updateLinkMenu()
    }
  }

  destroy() {
    document.removeEventListener('scroll', this.handleScroll)
  }
}

export const setupLinkMenu = <MenuItem extends LinkMenuItem<BSchema>, BSchema extends BlockSchema>(
  editor: BlockNoteEditor<BSchema>,
  updateLinkMenu: (linkMenuState: LinkMenuState<MenuItem>) => void,

  pluginKey: PluginKey,
) => {
  let linkPluginView: LinkMenuView<MenuItem, BSchema>

  const deactivate = (view: EditorView) => {
    view.dispatch(view.state.tr.setMeta(pluginKey, { deactivate: true }))
  }

  return {
    plugin: new Plugin({
      key: pluginKey,

      view: () => {
        linkPluginView = new LinkMenuView<MenuItem, BSchema>(
          editor,
          pluginKey,

          updateLinkMenu,
        )
        return linkPluginView
      },

      state: {
        // Initialize the plugin's internal state.
        init(): LinkPluginState<MenuItem> {
          return getDefaultPluginState<MenuItem>()
        },

        // Apply changes to the plugin state from an editor transaction.
        apply(transaction, prev, oldState, newState): LinkPluginState<MenuItem> {
          // TODO: More clearly define which transactions should be ignored.
          if (transaction.getMeta('orderedListIndexing') !== undefined) {
            return prev
          }

          const items = transaction.getMeta(pluginKey)?.items
          const link = transaction.getMeta(pluginKey)?.link

          // Checks if the menu should be shown.
          if (transaction.getMeta(pluginKey)?.activate) {
            return {
              active: true,
              link: link,
              items: items,
              keyboardHoveredItemIndex: 0,
              decorationId: `id_${Math.floor(Math.random() * 0xffffffff)}`,
            }
          }

          // Checks if the menu is hidden, in which case it doesn't need to be hidden or updated.
          if (!prev.active) {
            return prev
          }

          const next = { ...prev }
          if (items) next.items = items
          if (link) next.link = link

          // Hides the menu
          if (
            // Highlighting text should hide the menu.
            newState.selection.from !== newState.selection.to ||
            // Transactions with plugin metadata {deactivate: true} should hide the menu.
            transaction.getMeta(pluginKey)?.deactivate ||
            // Certain mouse events should hide the menu.
            // TODO: Change to global mousedown listener.
            transaction.getMeta('focus') ||
            transaction.getMeta('blur') ||
            transaction.getMeta('pointer')
          ) {
            return getDefaultPluginState<MenuItem>()
          }

          // Updates keyboardHoveredItemIndex if the up or down arrow key was
          // pressed, or resets it if the keyboard cursor moved.
          if (transaction.getMeta(pluginKey)?.selectedItemIndexChanged !== undefined) {
            let newIndex = transaction.getMeta(pluginKey).selectedItemIndexChanged

            // Allows selection to jump between first and last items.
            if (newIndex < 0) {
              newIndex = prev.items.length - 1
            } else if (newIndex >= prev.items.length) {
              newIndex = 0
            }

            next.keyboardHoveredItemIndex = newIndex
          } else if (oldState.selection.from !== newState.selection.from) {
            next.keyboardHoveredItemIndex = 0
          }

          return next
        },
      },

      props: {
        handleKeyDown(view, event) {
          const menuIsActive = (this as Plugin).getState(view.state).active
          const link = (this as Plugin).getState(view.state).link

          // Doesn't handle other keystrokes if the menu isn't active.
          if (!menuIsActive) {
            return false
          }

          // Handles keystrokes for navigating the menu.
          const { items, keyboardHoveredItemIndex } = pluginKey.getState(view.state)

          // Moves the keyboard selection to the previous item.
          if (event.key === 'ArrowUp') {
            view.dispatch(
              view.state.tr.setMeta(pluginKey, {
                selectedItemIndexChanged: keyboardHoveredItemIndex - 1,
              }),
            )
          }

          // Moves the keyboard selection to the next item.
          if (event.key === 'ArrowDown') {
            view.dispatch(
              view.state.tr.setMeta(pluginKey, {
                selectedItemIndexChanged: keyboardHoveredItemIndex + 1,
              }),
            )
          }

          // Selects an item and closes the menu.
          if (event.key === 'Enter') {
            deactivate(view)
            editor._tiptapEditor.chain().focus().run()
            items[keyboardHoveredItemIndex].execute(editor, link)
          }

          // Closes the menu.
          if (event.key === 'Escape') {
            deactivate(view)
          }

          if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            deactivate(view)
            return false
          }

          return true
        },

        // Setup decorator on the currently active item (link).
        decorations(state) {
          const { active, decorationId } = (this as Plugin).getState(state)

          if (!active) {
            return null
          }

          const blockNode = findBlock(state.selection)
          if (blockNode) {
            return DecorationSet.create(state.doc, [
              Decoration.node(blockNode.pos, blockNode.pos + blockNode.node.nodeSize, {
                nodeName: 'span',
                class: 'link-dropdown-decorator',
                'data-decoration-id': decorationId,
                'data-decoration-type': 'link-dropdown',
              }),
            ])
          }
          return undefined
        },
      },
    }),
    itemCallback: (item: LinkMenuItem<BSchema>, link: string) => {
      deactivate(editor._tiptapEditor.view)
      editor._tiptapEditor.chain().focus().run()

      item.execute(editor, link)
    },
  }
}

export class LinkMenuProsemirrorPlugin<
  BSchema extends BlockSchema,
  MenuItem extends LinkMenuItem<BSchema>,
> extends EventEmitter<any> {
  // private linkMenuView: LinkMenuView<BSchema> | undefined
  public readonly plugin: Plugin

  public readonly itemCallback: (item: MenuItem, link: string) => void

  constructor(editor: BlockNoteEditor<BSchema>) {
    super()
    const links = setupLinkMenu<MenuItem, BSchema>(
      editor,
      (state) => {
        this.emit('update', state)
      },
      linkMenuPluginKey,
    )
    this.plugin = links.plugin
    this.itemCallback = links.itemCallback
  }

  public onUpdate(callback: (state: LinkMenuState<BSchema>) => void) {
    return this.on('update', callback)
  }
}
