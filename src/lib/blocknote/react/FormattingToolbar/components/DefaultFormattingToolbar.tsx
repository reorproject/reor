import React from 'react'
import { BlockSchema } from '@/lib/blocknote/core'
import Toolbar from '../../SharedComponents/Toolbar/components/Toolbar'
import ToggledStyleButton from './DefaultButtons/ToggledStyleButton'
import { BlockTypeDropdown, BlockTypeDropdownItem } from './DefaultDropdowns/BlockTypeDropdown'
import { FormattingToolbarProps } from './FormattingToolbarPositioner'

import { NestBlockButton, UnnestBlockButton } from './DefaultButtons/NestBlockButtons'

const DefaultFormattingToolbar = <BSchema extends BlockSchema>(
  props: FormattingToolbarProps<BSchema> & {
    blockTypeDropdownItems?: BlockTypeDropdownItem[]
  },
) => {
  return (
    <Toolbar>
      <BlockTypeDropdown {...props} items={props.blockTypeDropdownItems} />

      <ToggledStyleButton editor={props.editor} toggledStyle="bold" />
      <ToggledStyleButton editor={props.editor} toggledStyle="italic" />
      <ToggledStyleButton editor={props.editor} toggledStyle="underline" />
      <ToggledStyleButton editor={props.editor} toggledStyle="strike" />
      <ToggledStyleButton editor={props.editor} toggledStyle="code" />

      <NestBlockButton editor={props.editor} />
      <UnnestBlockButton editor={props.editor} />
    </Toolbar>
  )
}

export default DefaultFormattingToolbar
