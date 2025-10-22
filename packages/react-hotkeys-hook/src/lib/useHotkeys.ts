import type { Hotkey, HotkeyCallback, Keys, Options, OptionsOrDependencyArray } from './types'
import { type DependencyList, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { mapCode, parseHotkey, parseKeysHookInput, isHotkeyModifier, sequenceEndsWith } from './parseHotkeys'
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
import { isReadonlyArray, pushToCurrentlyPressedKeys, removeFromCurrentlyPressedKeys } from './isHotkeyPressed'

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
  const ref = useRef<T>(null)
  const hasTriggeredRef = useRef(false)

  const _options: Options | undefined = !Array.isArray(options)
    ? (options as Options)
    : !Array.isArray(dependencies)
      ? (dependencies as Options)
      : undefined
  const _keys: string = isReadonlyArray(keys) ? keys.join(_options?.delimiter) : keys
  const _deps: DependencyList | undefined = Array.isArray(options)
    ? options
    : Array.isArray(dependencies)
      ? dependencies
      : undefined

  // biome-ignore lint/correctness/useExhaustiveDependencies: is exhaustive
  const memoisedCB = useCallback(callback, _deps ?? [])
  const cbRef = useRef<HotkeyCallback>(memoisedCB)

  if (_deps) {
    cbRef.current = memoisedCB
  } else {
    cbRef.current = callback
  }

  const memoisedOptions = useDeepEqualMemo(_options)

  const { activeScopes } = useHotkeysContext()
  const proxy = useBoundHotkeysProxy()

  useSafeLayoutEffect(() => {
    if (memoisedOptions?.enabled === false || !isScopeActive(activeScopes, memoisedOptions?.scopes)) {
      return
    }

    let recordedKeys: string[] = []
    let sequenceTimer: NodeJS.Timeout | undefined

    const [comboHotkeys, sequenceHotkeys] = parseKeysHookInput(_keys, memoisedOptions?.delimiter)
      .reduce<[Hotkey[], Hotkey[]]>((acc, key) => {
        const [_comboHotkey, _sequenceHotkey] = acc

        const splitKey = memoisedOptions?.splitKey ?? '+'
        const sequenceSplitKey = memoisedOptions?.sequenceSplitKey ?? '>'

        if (key.includes(splitKey) && key.includes(sequenceSplitKey)) {
          console.warn(`Hotkey ${key} contains both ${splitKey} and ${sequenceSplitKey} which is not supported.`)
        }

        const hotkey = parseHotkey(
          key,
          splitKey,
          sequenceSplitKey,
          memoisedOptions?.useKey,
          memoisedOptions?.description,
        )

        if (hotkey.isSequence) {
          _sequenceHotkey.push(hotkey)
        } else {
          _comboHotkey.push(hotkey)
        }
        return [_comboHotkey, _sequenceHotkey]
      }, [[], []])

    const combinedHotkeys = [...comboHotkeys, ...sequenceHotkeys]

    const listener = (e: KeyboardEvent, isKeyUp = false) => {
      if (isKeyboardEventTriggeredByInput(e) && !isHotkeyEnabledOnTag(e, memoisedOptions?.enableOnFormTags)) {
        return
      }

      // TODO: SINCE THE EVENT IS NOW ATTACHED TO THE REF, THE ACTIVE ELEMENT CAN NEVER BE INSIDE THE REF. THE HOTKEY ONLY TRIGGERS IF THE
      // REF IS THE ACTIVE ELEMENT. THIS IS A PROBLEM SINCE FOCUSED SUB COMPONENTS WON'T TRIGGER THE HOTKEY.
      if (ref.current !== null) {
        const rootNode = ref.current.getRootNode()

        if (
          (rootNode instanceof Document || rootNode instanceof ShadowRoot) &&
          rootNode.activeElement !== ref.current &&
          !ref.current.contains(rootNode.activeElement)
        ) {
          stopPropagation(e)
          return
        }
      }

      if ((e.target as HTMLElement)?.isContentEditable && !memoisedOptions?.enableOnContentEditable) {
        return
      }

      // ========== HANDLE COMBO HOTKEYS ==========
      for (const hotkey of comboHotkeys) {
        if (
          isHotkeyMatchingKeyboardEvent(e, hotkey, memoisedOptions?.ignoreModifiers) ||
          hotkey.keys?.includes('*')
        ) {
          if (memoisedOptions?.ignoreEventWhen?.(e)) {
            continue
          }

          if (isKeyUp && hasTriggeredRef.current) {
            continue
          }

          maybePreventDefault(e, hotkey, memoisedOptions?.preventDefault)

          if (!isHotkeyEnabled(e, hotkey, memoisedOptions?.enabled)) {
            stopPropagation(e)

            continue
          }

          // Execute the user callback for that hotkey
          cbRef.current(e, hotkey)

          if (!isKeyUp) {
            hasTriggeredRef.current = true
          }
        }
      }

      // ========== HANDLE SEQUENCE HOTKEYS ==========
      if (sequenceHotkeys.length > 0) {
        const currentKey = memoisedOptions?.useKey
          ? e.key
          : mapCode(e.code)

        if (!isHotkeyModifier(currentKey.toLowerCase())) {
          // clear the previous timer
          if (sequenceTimer) {
            clearTimeout(sequenceTimer)
          }

          sequenceTimer = setTimeout(() => {
            recordedKeys = []
          }, memoisedOptions?.sequenceTimeoutMs ?? 1000)

          recordedKeys.push(currentKey)

          for (const hotkey of sequenceHotkeys) {
            if (!hotkey.keys) {
              continue
            }

            if (sequenceEndsWith(recordedKeys, [...hotkey.keys])) {
              cbRef.current(e, hotkey)
            }
          }
        }
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return
      }

      pushToCurrentlyPressedKeys(mapCode(event.code))

      if ((memoisedOptions?.keydown === undefined && memoisedOptions?.keyup !== true) || memoisedOptions?.keydown) {
        listener(event)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return
      }

      removeFromCurrentlyPressedKeys(mapCode(event.code))

      hasTriggeredRef.current = false

      if (memoisedOptions?.keyup) {
        listener(event, true)
      }
    }

    const domNode = ref.current || _options?.document || document

    // @ts-expect-error TS2345
    domNode.addEventListener('keyup', handleKeyUp, _options?.eventListenerOptions)
    // @ts-expect-error TS2345
    domNode.addEventListener('keydown', handleKeyDown, _options?.eventListenerOptions)

    if (proxy) {
      combinedHotkeys.forEach(proxy.addHotkey)
    }

    return () => {
      // @ts-expect-error TS2345
      domNode.removeEventListener('keyup', handleKeyUp, _options?.eventListenerOptions)
      // @ts-expect-error TS2345
      domNode.removeEventListener('keydown', handleKeyDown, _options?.eventListenerOptions)

      if (proxy) {
        combinedHotkeys.forEach(proxy.removeHotkey)
      }

      recordedKeys = []
      if (sequenceTimer) {
        clearTimeout(sequenceTimer)
      }
    }
  }, [_keys, memoisedOptions, activeScopes])

  return ref
}
