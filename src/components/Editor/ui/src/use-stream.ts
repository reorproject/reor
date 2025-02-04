import type { StateStream } from '@shm/shared/src/utils/stream'
import { useEffect, useState, useSyncExternalStore } from 'react'

export function useStream<StreamValue>(stream?: StateStream<StreamValue> | undefined): StreamValue | undefined {
  return useSyncExternalStore(
    (onStoreChange) => {
      return stream ? stream.subscribe(onStoreChange) : () => {}
    },
    () => stream?.get(),
  )
}

export function useStreamSelector<StreamValue, InternalValue>(
  stream: StateStream<StreamValue>,
  selector: (value: StreamValue) => InternalValue,
): InternalValue {
  const [state, setState] = useState(selector(stream.get()))
  useEffect(() => {
    return stream.subscribe(() => {
      setState(selector(stream.get()))
    })
  }, [stream, selector])
  return state
}
