// import {HMBlockSchema} from '@/editor/schema'
import { BlockNoteEditor } from '../../BlockNoteEditor'
// import {BlockSchema} from '../Blocks/api/blockTypes'
import { BlockSchema } from '../Blocks/api/blockTypes'
import { DefaultBlockSchema } from '../Blocks/api/defaultBlocks'

export type LinkMenuItem<BSchema extends BlockSchema = DefaultBlockSchema> = {
  name: string
  icon?: JSX.Element
  hint?: string
  disabled: boolean
  execute: (editor: BlockNoteEditor<BSchema>, ref: string) => void
}
