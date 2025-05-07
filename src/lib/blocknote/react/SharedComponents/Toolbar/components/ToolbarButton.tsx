import { ActionIcon, Button } from '@mantine/core'
import Tippy from '@tippyjs/react'
import React, { ForwardedRef, MouseEvent, forwardRef } from 'react'
import { IconType } from 'react-icons'
import TooltipContent from '../../Tooltip/components/TooltipContent'

export type ToolbarButtonProps = {
  onClick?: (e: MouseEvent) => void
  icon?: IconType
  mainTooltip: string
  secondaryTooltip?: string
  isSelected?: boolean
  children?: any
  isDisabled?: boolean
  hint?: string
}

/**
 * Helper for basic buttons that show in the formatting toolbar.
 */
// eslint-disable-next-line react/display-name
export const ToolbarButton = forwardRef((props: ToolbarButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const ButtonIcon = props.icon
  const hasChildrenOrHint = props.children || props.hint
  return (
    <Tippy
      content={<TooltipContent mainTooltip={props.mainTooltip} secondaryTooltip={props.secondaryTooltip} />}
      trigger="mouseenter"
    >
      {hasChildrenOrHint ? (
        <Button
          onClick={props.onClick}
          data-selected={props.isSelected ? 'true' : undefined}
          data-test={props.mainTooltip.slice(0, 1).toLowerCase() + props.mainTooltip.replace(/\s+/g, '').slice(1)}
          size="xs"
          disabled={props.isDisabled || false}
          ref={ref}
          fullWidth
        >
          {/* Space between icon and text */}
          <span
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            {(props.children || props.hint) && <span>{props.children ?? props.hint}</span>}
            {ButtonIcon && <ButtonIcon />}
          </span>
        </Button>
      ) : (
        <ActionIcon
          onClick={props.onClick}
          data-selected={props.isSelected ? 'true' : undefined}
          data-test={props.mainTooltip.slice(0, 1).toLowerCase() + props.mainTooltip.replace(/\s+/g, '').slice(1)}
          size={30}
          disabled={props.isDisabled || false}
          ref={ref}
        >
          {ButtonIcon && <ButtonIcon />}
        </ActionIcon>
      )}
    </Tippy>
  )
})
