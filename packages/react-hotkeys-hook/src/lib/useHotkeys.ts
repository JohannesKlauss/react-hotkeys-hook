import type { Hotkey, HotkeyCallback, Keys, Options, OptionsOrDependencyArray } from './types'
import { type DependencyList, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { mapCode, parseHotkey, parseKeysHookInput, isHotkeyModifier } from './parseHotkeys'
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

    const [comboHotkeys, sequenceHotkeys] = parseKeysHookInput(_keys, memoisedOptions?.delimiter)
      .reduce<[Array<{ key: string; hotkey: Hotkey }>, Array<{ key: string; hotkey: Hotkey }>]>((acc, key) => {
        const [_comboHotkey, _sequenceHotkey] = acc;

        const hotkey = parseHotkey(
          key,
          memoisedOptions?.splitKey,
          memoisedOptions?.sequenceSplitKey,
          memoisedOptions?.useKey,
          memoisedOptions?.description,
        )

        if (hotkey.isSequence) {
          _sequenceHotkey.push({ key, hotkey })
        } else {
          _comboHotkey.push({ key, hotkey })
        }
        return [_comboHotkey, _sequenceHotkey]
      }, [[], []])

    const sequenceMaps = new Map(
      sequenceHotkeys
        .reduce<[string, { recordedKeys: string[]; sequenceTimer: NodeJS.Timeout | undefined }][]>(
          (acc, { key, hotkey }) => {
            if (hotkey.isSequence) {
              acc.push([key, { recordedKeys: [], sequenceTimer: void 0 }])
            }
            return acc
          },
          []
        )
    );

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
      for (const { hotkey } of comboHotkeys) {
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
      for (const { key, hotkey } of sequenceHotkeys) {
        const sequenceMap = sequenceMaps.get(key)

        if (!sequenceMap) {
          continue
        }

        // Set a timeout to check post which the sequence should reset
        if (sequenceMap.sequenceTimer) {
          clearTimeout(sequenceMap.sequenceTimer)
        }

        sequenceMap.sequenceTimer = setTimeout(() => {
          sequenceMap.recordedKeys = []
        }, memoisedOptions?.sequenceTimeoutMs ?? 1000)

        const currentKey = hotkey.useKey ? e.key : mapCode(e.code)

        if (isHotkeyModifier(currentKey.toLowerCase())) {
          continue
        }

        sequenceMap.recordedKeys.push(currentKey)

        const expectedKey = hotkey.keys?.[sequenceMap.recordedKeys.length - 1]
        if (currentKey !== expectedKey) {
          sequenceMap.recordedKeys = []
          if (sequenceMap.sequenceTimer) {
            clearTimeout(sequenceMap.sequenceTimer)
          }
          continue
        }

        // If the sequence is complete, trigger the callback
        if (sequenceMap.recordedKeys.length === hotkey.keys?.length) {
          cbRef.current(e, hotkey)

          if (sequenceMap.sequenceTimer) {
            clearTimeout(sequenceMap.sequenceTimer)
          }

          sequenceMap.recordedKeys = []
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
      parseKeysHookInput(_keys, memoisedOptions?.delimiter).forEach((key) =>
        proxy.addHotkey(
          parseHotkey(
            key,
            memoisedOptions?.splitKey,
            memoisedOptions?.sequenceSplitKey,
            memoisedOptions?.useKey,
            memoisedOptions?.description,
          ),
        ),
      )
    }

    return () => {
      // @ts-expect-error TS2345
      domNode.removeEventListener('keyup', handleKeyUp, _options?.eventListenerOptions)
      // @ts-expect-error TS2345
      domNode.removeEventListener('keydown', handleKeyDown, _options?.eventListenerOptions)

      if (proxy) {
        parseKeysHookInput(_keys, memoisedOptions?.delimiter).forEach((key) =>
          proxy.removeHotkey(
            parseHotkey(
              key,
              memoisedOptions?.splitKey,
              memoisedOptions?.sequenceSplitKey,
              memoisedOptions?.useKey,
              memoisedOptions?.description,
            ),
          ),
        )
      }

      // clear the recorded keys and timeout on unmount
      for (const [, sequenceMap] of sequenceMaps) {
        sequenceMap.recordedKeys = []
        if (sequenceMap.sequenceTimer) {
          clearTimeout(sequenceMap.sequenceTimer)
        }
      }
    }
  }, [_keys, memoisedOptions, activeScopes])

  return ref
}
