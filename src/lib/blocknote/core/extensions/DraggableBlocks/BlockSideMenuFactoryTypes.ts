import { BlockNoteEditor } from '../../BlockNoteEditor'
import { Block, BlockSchema } from '../Blocks/api/blockTypes'

export type BlockSideMenuStaticParams<BSchema extends BlockSchema> = {
  editor: BlockNoteEditor<BSchema>

  addBlock: () => void

  blockDragStart: (event: DragEvent) => void
  blockDragEnd: () => void

  freezeMenu: () => void
  unfreezeMenu: () => void

  getReferenceRect: () => DOMRect
}

export type BlockSideMenuDynamicParams<BSchema extends BlockSchema> = {
  block: Block<BSchema>
}

export type BlockSideMenu<BSchema extends BlockSchema> = {
  element: HTMLElement
  render: (params: BlockSideMenuDynamicParams<BSchema>, showElements: boolean) => void
  hide: () => void
}

export type BlockSideMenuFactory<BSchema extends BlockSchema> = {
  create: (params: BlockSideMenuStaticParams<BSchema>) => BlockSideMenu<BSchema>
}
