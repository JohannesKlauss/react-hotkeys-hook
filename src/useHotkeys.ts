import { HotkeyCallback, Keys, Options, OptionsOrDependencyArray, RefType } from './types'
import { DependencyList, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { parseHotkey, parseKeysHookInput } from './parseHotkeys'
import {
  isHotkeyEnabled,
  isHotkeyEnabledOnTag,
  isHotkeyMatchingKeyboardEvent,
  isKeyboardEventTriggeredByInput,
  isScopeActive,
  maybePreventDefault,
} from './validators'
import { useHotkeysContext } from './HotkeysProvider'
import { useBoundHotkeysProxy } from './BoundHotkeysProxyProvider'
import useDeepEqualMemo from './useDeepEqualMemo'

const stopPropagation = (e: KeyboardEvent): void => {
  e.stopPropagation()
  e.preventDefault()
  e.stopImmediatePropagation()
}

const useSafeLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function useHotkeys<T extends HTMLElement>(
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray,
) {
  const ref = useRef<RefType<T>>(null)
  const { current: pressedDownKeys } = useRef<Set<string>>(new Set())

  const _options: Options | undefined = !(options instanceof Array) ? (options as Options) : !(dependencies instanceof Array) ? (dependencies as Options) : undefined
  const _deps: DependencyList = options instanceof Array ? options : dependencies instanceof Array ? dependencies : []

  const cb = useCallback(callback, [..._deps])
  const memoisedOptions = useDeepEqualMemo(_options)

  const { enabledScopes } = useHotkeysContext()
  const proxy = useBoundHotkeysProxy()

  useSafeLayoutEffect(() => {
    if (memoisedOptions?.enabled === false || !isScopeActive(enabledScopes, memoisedOptions?.scopes)) {
      return
    }

    const listener = (e: KeyboardEvent) => {
      if (isKeyboardEventTriggeredByInput(e) && !isHotkeyEnabledOnTag(e, memoisedOptions?.enableOnFormTags)) {
        return
      }

      // TODO: SINCE THE EVENT IS NOW ATTACHED TO THE REF, THE ACTIVE ELEMENT CAN NEVER BE INSIDE THE REF. THE HOTKEY ONLY TRIGGERS IF THE
      // REF IS THE ACTIVE ELEMENT. THIS IS A PROBLEM SINCE FOCUSED SUB COMPONENTS WONT TRIGGER THE HOTKEY.

      if (ref.current !== null && document.activeElement !== ref.current && !ref.current.contains(document.activeElement)) {
        stopPropagation(e)

        return
      }

      if (((e.target as HTMLElement)?.isContentEditable && !memoisedOptions?.enableOnContentEditable)) {
        return
      }

      parseKeysHookInput(keys, memoisedOptions?.splitKey).forEach((key) => {
        const hotkey = parseHotkey(key, memoisedOptions?.combinationKey)

        if (isHotkeyMatchingKeyboardEvent(e, hotkey, pressedDownKeys) || hotkey.keys?.includes('*')) {
          maybePreventDefault(e, hotkey, memoisedOptions?.preventDefault)

          if (!isHotkeyEnabled(e, hotkey, memoisedOptions?.enabled)) {
            stopPropagation(e)

            return
          }

          cb(e, hotkey)
        }
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      pressedDownKeys.add(event.key.toLowerCase())

      if ((memoisedOptions?.keydown === undefined && memoisedOptions?.keyup !== true) || memoisedOptions?.keydown) {
        listener(event)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'meta') {
        pressedDownKeys.delete(event.key.toLowerCase())
      } else {
        // On macOS pressing down the meta key prevents triggering the keyup event for any other key https://stackoverflow.com/a/57153300/735226.
        pressedDownKeys.clear()
      }

      if (memoisedOptions?.keyup) {
        listener(event)
      }
    }

    // @ts-ignore
    (ref.current || document).addEventListener('keyup', handleKeyUp);
    // @ts-ignore
    (ref.current || document).addEventListener('keydown', handleKeyDown)

    if (proxy) {
      parseKeysHookInput(keys, memoisedOptions?.splitKey).forEach((key) => proxy.addHotkey(parseHotkey(key, memoisedOptions?.combinationKey)))
    }

    return () => {
      // @ts-ignore
      (ref.current || document).removeEventListener('keyup', handleKeyUp);
      // @ts-ignore
      (ref.current || document).removeEventListener('keydown', handleKeyDown)

      if (proxy) {
        parseKeysHookInput(keys, memoisedOptions?.splitKey).forEach((key) => proxy.removeHotkey(parseHotkey(key, memoisedOptions?.combinationKey)))
      }
    }
  }, [keys, cb, memoisedOptions, enabledScopes])

  return ref
}
