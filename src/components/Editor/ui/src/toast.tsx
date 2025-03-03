/* eslint-disable no-console */
import { Button } from '@tamagui/button'
import { styled } from '@tamagui/core'
import { AlertCircle, CheckCircle2 } from '@tamagui/lucide-icons'
import { XStack, YStack } from '@tamagui/stacks'
import { SizableText } from '@tamagui/text'
import React, { ComponentProps, ReactElement, useEffect, useReducer, useRef, useState } from 'react'
import { Spinner } from './spinner'

const DecorationIcon = ({
  Icon,
  color,
}: {
  Icon: typeof CheckCircle2
  color: ComponentProps<typeof CheckCircle2>['color']
}) => {
  return <Icon color={color} />
}

export const SuccessToastDecoration = () => {
  return <DecorationIcon Icon={CheckCircle2} color="$green9" />
}

export const ErrorToastDecoration = () => {
  return <DecorationIcon Icon={AlertCircle} color="$red9" />
}

const ToastXStack = styled(XStack, {
  gap: '$3',
  ai: 'center',
})

const ToastView = ({
  message,
  decoration,
  onMouseEnter,
  onMouseLeave,
  onPress,
  customContent,
}: {
  message: string
  decoration?: 'error' | 'success'
  onMouseEnter: () => void
  onMouseLeave: () => void
  onPress: () => void
  customContent?: ReactElement
}) => {
  const content = customContent || (
    <ToastXStack>
      {/* <AnimatePresence> */}
      {decoration === 'error' ? <ErrorToastDecoration /> : null}
      {decoration === 'success' ? <SuccessToastDecoration /> : null}
      {/* </AnimatePresence> */}
      <SizableText>{message}</SizableText>
    </ToastXStack>
  )
  return (
    <Button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      gap="$2"
      padding="$4"
      unstyled
      height={null}
      paddingHorizontal="$4"
      backgroundColor="$color1"
      borderRadius="$4"
      marginBottom="$4"
      shadowRadius="$2"
      shadowColor="#00000044"
      shadowOffset={{ width: 0, height: 4 }}
      hoverStyle={{ backgroundColor: '$color2' }}
      onPress={onPress}
      enterStyle={{ opacity: 0, scale: 0.7, y: 40 }}
      exitStyle={{ opacity: 0, scale: 1, y: 0 }}
      y={0}
      opacity={1}
      scale={1}
      animation="fast"
    >
      {content}
    </Button>
  )
}

type ToastState = {
  key: string
  message: string
  openTime: number
  duration: number | null
  decoration?: 'error' | 'success'
  onClick?: () => void
  customContent?: ReactElement
}[]

type ToastAction =
  | {
      type: 'AddItem'
      key: string
      message: string
      time: number
      duration: number | null
      decoration?: 'error' | 'success'
      onClick?: () => void
      customContent?: ReactElement
    }
  | {
      type: 'ClearItems'
      keys: string[]
    }
  | {
      type: 'SetItemDuration'
      key: string
      duration: number
      time: number
    }

const initToastState: ToastState = []

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'AddItem':
      return [
        ...state,
        {
          key: action.key,
          message: action.message,
          openTime: action.time,
          duration: action.duration,
          decoration: action.decoration,
          customContent: action.customContent,
          onClick: action.onClick,
        },
      ]
    case 'ClearItems':
      return state.filter((item) => action.keys.indexOf(item.key) === -1)
    case 'SetItemDuration':
      return state.map((item) =>
        item.key === action.key ? { ...item, duration: action.duration, openTime: action.time } : item,
      )
    default:
      return state
  }
}

const fallbackToastHandler = (message: string) => {
  console.error('Toast not initialized')
  console.log(message)
  return { close: () => {} }
}

type ToastOptions = {
  onClick?: () => void
  decoration?: 'error' | 'success'
  customContent?: ReactElement
  duration?: number
  waitForClose?: boolean
}

type ToastHandler = (message?: string, options?: ToastOptions) => { close: () => void }

