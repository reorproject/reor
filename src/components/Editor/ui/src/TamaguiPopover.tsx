/* eslint @typescript-eslint/naming-convention: "off" */
/* eslint react/destructuring-assignment: "off" */

// THIS FILE IS FORKED FROM TAMAGUI
// https://github.com/tamagui/tamagui/blob/96536c32f09193934725acd39f3046ed527fcd15/code/ui/popover/src/Popover.tsx
// Because if we use @tamagui/popper, it fails because Popper.tsx imports from RN (not RNW), and the rewrite is failing. So here we change the imports to RNW.

import '@tamagui/polyfill-dev'

import type { UseHoverProps } from '@floating-ui/react'
import { Animate } from '@tamagui/animate'
import { ResetPresence } from '@tamagui/animate-presence'
import { hideOthers } from '@tamagui/aria-hidden'
import { useComposedRefs } from '@tamagui/compose-refs'
import { isWeb } from '@tamagui/constants'
import type { MediaQueryKey, ScopedProps, SizeTokens, StackProps, TamaguiElement } from '@tamagui/core'
import { Stack, Theme, View, createStyledContext, useMedia, useThemeName } from '@tamagui/core'
import type { DismissableProps, PointerDownOutsideEvent } from '@tamagui/dismissable'
import type { FocusScopeProps } from '@tamagui/focus-scope'
import { FocusScope } from '@tamagui/focus-scope'
import { composeEventHandlers } from '@tamagui/helpers'
import { Portal, PortalItem } from '@tamagui/portal'
import type { RemoveScrollProps } from '@tamagui/remove-scroll'
import { RemoveScroll } from '@tamagui/remove-scroll'
import type { YStackProps } from '@tamagui/stacks'
import { YStack } from '@tamagui/stacks'
import React, { FocusEvent } from 'react'
import { Platform, ScrollView } from 'react-native'
import type { PopperArrowExtraProps, PopperArrowProps, PopperContentProps, PopperProps } from './TamaguiPopper'
import {
  PopperAnchor,
  PopperArrow,
  PopperContent,
  PopperContentFrame,
  PopperContext,
  usePopperContext,
} from './TamaguiPopper'

// adapted from radix-ui popover

export type PopoverProps = PopperProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, via?: 'hover' | 'press') => void
  keepChildrenMounted?: boolean

  /**
   * Enable staying open while mouseover
   */
  hoverable?: boolean | UseHoverProps

  /**
   * Disable focusing behavior on open
   */
  disableFocus?: boolean
}

type ScopedPopoverProps<P> = ScopedProps<P, 'Popover'>

type PopoverContextValue = {
  id: string
  triggerRef: React.RefObject<any>
  contentId?: string
  open: boolean
  onOpenChange(open: boolean, via: 'hover' | 'press'): void
  onOpenToggle(): void
  hasCustomAnchor: boolean
  onCustomAnchorAdd(): void
  onCustomAnchorRemove(): void
  size?: SizeTokens
  sheetBreakpoint: any
  breakpointActive?: boolean
  keepChildrenMounted?: boolean
  anchorTo?: Rect
}

const POPOVER_SCOPE = 'PopoverScope'

export const PopoverContext = createStyledContext<PopoverContextValue>({} as any)

export const usePopoverContext = PopoverContext.useStyledContext

const dspContentsStyle = {
  display: 'contents',
}
/* -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
  return open ? 'open' : 'closed'
}

const PopoverRepropagateContext = (props: { children: any; context: any; popperContext: any; scope: string }) => {
  return (
    <PopperContext.Provider scope={props.scope} {...props.popperContext}>
      <PopoverContext.Provider {...props.context}>{props.children}</PopoverContext.Provider>
    </PopperContext.Provider>
  )
}

const PopoverContentPortal = (props: ScopedPopoverProps<PopoverContentTypeProps>) => {
  const { __scopePopover } = props
  const zIndex = props.zIndex ?? 150_000
  const context = usePopoverContext(__scopePopover)
  const popperContext = usePopperContext(__scopePopover || POPOVER_SCOPE)
  const themeName = useThemeName()

  let contents = props.children

  // native doesnt support portals
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    contents = (
      <PopoverRepropagateContext
        scope={__scopePopover || POPOVER_SCOPE}
        popperContext={popperContext}
        context={context}
      >
        {props.children}
      </PopoverRepropagateContext>
    )
  }

  // Portal the contents and add a transparent bg overlay to handle dismiss on native
  return (
    <Portal zIndex={zIndex}>
      {/* forceClassName avoids forced re-mount renders for some reason... see the HeadMenu as you change tints a few times */}
      {/* without this you'll see the site menu re-rendering. It must be something in wrapping children in Theme */}
      <Theme forceClassName name={themeName}>
        {!!context.open && !context.breakpointActive && (
          <YStack fullscreen onPress={composeEventHandlers(props.onPress as any, context.onOpenToggle)} />
        )}
        {contents}
      </Theme>
    </Portal>
  )
}

