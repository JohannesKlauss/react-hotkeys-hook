import { useRef } from 'react'
import { useBoundHotkeysProxy } from './BoundHotkeysProxyProvider'
import { useHotkeysContext } from './HotkeysProvider'
import { isReadonlyArray, pushToCurrentlyPressedKeys, removeFromCurrentlyPressedKeys } from './isHotkeyPressed'
import { isHotkeyModifier, mapCode, parseHotkey, parseKeysHookInput } from './parseHotkeys'
import type { HotkeyCallback, Keys, Options } from './types'
import useDeepEqualMemo from './useDeepEqualMemo'
import useEventCallback from './utils/useEventCallback'
import useIsomorphicLayoutEffect from './utils/useIsomorphicLayoutEffect'
import {
  isHotkeyEnabled,
  isHotkeyEnabledOnTag,
  isHotkeyMatchingKeyboardEvent,
  isKeyboardEventTriggeredByInput,
  isScopeActive,
  maybePreventDefault,
} from './validators'

const stopPropagation = (e: KeyboardEvent): void => {
  e.stopPropagation()
  e.preventDefault()
  e.stopImmediatePropagation()
}

export default function useHotkeys<T extends HTMLElement>(keys: Keys, callback: HotkeyCallback, options?: Options) {
  const ref = useRef<T>(null)
  const hasTriggeredRef = useRef(false)

  const _keys: string = isReadonlyArray(keys) ? keys.join(options?.delimiter) : keys
  const _callback = useEventCallback(callback)

  const memoisedOptions = useDeepEqualMemo(options)

  const { activeScopes } = useHotkeysContext()
  const proxy = useBoundHotkeysProxy()

  useIsomorphicLayoutEffect(() => {
    if (memoisedOptions?.enabled === false || !isScopeActive(activeScopes, memoisedOptions?.scopes)) {
      return
    }

    let recordedKeys: string[] = []
    let sequenceTimer: NodeJS.Timeout | undefined

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

      parseKeysHookInput(_keys, memoisedOptions?.delimiter).forEach((key) => {
        if (key.includes(memoisedOptions?.splitKey ?? '+') && key.includes(memoisedOptions?.sequenceSplitKey ?? '>')) {
          console.warn(
            `Hotkey ${key} contains both ${memoisedOptions?.splitKey ?? '+'} and ${memoisedOptions?.sequenceSplitKey ?? '>'} which is not supported.`,
          )
          return
        }

        const hotkey = parseHotkey(
          key,
          memoisedOptions?.splitKey,
          memoisedOptions?.sequenceSplitKey,
          memoisedOptions?.useKey,
          memoisedOptions?.description,
        )

        if (hotkey.isSequence) {
          // Set a timeout to check post which the sequence should reset
          sequenceTimer = setTimeout(() => {
            recordedKeys = []
          }, memoisedOptions?.sequenceTimeoutMs ?? 1000)

          const currentKey = hotkey.useKey ? e.key : mapCode(e.code)

          // TODO: Make modifiers work with sequences
          if (isHotkeyModifier(currentKey.toLowerCase())) {
            return
          }

          recordedKeys.push(currentKey)

          const expectedKey = hotkey.keys?.[recordedKeys.length - 1]
          if (currentKey !== expectedKey) {
            recordedKeys = []
            if (sequenceTimer) {
              clearTimeout(sequenceTimer)
            }
            return
          }

          // If the sequence is complete, trigger the callback
          if (recordedKeys.length === hotkey.keys?.length) {
            _callback(e, hotkey)

            if (sequenceTimer) {
              clearTimeout(sequenceTimer)
            }

            recordedKeys = []
          }
        } else {
          if (
            isHotkeyMatchingKeyboardEvent(e, hotkey, memoisedOptions?.ignoreModifiers) ||
            hotkey.keys?.includes('*')
          ) {
            if (memoisedOptions?.ignoreEventWhen?.(e)) {
              return
            }

            if (isKeyUp && hasTriggeredRef.current) {
              return
            }

            maybePreventDefault(e, hotkey, memoisedOptions?.preventDefault)

            if (!isHotkeyEnabled(e, hotkey, memoisedOptions?.enabled)) {
              stopPropagation(e)

              return
            }

            // Execute the user callback for that hotkey
            _callback(e, hotkey)

            if (!isKeyUp) {
              hasTriggeredRef.current = true
            }
          }
        }
      })
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

    const domNode = ref.current || memoisedOptions?.document || document

    // @ts-expect-error TS2345
    domNode.addEventListener('keyup', handleKeyUp, memoisedOptions?.eventListenerOptions)
    // @ts-expect-error TS2345
    domNode.addEventListener('keydown', handleKeyDown, memoisedOptions?.eventListenerOptions)

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
      domNode.removeEventListener('keyup', handleKeyUp, memoisedOptions?.eventListenerOptions)
      // @ts-expect-error TS2345
      domNode.removeEventListener('keydown', handleKeyDown, memoisedOptions?.eventListenerOptions)

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

      recordedKeys = []
      if (sequenceTimer) {
        clearTimeout(sequenceTimer)
      }
    }
  }, [_keys, activeScopes, proxy, _callback, memoisedOptions])

  return ref
}
