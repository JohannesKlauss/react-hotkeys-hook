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

export default function useHotkeys<T extends HTMLElement>(
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) {
  const ref = useRef<RefType<T>>(null)
  const { current: pressedDownKeys } = useRef<Set<string>>(new Set())

  const _options = !(options instanceof Array) ? options : !(dependencies instanceof Array) ? dependencies : undefined
  const _deps = options instanceof Array ? options : dependencies instanceof Array ? dependencies : []

  const cb = useCallback(callback, [..._deps])
  const ctx = useHotkeysContext()

  useLayoutEffect(() => {
    if (_options?.enabled === false || !isScopeActive(ctx.activeScopes, _options?.scopes)) {
      return
    }

    const listener = (e: KeyboardEvent) => {
      if (isKeyboardEventTriggeredByInput(e) && !isHotkeyEnabledOnTag(e, _options?.enableOnTags)) {
        return
      }

      if (ref.current !== null && document.activeElement !== ref.current) {
        return
      }

      console.log('isContentEditable', ((e.target as HTMLElement)?.isContentEditable))

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
      if (_options?.keyup) {
        listener(event)
      }

      pressedDownKeys.delete(event.key.toLowerCase())
    }

    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [keys, cb, _options])

  return ref
}
