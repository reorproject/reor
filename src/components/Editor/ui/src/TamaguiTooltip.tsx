/* eslint @typescript-eslint/naming-convention: "off" */

// THIS FILE IS FORKED FROM TAMAGUI
// https://github.com/tamagui/tamagui/blob/master/code/ui/tooltip/src/Tooltip.tsx
// Because if we use @tamagui/popper, it fails because Popper.tsx imports from RN (not RNW), and the rewrite is failing. So here we change the imports to RNW.
//

import '@tamagui/polyfill-dev'

import {
  FloatingDelayGroup,
  useDelayGroup,
  useDelayGroupContext,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import type { ScopedProps, SizeTokens } from '@tamagui/core'
import { useEvent } from '@tamagui/core'
import type { UseFloatingFn } from '@tamagui/floating'
import { FloatingOverrideContext } from '@tamagui/floating'
import { getSize } from '@tamagui/get-token'
import { withStaticProperties } from '@tamagui/helpers'
import { useControllableState } from '@tamagui/use-controllable-state'
// import * as React from 'react'
import React, {
  useContext,
  useEffect,
  useState,
  forwardRef,
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useId,
} from 'react'
import type { PopoverAnchorProps, PopoverArrowProps, PopoverContentProps, PopoverTriggerProps } from './TamaguiPopover'
import { PopoverAnchor, PopoverArrow, PopoverContent, PopoverContext, PopoverTrigger } from './TamaguiPopover'
import type { PopperProps } from './TamaguiPopper'
import { Popper, PopperContentFrame, usePopperContext } from './TamaguiPopper'

const TOOLTIP_SCOPE = 'tooltip'
type ScopedTooltipProps<P> = ScopedProps<P, 'Tooltip'>

const PreventTooltipAnimationContext = createContext(false)
const voidFn = () => {}

const TooltipContent = PopperContentFrame.extractable(
  forwardRef(({ __scopeTooltip, ...props }: ScopedTooltipProps<PopoverContentProps>, ref: any) => {
    const preventAnimation = useContext(PreventTooltipAnimationContext)
    const popper = usePopperContext(__scopeTooltip || TOOLTIP_SCOPE)
    const padding = !props.unstyled
      ? (props.padding ??
        props.size ??
        popper.size ??
        getSize('$true', {
          shift: -2,
        }))
      : undefined

    return (
      <PopoverContent
        __scopePopover={__scopeTooltip || TOOLTIP_SCOPE}
        componentName="Tooltip"
        disableRemoveScroll
        disableFocusScope
        {...(!props.unstyled && {
          padding,
        })}
        ref={ref}
        {...props}
        {...(preventAnimation && {
          animation: null,
        })}
      />
    )
  }),
)

const TooltipArrow = forwardRef((props: ScopedTooltipProps<PopoverArrowProps>, ref: any) => {
  const { __scopeTooltip, ...rest } = props
  return <PopoverArrow __scopePopper={__scopeTooltip || TOOLTIP_SCOPE} componentName="Tooltip" ref={ref} {...rest} />
})

export type TooltipProps = PopperProps & {
  open?: boolean
  unstyled?: boolean
  children?: ReactNode
  onOpenChange?: (open: boolean) => void
  focus?: {
    enabled?: boolean
    visibleOnly?: boolean
  }
  groupId?: string
  restMs?: number
  delay?:
    | number
    | {
        open?: number
        close?: number
      }
  disableAutoCloseOnScroll?: boolean
}

type Delay =
  | number
  | Partial<{
      open: number
      close: number
    }>

export const TooltipGroup = ({
  children,
  delay,
  preventAnimation = false,
  timeoutMs,
}: {
  children?: any
  delay: Delay
  preventAnimation?: boolean
  timeoutMs?: number
}) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableDelay = useMemo(() => delay, [JSON.stringify(delay)])

  return (
    <PreventTooltipAnimationContext.Provider value={preventAnimation}>
      <FloatingDelayGroup timeoutMs={timeoutMs} delay={stableDelay}>
        {children}
      </FloatingDelayGroup>
    </PreventTooltipAnimationContext.Provider>
  )
}

