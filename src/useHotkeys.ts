import { HotkeyCallback, Keys, OptionsOrDependencyArray, RefType } from './types'
import { useCallback, useLayoutEffect, useRef } from 'react'
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

export default function useHotkeys<T extends HTMLElement>(
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray,
) {
  const ref = useRef<RefType<T>>(null)
  const { current: pressedDownKeys } = useRef<Set<string>>(new Set())

  const _options = !(options instanceof Array) ? options : !(dependencies instanceof Array) ? dependencies : undefined
  const _deps = options instanceof Array ? options : dependencies instanceof Array ? dependencies : []

  const cb = useCallback(callback, [..._deps])
  const ctx = useHotkeysContext()

  const proxy = useBoundHotkeysProxy()

  useLayoutEffect(() => {
    if (_options?.enabled === false || !isScopeActive(ctx.activeScopes, _options?.scopes)) {
      return
    }

    const listener = (e: KeyboardEvent) => {
      if (isKeyboardEventTriggeredByInput(e) && !isHotkeyEnabledOnTag(e, _options?.enableOnFormTags)) {
        return
      }

      if (ref.current !== null && document.activeElement !== ref.current && !ref.current.contains(document.activeElement)) {
        return
      }

      if (((e.target as HTMLElement)?.isContentEditable && !_options?.enableOnContentEditable)) {
        return
      }

      parseKeysHookInput(keys, _options?.splitKey).forEach((key) => {
        const hotkey = parseHotkey(key, _options?.combinationKey)

        if (isHotkeyMatchingKeyboardEvent(e, hotkey, pressedDownKeys) || hotkey.keys?.includes('*')) {
          maybePreventDefault(e, hotkey, _options?.preventDefault)

          if (!isHotkeyEnabled(e, hotkey, _options?.enabled)) {
            return
          }

          cb(e, hotkey)
        }
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      pressedDownKeys.add(event.key.toLowerCase())

      if ((_options?.keydown === undefined && _options?.keyup !== true) || _options?.keydown) {
        listener(event)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedDownKeys.delete(event.key.toLowerCase())

      if (_options?.keyup) {
        listener(event)
      }
    }

    // @ts-ignore
    (ref.current || document).addEventListener('keyup', handleKeyUp);
    // @ts-ignore
    (ref.current || document).addEventListener('keydown', handleKeyDown)

    if (proxy) {
      parseKeysHookInput(keys, _options?.splitKey).forEach((key) => proxy.addHotkey(parseHotkey(key, _options?.combinationKey)))
    }

    return () => {
      // @ts-ignore
      (ref.current || document).removeEventListener('keyup', handleKeyUp);
      // @ts-ignore
      (ref.current || document).removeEventListener('keydown', handleKeyDown)

      if (proxy) {
        parseKeysHookInput(keys, _options?.splitKey).forEach((key) => proxy.removeHotkey(parseHotkey(key, _options?.combinationKey)))
      }
    }
  }, [keys, cb, _options])

  return ref
}
