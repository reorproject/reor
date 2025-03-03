import { Group } from '@mantine/core'
import { createStyles } from '@mantine/styles'
import React, { forwardRef, HTMLAttributes } from 'react'

const Toolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { classes } = createStyles({ root: {} })(undefined, {
    name: 'Toolbar',
  })

  return (
    <Group className={props.className ? `${classes.root} ${props.className}` : classes.root} ref={ref} {...props}>
      {props.children}
    </Group>
  )
})

export default Toolbar
