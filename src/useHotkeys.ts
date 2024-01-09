import { HotkeyCallback, KeyboardEventHandler, Keys, Options, OptionsOrDependencyArray, RefType } from './types'
import { DependencyList, RefCallback, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { mapKey, parseHotkey, parseKeysHookInput } from './parseHotkeys'
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
  dependencies?: OptionsOrDependencyArray
) {
  const ref = useRef<RefType<T>>(null)
  const hasTriggeredRef = useRef(false)

  const handleKeyUpRef = useRef<KeyboardEventHandler>()
  const handleKeyDownRef = useRef<KeyboardEventHandler>()
  const stableHandleKeyUpRef = useRef<KeyboardEventHandler>((...args) => handleKeyUpRef.current?.(...args))
  const stableHandleKeyDownRef = useRef<KeyboardEventHandler>((...args) => handleKeyDownRef.current?.(...args))

  const _options: Options | undefined = !(options instanceof Array)
    ? (options as Options)
    : !(dependencies instanceof Array)
    ? (dependencies as Options)
    : undefined
  const _keys: string = isReadonlyArray(keys) ? keys.join(_options?.splitKey) : keys
  const _deps: DependencyList | undefined =
    options instanceof Array ? options : dependencies instanceof Array ? dependencies : undefined

  const memoisedCB = useCallback(callback, _deps ?? [])
  const cbRef = useRef<HotkeyCallback>(memoisedCB)

  if (_deps) {
    cbRef.current = memoisedCB
  } else {
    cbRef.current = callback
  }

  const memoisedOptions = useDeepEqualMemo(_options)

  const { enabledScopes } = useHotkeysContext()
  const proxy = useBoundHotkeysProxy()

  useSafeLayoutEffect(() => {
    if (memoisedOptions?.enabled === false || !isScopeActive(enabledScopes, memoisedOptions?.scopes)) {
      return
    }

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

      parseKeysHookInput(_keys, memoisedOptions?.splitKey).forEach((key) => {
        const hotkey = parseHotkey(key, memoisedOptions?.combinationKey)

        if (isHotkeyMatchingKeyboardEvent(e, hotkey, memoisedOptions?.ignoreModifiers) || hotkey.keys?.includes('*')) {
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
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return
      }

      pushToCurrentlyPressedKeys(mapKey(event.code))

      if ((memoisedOptions?.keydown === undefined && memoisedOptions?.keyup !== true) || memoisedOptions?.keydown) {
        listener(event)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return
      }

      removeFromCurrentlyPressedKeys(mapKey(event.code))

      hasTriggeredRef.current = false

      if (memoisedOptions?.keyup) {
        listener(event, true)
      }
    }

    handleKeyUpRef.current = handleKeyUp
    handleKeyDownRef.current = handleKeyDown

    if (proxy) {
      parseKeysHookInput(_keys, memoisedOptions?.splitKey).forEach((key) =>
        proxy.addHotkey(parseHotkey(key, memoisedOptions?.combinationKey, memoisedOptions?.description))
      )
    }

    return () => {
      handleKeyUpRef.current = undefined
      handleKeyDownRef.current = undefined

      if (proxy) {
        parseKeysHookInput(_keys, memoisedOptions?.splitKey).forEach((key) =>
          proxy.removeHotkey(parseHotkey(key, memoisedOptions?.combinationKey, memoisedOptions?.description))
        )
      }
    }
  }, [_keys, memoisedOptions, enabledScopes])

  useEffect(() => {
    // This effect is needed to attach event listeners to something when the returned ref is not used.
    // and to clean up when the component using the hook unmounts.
    const domNode = (ref.current || memoisedOptions?.document || document) as T

    domNode?.addEventListener('keyup', stableHandleKeyUpRef.current)
    domNode?.addEventListener('keydown', stableHandleKeyDownRef.current)

    return () => {
      ref.current?.removeEventListener('keyup', stableHandleKeyUpRef.current)
      ref.current?.removeEventListener('keydown', stableHandleKeyDownRef.current)
    }
  }, [memoisedOptions?.document])

  const refCallback: RefCallback<T> = useCallback((element) => {
    const domNode = (element || memoisedOptions?.document || document) as T

    // Cleanup old event handlers
    ref.current?.removeEventListener('keyup', stableHandleKeyUpRef.current)
    ref.current?.removeEventListener('keydown', stableHandleKeyDownRef.current)

    // Update refObject
    ref.current = domNode

    // Re-attach handlers to the new element
    domNode?.addEventListener('keyup', stableHandleKeyUpRef.current)
    domNode?.addEventListener('keydown', stableHandleKeyDownRef.current)
  }, [])

  return refCallback
}
