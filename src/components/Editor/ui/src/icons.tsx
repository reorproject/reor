// /* eslint-disable react/prop-types */
// /* eslint-disable react/destructuring-assignment */
import React from 'react'

export { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'

const DefaultIconColor = '#2C2C2C'

export const Check = ({
  color = DefaultIconColor,
  size = '1em',
  ...props
}: {
  color?: string
  size?: string | number
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width={size} height={size} fill="none" {...props}>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.2}
        d="m16.03 5.682-5.855 7.217c-.538.664-.808.995-1.175 1.016-.367.022-.672-.277-1.284-.873l-2.603-2.54"
      />
    </svg>
  )
}
