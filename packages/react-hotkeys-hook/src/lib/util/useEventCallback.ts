import { useCallback, useRef } from 'react'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

// See RFC in https://github.com/reactjs/rfcs/pull/220

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useEventCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback)

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: Parameters<T>) => callbackRef.current(...args), []) as T
}