let handleToast: ToastHandler = fallbackToastHandler
let toastCounter = 0
export const Toaster = () => {
  const hovered = useRef<string | null>(null)
  const hoveredTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const [state, dispatch] = useReducer(toastReducer, initToastState)
  useEffect(() => {
    handleToast = (message: string, opts: ToastOptions = {}) => {
      const key = `${Date.now()}_${toastCounter++}`
      dispatch({
        type: 'AddItem',
        key,
        message,
        time: Date.now(),
        duration: opts.waitForClose ? null : opts.duration || 5000,
        onClick: opts.onClick,
        decoration: opts.decoration,
        customContent: opts.customContent,
      })
      return {
        close: () => {
          dispatch({
            type: 'SetItemDuration',
            key,
            time: Date.now(),
            duration: opts.duration || 5000,
          })
        },
      }
    }
    return () => {
      handleToast = fallbackToastHandler
    }
  }, [])
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const keysToClear = state
        .filter((item) => item.key !== hovered.current && item.duration && item.openTime + item.duration < now)
        .map((item) => item.key)
      if (keysToClear.length)
        dispatch({
          type: 'ClearItems',
          keys: keysToClear,
        })
    }, 1_000)
    return () => {
      clearInterval(interval)
    }
  }, [state])
  return (
    <YStack pointerEvents="box-none" left={0} right={0} bottom={0} position="absolute" zIndex={1_000_000} ai="center">
      {/* <AnimatePresence> */}
      {state.map((item) => (
        <ToastView
          key={item.key}
          message={item.message}
          decoration={item.decoration}
          customContent={item.customContent}
          onPress={() => {
            if (item.onClick) {
              item.onClick()
              return
            }
            dispatch({
              type: 'ClearItems',
              keys: [item.key],
            })
          }}
          onMouseEnter={() => {
            clearTimeout(hoveredTimeout.current)
            hovered.current = item.key
          }}
          onMouseLeave={() => {
            hoveredTimeout.current = setTimeout(() => {
              hovered.current = null
            }, 500)
          }}
        />
      ))}
      {/* </AnimatePresence> */}
    </YStack>
  )
}

export function toast(message: string, opts: ToastOptions = {}) {
  return handleToast(message, { ...opts })
}

toast.error = (message: string, opts: ToastOptions = {}) => {
  return handleToast(message, { ...opts, decoration: 'error' })
}

toast.success = (message: string, opts: ToastOptions = {}) => {
  return handleToast(message, { ...opts, decoration: 'success' })
}

toast.custom = (customContent: ReactElement, opts: ToastOptions = {}) => {
  return handleToast('', { ...opts, customContent })
}
type PromiseToastMessages<V> = {
  error: string | ((err: Error) => string)
  loading: string
  success: string | ((promiseResult: V) => string)
}

type ErrorState = {
  state: 'error'
  error: Error
}
type LoadingState = {
  state: 'loading'
}
type ResolvedState<V> = {
  state: 'resolved'
  value: V
}
const loadingState: LoadingState = { state: 'loading' }
type PromiseToastState<V> = ErrorState | LoadingState | ResolvedState<V>

// eslint-disable-next-line react/function-component-definition
function PromiseToast<V>({ messages, promise }: { messages: PromiseToastMessages<V>; promise: Promise<V> }) {
  const [state, setState] = useState<PromiseToastState<V>>(loadingState)
  useEffect(() => {
    promise
      .then((value) => {
        setState({ state: 'resolved', value })
      })
      .catch((error) => {
        setState({ state: 'error', error })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (state.state === 'loading')
    return (
      <XStack gap="$3" ai="center">
        <Spinner />
        <SizableText>{messages.loading}</SizableText>
      </XStack>
    )
  if (state.state === 'error') {
    let errorText = 'Error'
    if (typeof messages.error === 'string') errorText = messages.error
    if (typeof messages.error === 'function') errorText = messages.error(state.error)
    return (
      <XStack gap="$3" ai="center">
        {/* <AnimatePresence> */}
        <ErrorToastDecoration />
        {/* </AnimatePresence> */}
        <SizableText>{errorText}</SizableText>
      </XStack>
    )
  }
  if (state.state === 'resolved') {
    let successText = 'Success'
    if (typeof messages.success === 'string') successText = messages.success
    if (typeof messages.success === 'function') successText = messages.success(state.value)
    return (
      <XStack gap="$3" ai="center">
        {/* <AnimatePresence> */}
        <SuccessToastDecoration />
        {/* </AnimatePresence> */}
        <SizableText>{successText}</SizableText>
      </XStack>
    )
  }
}

toast.promise = function promiseToast<V>(
  promise: Promise<V>,
  messages: PromiseToastMessages<V>,
  opts: ToastOptions = {},
) {
  handleToast('', {
    ...opts,
    customContent: <PromiseToast promise={promise} messages={messages} />,
  })
  return promise
}
