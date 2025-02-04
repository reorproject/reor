import { BlockSchema } from '@/editor/blocknote/core'

import { DragHandle } from './DefaultButtons/DragHandle'
import { SideMenu } from './SideMenu'
import { SideMenuProps } from './SideMenuPositioner'

export const DefaultSideMenu = <BSchema extends BlockSchema>(props: SideMenuProps<BSchema>) => (
  <SideMenu>
    {/* <AddBlockButton {...props} /> */}
    <DragHandle {...props} />
  </SideMenu>
)