/* -------------------------------------------------------------------------------------------------
 * PopoverSheet
 * -----------------------------------------------------------------------------------------------*/

const useSheetBreakpointActive = (breakpoint?: MediaQueryKey | null | boolean) => {
  const media = useMedia()
  if (typeof breakpoint === 'boolean' || !breakpoint) {
    return !!breakpoint
  }
  return media[breakpoint]
}

/* -------------------------------------------------------------------------------------------------
 * PopoverAnchor
 * -----------------------------------------------------------------------------------------------*/

export type PopoverAnchorProps = YStackProps

export const PopoverAnchor = React.forwardRef<TamaguiElement, ScopedPopoverProps<PopoverAnchorProps>>(
  function PopoverAnchor(props: ScopedPopoverProps<PopoverAnchorProps>, forwardedRef) {
    const { __scopePopover, ...rest } = props
    const context = usePopoverContext(__scopePopover)
    const { onCustomAnchorAdd, onCustomAnchorRemove } = context || {}

    React.useEffect(() => {
      onCustomAnchorAdd()
      return () => onCustomAnchorRemove()
    }, [onCustomAnchorAdd, onCustomAnchorRemove])

    return (
      <PopperAnchor __scopePopper={__scopePopover || POPOVER_SCOPE} {...rest} ref={forwardedRef as React.Ref<any>} />
    )
  },
)

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/

export type PopoverTriggerProps = StackProps

export const PopoverTrigger = React.forwardRef<TamaguiElement, ScopedPopoverProps<PopoverTriggerProps>>(
  function PopoverTrigger(props: ScopedPopoverProps<PopoverTriggerProps>, forwardedRef) {
    const { __scopePopover, ...rest } = props
    const context = usePopoverContext(__scopePopover)
    const { anchorTo } = context

    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef)

    if (!props.children) return null

    const trigger = (
      <View
        aria-haspopup="dialog"
        aria-expanded={context.open}
        // TODO not matching
        // aria-controls={context.contentId}
        data-state={getState(context.open)}
        {...rest}
        // @ts-ignore
        ref={composedTriggerRef}
        onPress={composeEventHandlers(props.onPress as any, context.onOpenToggle)}
      />
    )

    if (anchorTo) {
      const virtualRef = {
        current: {
          getBoundingClientRect: () => (isWeb ? DOMRect.fromRect(anchorTo) : anchorTo),
          ...(!isWeb && {
            measure: (c: any) => c(anchorTo?.x, anchorTo?.y, anchorTo?.width, anchorTo?.height),
            measureInWindow: (c: any) => c(anchorTo?.x, anchorTo?.y, anchorTo?.width, anchorTo?.height),
          }),
        },
      }
      return (
        <PopperAnchor virtualRef={virtualRef} __scopePopper={__scopePopover || POPOVER_SCOPE}>
          {trigger}
        </PopperAnchor>
      )
    }

    return context.hasCustomAnchor ? (
      trigger
    ) : (
      <PopperAnchor __scopePopper={__scopePopover || POPOVER_SCOPE} asChild>
        {trigger}
      </PopperAnchor>
    )
  },
)

