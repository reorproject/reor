import { Box, Menu, Text } from '@mantine/core'
import { createStyles } from '@mantine/styles'
import React, { useEffect, useRef } from 'react'

// const MIN_LEFT_MARGIN = 5

export type LinkMenuItemProps = {
  name: string
  icon?: JSX.Element
  // eslint-disable-next-line react/no-unused-prop-types
  hint?: string
  disabled: boolean
  isSelected: boolean
  set: () => void
}

export const LinkMenuItem = (props: LinkMenuItemProps) => {
  const itemRef = useRef<HTMLButtonElement>(null)
  const { classes } = createStyles({ root: {} })(undefined, {
    name: 'SuggestionListItem',
  })

  function isSelected() {
    const isKeyboardSelected = props.isSelected
    // props.selectedIndex !== undefined && props.selectedIndex === props.index;
    const isMouseSelected = itemRef.current?.matches(':hover')

    return isKeyboardSelected || isMouseSelected
  }

  // Updates HTML "data-hovered" attribute which Mantine uses to set mouse hover styles.
  // Allows users to "hover" menu items when navigating using the keyboard.
  function updateSelection() {
    if (isSelected()) {
      itemRef.current?.setAttribute('data-hovered', 'true')
    } else {
      itemRef.current?.removeAttribute('data-hovered')
    }
  }

  useEffect(() => {
    // Updates whether the item is selected with the keyboard (triggered on selectedIndex prop change).
    updateSelection()

    // if (
    //   isSelected() &&
    //   itemRef.current &&
    //   itemRef.current.getBoundingClientRect().left > MIN_LEFT_MARGIN //TODO: Kinda hacky, fix
    //   // This check is needed because initially the menu is initialized somewhere above outside the screen (with left = 1)
    //   // scrollIntoView() is called before the menu is set in the right place, and without the check would scroll to the top of the page every time
    // ) {
    //   itemRef.current.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'nearest',
    //   })
    // }
  })

  return (
    <Menu.Item
      className={classes.root}
      icon={props.icon}
      onClick={props.set}
      disabled={props.disabled}
      closeMenuOnClick={false}
      // Ensures an item selected with both mouse & keyboard doesn't get deselected on mouse leave.
      onMouseLeave={() => {
        setTimeout(() => {
          updateSelection()
        }, 1)
      }}
      ref={itemRef}
      //   rightSection={
      //     props.shortcut && <Badge size={'xs'}>{props.shortcut}</Badge>
      //   }
    >
      {/* <Stack> */}
      {/* Might need separate classes. */}
      <Box w={400}>
        <Text size={14} weight={500} truncate="end">
          {props.name}
        </Text>
      </Box>

      {/* <Text size={10}>{props.hint}</Text>
      </Stack> */}
    </Menu.Item>
  )
}
