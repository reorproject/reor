import { styled, XStack } from 'tamagui'

const ResizeHandle = styled(XStack, {
  position: 'absolute',
  width: '8px',
  height: '32px',
  top: 'calc(50% - 16px)',
  zIndex: '$zIndex.5',
  bg: '$color',
  borderColor: '$background',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: '5px',
  cursor: 'ew-resize',
})

export default ResizeHandle