const PopoverContentImpl = React.forwardRef<PopoverContentImplElement, ScopedPopoverProps<PopoverContentImplProps>>(
  function PopoverContentImpl(props: ScopedPopoverProps<PopoverContentImplProps>, forwardedRef) {
    const {
      trapFocus,
      __scopePopover,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      disableFocusScope,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      children,
      disableRemoveScroll,
      freezeContentsWhenHidden,
      setIsFullyHidden,
      ...contentProps
    } = props

    const context = usePopoverContext(__scopePopover)
    const { open, keepChildrenMounted } = context
    const popperContext = usePopperContext(__scopePopover || POPOVER_SCOPE)

    const handleExitComplete = React.useCallback(() => {
      setIsFullyHidden?.(true)
    }, [setIsFullyHidden])

    if (context.breakpointActive) {
      // unwrap the PopoverScrollView if used, as it will use the SheetScrollView if that exists
      // TODO this should be disabled through context
      const childrenWithoutScrollView = React.Children.toArray(children).map((child) => {
        if (React.isValidElement(child)) {
          if (child.type === ScrollView) {
            return child.props.children
          }
        }
        return child
      })

      let content = <ResetPresence>{childrenWithoutScrollView}</ResetPresence>

      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        content = (
          <PopperContext.Provider scope={__scopePopover || POPOVER_SCOPE} {...popperContext}>
            {childrenWithoutScrollView}
          </PopperContext.Provider>
        )
      }

      // doesn't show as popover yet on native, must use as sheet
      return <PortalItem hostName={`${context.id}PopoverContents`}>{content}</PortalItem>
    }

    // const handleDismiss = React.useCallback((event: GestureResponderEvent) =>{
    //   context.onOpenChange(false);
    // }, [])
    // <Dismissable
    //     disableOutsidePointerEvents={disableOutsidePointerEvents}
    //     // onInteractOutside={onInteractOutside}
    //     onEscapeKeyDown={onEscapeKeyDown}
    //     // onPointerDownOutside={onPointerDownOutside}
    //     // onFocusOutside={onFocusOutside}
    //     onDismiss={handleDismiss}
    //   >

    // const freeze = Boolean(isFullyHidden && freezeContentsWhenHidden)

    return (
      <Animate
        type="presence"
        present={Boolean(open)}
        keepChildrenMounted={keepChildrenMounted}
        onExitComplete={handleExitComplete}
      >
        <PopperContent
          __scopePopper={__scopePopover || POPOVER_SCOPE}
          key={context.contentId}
          data-state={getState(open)}
          id={context.contentId}
          ref={forwardedRef}
          {...contentProps}
        >
          <RemoveScroll
            enabled={disableRemoveScroll ? false : open}
            allowPinchZoom
            // causes lots of bugs on touch web on site
            removeScrollBar={false}
            style={dspContentsStyle}
          >
            <ResetPresence>
              <FocusScope
                loop
                enabled={disableFocusScope ? false : open}
                trapped={trapFocus}
                onMountAutoFocus={onOpenAutoFocus}
                onUnmountAutoFocus={onCloseAutoFocus}
              >
                {isWeb ? <div style={dspContentsStyle}>{children}</div> : children}
              </FocusScope>
            </ResetPresence>
          </RemoveScroll>
        </PopperContent>
      </Animate>
    )
  },
)

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

export type PopoverContentProps = PopoverContentTypeProps

type PopoverContentTypeElement = PopoverContentImplElement

export interface PopoverContentTypeProps extends Omit<PopoverContentImplProps, 'disableOutsidePointerEvents'> {
  /**
   * @see https://github.com/theKashey/react-remove-scroll#usage
   */
  allowPinchZoom?: RemoveScrollProps['allowPinchZoom']
  /** enable animation for content position changing */
  enableAnimationForPositionChange?: boolean
}