const TooltipComponent = forwardRef(function Tooltip(props: ScopedTooltipProps<TooltipProps>) {
  const {
    children,
    delay: delayProp,
    restMs,
    onOpenChange: onOpenChangeProp,
    focus,
    open: openProp,
    disableAutoCloseOnScroll,
    __scopeTooltip,
    ...restProps
  } = props
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [hasCustomAnchor, setHasCustomAnchor] = useState(false)
  const { delay: delayGroup, setCurrentId } = useDelayGroupContext()
  const delay = delayProp ?? delayGroup
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: false,
    onChange: onOpenChangeProp,
  })
  const id = props.groupId

  const onOpenChange = useEvent((openEvent) => {
    if (openEvent) {
      setCurrentId(id)
    }
    setOpen(openEvent)
  })

  // Auto close when document scroll
  useEffect(() => {
    if (open && disableAutoCloseOnScroll && typeof document !== 'undefined') {
      const openIt = () => {
        setOpen(false)
      }
      document.documentElement.addEventListener('scroll', openIt)
      return () => {
        document.documentElement.removeEventListener('scroll', openIt)
      }
    }
    return undefined
  }, [open, setOpen, disableAutoCloseOnScroll])

  const useFloatingFn: UseFloatingFn = (floatingProps) => {
    // @ts-ignore
    const floating = useFloating({
      ...floatingProps,
      open,
      onOpenChange,
    })
    const { delay: delayContext } = useDelayGroup(floating.context, { id })
    const { getReferenceProps, getFloatingProps } = useInteractions([
      useHover(floating.context, { delay: delay ?? delayContext, restMs }),
      useFocus(floating.context, focus),
      useRole(floating.context, { role: 'tooltip' }),
      useDismiss(floating.context),
    ])
    return {
      ...floating,
      open,
      getReferenceProps,
      getFloatingProps,
    } as any
  }

  const useFloatingContext = useCallback(useFloatingFn, [id, delay, open, restMs, focus, onOpenChange])
  const onCustomAnchorAdd = useCallback(() => setHasCustomAnchor(true), [])
  const onCustomAnchorRemove = useCallback(() => setHasCustomAnchor(false), [])
  const contentId = useId()
  const smallerSize = props.unstyled
    ? null
    : getSize('$true', {
        shift: -2,
        bounds: [0],
      })

  return (
    // TODO: FloatingOverrideContext might also need to be scoped
    <FloatingOverrideContext.Provider value={useFloatingContext}>
      {/* default tooltip to a smaller size */}
      <Popper
        __scopePopper={__scopeTooltip || TOOLTIP_SCOPE}
        size={smallerSize?.key as SizeTokens}
        allowFlip
        stayInFrame
        {...restProps}
      >
        <PopoverContext.Provider
          contentId={contentId}
          triggerRef={triggerRef}
          sheetBreakpoint={false}
          open={open}
          scope={__scopeTooltip || TOOLTIP_SCOPE}
          onOpenChange={setOpen}
          onOpenToggle={voidFn}
          hasCustomAnchor={hasCustomAnchor}
          onCustomAnchorAdd={onCustomAnchorAdd}
          onCustomAnchorRemove={onCustomAnchorRemove}
        >
          {children}
        </PopoverContext.Provider>
      </Popper>
    </FloatingOverrideContext.Provider>
  )
})

const TooltipTrigger = forwardRef(function TooltipTrigger(props: ScopedTooltipProps<PopoverTriggerProps>, ref: any) {
  const { __scopeTooltip, ...rest } = props
  return <PopoverTrigger {...rest} __scopePopover={__scopeTooltip || TOOLTIP_SCOPE} ref={ref} />
})

const TooltipAnchor = forwardRef(function TooltipAnchor(props: ScopedTooltipProps<PopoverAnchorProps>, ref: any) {
  const { __scopeTooltip, ...rest } = props
  return <PopoverAnchor {...rest} __scopePopover={__scopeTooltip || TOOLTIP_SCOPE} ref={ref} />
})

export const Tooltip = withStaticProperties(TooltipComponent, {
  Anchor: TooltipAnchor,
  Arrow: TooltipArrow,
  Content: TooltipContent,
  Trigger: TooltipTrigger,
})
