/* eslint-disable*/
// THIS FILE IS FORKED FROM TAMAGUI
// https://github.com/tamagui/tamagui/blob/96536c32f09193934725acd39f3046ed527fcd15/code/ui/popover/src/
// Because if we use @tamagui/popper, it fails because Popper.tsx imports from RN (not RNW), and the rewrite is failing. So here we change the imports to RNW.
///////////////////////

import type { UseFloatingOptions } from '@floating-ui/react'
import { safePolygon, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole } from '@floating-ui/react'
import React from 'react'

// Custom floating context to override the Popper on web
export const useFloatingContext = ({ open, setOpen, disable, disableFocus, hoverable }) => {
  return React.useCallback(
    (props: UseFloatingOptions) => {
      const floating = useFloating({
        ...props,
        open,
        onOpenChange: (val, event) => {
          const type =
            event?.type === 'mousemove' || event?.type === 'mouseenter' || event?.type === 'mouseleave'
              ? 'hover'
              : 'press'
          setOpen(val, type)
        },
      }) as any
      const { getReferenceProps, getFloatingProps } = useInteractions([
        hoverable
          ? useHover(floating.context, {
              enabled: !disable && hoverable,
              handleClose: safePolygon({
                requireIntent: true,
                blockPointerEvents: true,
                buffer: 1,
              }),
              ...(hoverable && typeof hoverable === 'object' && hoverable),
            })
          : useHover(floating.context, {
              enabled: false,
            }),
        useFocus(floating.context, {
          enabled: !disable && !disableFocus,
          visibleOnly: true,
        }),
        useRole(floating.context, { role: 'dialog' }),
        useDismiss(floating.context, {
          enabled: !disable,
        }),
      ])
      return {
        ...floating,
        open,
        getReferenceProps,
        getFloatingProps,
      }
    },
    [open, setOpen, disable, disableFocus, hoverable],
  )
}