export const PopoverContent = PopperContentFrame.extractable(
  React.forwardRef<PopoverContentTypeElement, ScopedPopoverProps<PopoverContentTypeProps>>(function PopoverContent(
    props: ScopedPopoverProps<PopoverContentTypeProps>,
    forwardedRef,
  ) {
    const { allowPinchZoom, trapFocus, disableRemoveScroll = true, zIndex, __scopePopover, ...contentImplProps } = props
    const context = usePopoverContext(__scopePopover)
    const contentRef = React.useRef<any>(null)
    const composedRefs = useComposedRefs(forwardedRef, contentRef)
    const isRightClickOutsideRef = React.useRef(false)
    const [isFullyHidden, setIsFullyHidden] = React.useState(!context.open)

    if (context.open && isFullyHidden) {
      setIsFullyHidden(false)
    }

    // aria-hide everything except the content (better supported equivalent to setting aria-modal)
    React.useEffect(() => {
      if (!context.open) return
      const content = contentRef.current
      // eslint-disable-next-line consistent-return
      if (content) return hideOthers(content)
    }, [context.open])

    if (!context.keepChildrenMounted) {
      if (isFullyHidden) {
        return null
      }
    }

    return (
      <PopoverContentPortal __scopePopover={__scopePopover} zIndex={props.zIndex}>
        <Stack pointerEvents={context.open ? 'auto' : 'none'}>
          <PopoverContentImpl
            {...contentImplProps}
            disableRemoveScroll={disableRemoveScroll}
            ref={composedRefs}
            setIsFullyHidden={setIsFullyHidden}
            __scopePopover={__scopePopover}
            trapFocus={trapFocus ?? context.open}
            disableOutsidePointerEvents
            // @ts-expect-error
            onCloseAutoFocus={composeEventHandlers(props.onCloseAutoFocus, (event: FocusEvent) => {
              event.preventDefault()
              if (!isRightClickOutsideRef.current) context.triggerRef.current?.focus()
            })}
            onPointerDownOutside={composeEventHandlers(
              props.onPointerDownOutside,
              (event: PointerDownOutsideEvent) => {
                const { originalEvent } = event.detail
                const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true
                const isRightClick = originalEvent.button === 2 || ctrlLeftClick
                isRightClickOutsideRef.current = isRightClick
              },
              { checkDefaultPrevented: false },
            )}
            // When focus is trapped, a `focusout` event may still happen.
            // We make sure we don't trigger our `onDismiss` in such case.
            // @ts-expect-error
            onFocusOutside={composeEventHandlers(props.onFocusOutside, (event: FocusEvent) => event.preventDefault(), {
              checkDefaultPrevented: false,
            })}
          />
        </Stack>
      </PopoverContentPortal>
    )
  }),
)

/* -----------------------------------------------------------------------------------------------*/

type PopoverContentImplElement = React.ElementRef<typeof PopperContent>

export interface PopoverContentImplProps
  extends PopperContentProps,
    Omit<DismissableProps, 'onDismiss' | 'children' | 'onPointerDownCapture'> {
  /**
   * Whether focus should be trapped within the `Popover`
   * @default false
   */
  trapFocus?: FocusScopeProps['trapped']

  /**
   * Whether popover should not focus contents on open
   * @default false
   */
  disableFocusScope?: boolean

  /**
   * Event handler called when auto-focusing on open.
   * Can be prevented.
   */
  onOpenAutoFocus?: FocusScopeProps['onMountAutoFocus']

  /**
   * Event handler called when auto-focusing on close.
   * Can be prevented.
   */
  onCloseAutoFocus?: FocusScopeProps['onUnmountAutoFocus']

  disableRemoveScroll?: boolean

  freezeContentsWhenHidden?: boolean

  setIsFullyHidden?: React.Dispatch<React.SetStateAction<boolean>>
}

/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

export type PopoverCloseProps = YStackProps

export const PopoverClose = React.forwardRef<TamaguiElement, ScopedPopoverProps<PopoverCloseProps>>(
  function PopoverClose(props: ScopedPopoverProps<PopoverCloseProps>, forwardedRef) {
    const { __scopePopover, ...rest } = props
    const context = usePopoverContext(__scopePopover)
    return (
      <YStack
        {...rest}
        ref={forwardedRef}
        componentName="PopoverClose"
        onPress={composeEventHandlers(props.onPress as any, () => context.onOpenChange(false, 'press'))}
      />
    )
  },
)

/* -------------------------------------------------------------------------------------------------
 * PopoverArrow
 * -----------------------------------------------------------------------------------------------*/

export type PopoverArrowProps = PopperArrowProps

export const PopoverArrow = PopperArrow.styleable<PopperArrowExtraProps>(function PopoverArrow(
  props: ScopedPopoverProps<PopoverArrowProps>,
  forwardedRef,
) {
  const { __scopePopover, ...rest } = props
  const context = usePopoverContext(__scopePopover)
  const sheetActive = useSheetBreakpointActive(context.sheetBreakpoint)
  if (sheetActive) {
    return null
  }
  return (
    <PopperArrow
      __scopePopper={__scopePopover || POPOVER_SCOPE}
      componentName="PopoverArrow"
      {...rest}
      ref={forwardedRef}
    />
  )
})

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type PopoverType = {
  anchorTo: (rect: Rect) => void
  toggle: () => void
  open: () => void
  close: () => void
  setOpen: (open: boolean) => void
}
