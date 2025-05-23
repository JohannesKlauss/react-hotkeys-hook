import type { HotkeyCallback, Keys, Options, OptionsOrDependencyArray } from './types'
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

    let keysStack: string[] | null = null
    let lastModiferKey: string | null = null
    let lastKeyTime = performance.now()

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
          if (performance.now() - lastKeyTime > (memoisedOptions?.sequenceTimeoutMs ?? 1000)) {
            keysStack = null
          }

          if (!keysStack && hotkey.keys) {
            keysStack = hotkey.keys.map((v) => v).reverse()
          }

          let currentKey = hotkey.useKey ? e.key : mapCode(e.code)
          let isCurrentKeyModifer = isHotkeyModifier(currentKey.toLowerCase())
          if (hotkey.useKey) {
            currentKey = currentKey.toLowerCase()
            if (isCurrentKeyModifer) {
                if (currentKey == 'control') {
                  currentKey = 'ctrl'
                }
            }
          }

          const expectedKey = keysStack?.[keysStack.length - 1]

          if (currentKey !== expectedKey) {
            if (hotkey.useKey) {
              if (isCurrentKeyModifer && !isHotkeyModifier(keysStack?.[keysStack?.length - 1] as string)) {
                lastModiferKey = currentKey
              } else {
                keysStack = null
              }
            }
            return
          }
          
          if (lastModiferKey) {
            if (lastModiferKey === 'capslock' || (e as any)[`${lastModiferKey}Key`]) {
              keysStack?.pop()
              lastKeyTime = performance.now()
            }
            lastModiferKey = null
          } else {
            keysStack?.pop()
            lastKeyTime = performance.now()
          }

          // If the sequence is complete, trigger the callback
          // if (recordedKeys.length === hotkey.keys?.length) {
          if (keysStack?.length === 0) {
            cbRef.current(e, hotkey)
            keysStack = null
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
            cbRef.current(e, hotkey)

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
    }
  }, [_keys, memoisedOptions, activeScopes])

  return ref
}
