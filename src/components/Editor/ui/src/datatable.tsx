import { styled, View, XStack } from 'tamagui'

const Root = styled(View, {
  tag: 'table',
  display: 'table',
  userSelect: 'none',
  // tableLayout: "fixed",
  width: '100%',
})

const THead = styled(View, {
  tag: 'thead',
  display: 'table-header-group',
  borderBottomWidth: 10,
})

const TBody = styled(View, {
  tag: 'tbody',
  display: 'table-row-group',
})

const TFoot = styled(View, {
  tag: 'tfoot',
  display: 'table-footer-group',
})

const Row = styled(XStack, {
  tag: 'tr',
  display: 'table-row',

  hoverStyle: {
    bg: '$color5',
  },
})

const Cell = styled(View, {
  tag: 'td',
  display: 'table-cell',
  hoverStyle: {
    bg: '$color6',
  },
})

const HCell = styled(View, {
  display: 'table-cell',
  tag: 'td',
  // textAlign: "left !important",
  hoverStyle: {
    bg: '$color6',
  },
})

export const DataTable = {
  Root,
  Body: TBody,
  Head: THead,
  HeaderCell: ({ children, noPadding = false, colSpan = 1, ...props }) => (
    <HCell colSpan={colSpan} {...props}>
      <XStack paddingVertical={noPadding ? 0 : colSpan > 1 ? '$1' : '$2'} paddingHorizontal="$4">
        {children}
      </XStack>
    </HCell>
  ),
  Footer: TFoot,
  Row,
  Cell: ({ children, noPadding = false, colSpan = 1, ...props }) => (
    <Cell colSpan={colSpan} {...props}>
      <XStack paddingVertical={noPadding ? 0 : colSpan > 1 ? '$1' : '$2'} paddingHorizontal="$4">
        {children}
      </XStack>
    </Cell>
  ),
}
