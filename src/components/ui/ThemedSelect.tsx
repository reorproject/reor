/** For tamagui version 1.226, there is a bug on Select, however, we still want to maintain
 * a black or white theme depending on user preferences. */
import React from 'react'
import { Select, SelectProps } from '@mantine/core'
import { MantineStyleProps } from '@/contexts/ThemeContext'

const ThemedSelect: React.FC<SelectProps & { customStyles?: Record<string, React.CSSProperties> }> = ({
  customStyles = {},
  ...restProps
}) => {
  const defaultStyles = MantineStyleProps()
  const mergedStyles = {
    ...defaultStyles, // Apply default styles
    ...Object.keys(customStyles).reduce(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (mergedStyles, key) => {
        mergedStyles[key] = {
          ...defaultStyles[key as keyof typeof defaultStyles],
          ...customStyles[key],
        }
        return mergedStyles
      },
      {} as Record<string, React.CSSProperties>,
    ),
  }

  return <Select zIndex={9999} {...restProps} styles={mergedStyles} />
}

export default ThemedSelect
