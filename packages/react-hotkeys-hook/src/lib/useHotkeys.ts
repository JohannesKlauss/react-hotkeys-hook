import { Hotkey, HotkeyCallback, Keys, Options, RefType } from './types'
import { useRef } from 'react'
import useDeepEqualMemo from './util/useDeepEqualMemo'
import useEventCallback from './util/useEventCallback'
import useIsomorphicLayoutEffect from './util/useIsomorphicLayoutEffect'
import { mapCode, parseHotkey, parseKeysHookInput } from './parseHotkeys'
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
import { isReadonlyArray, pushToCurrentlyPressedKeys, removeFromCurrentlyPressedKeys } from './isHotkeyPressed'

const stopPropagation = (e: KeyboardEvent): void => {
  e.stopPropagation()
  e.preventDefault()
  e.stopImmediatePropagation()
}

export default function useHotkeys<T extends HTMLElement>(keys: Keys, callback: HotkeyCallback, options?: Options) {
  const ref = useRef<RefType<T>>(null)
  const hasTriggeredRef = useRef(false)

  const _keys: string = isReadonlyArray(keys) ? keys.join(options?.delimiter) : keys
  const _callback: HotkeyCallback = useEventCallback(callback)

  const memoisedOptions = useDeepEqualMemo(options)

  const { activeScopes } = useHotkeysContext()
  const proxy = useBoundHotkeysProxy()

  useIsomorphicLayoutEffect(() => {
    if (memoisedOptions?.enabled === false || !isScopeActive(activeScopes, memoisedOptions?.scopes)) {
      return
    }

    const hotkeys: Hotkey[] = parseKeysHookInput(_keys, memoisedOptions?.delimiter).map((key) =>
      parseHotkey(key, memoisedOptions?.splitKey, memoisedOptions?.useKey, memoisedOptions?.description)
    )

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

      hotkeys.forEach((hotkey) => {
        const isMatch =
          hotkey.keys.includes('*') || isHotkeyMatchingKeyboardEvent(e, hotkey, memoisedOptions?.ignoreModifiers)

        if (!isMatch || memoisedOptions?.ignoreEventWhen?.(e) || (isKeyUp && hasTriggeredRef.current)) {
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
      hotkeys.forEach((hotkey) =>
        proxy.addHotkey(
          parseHotkey(hotkey.hotkey, memoisedOptions?.splitKey, memoisedOptions?.useKey, memoisedOptions?.description)
        )
      )
    }

    return () => {
      // @ts-expect-error TS2345
      domNode.removeEventListener('keyup', handleKeyUp, memoisedOptions?.eventListenerOptions)
      // @ts-expect-error TS2345
      domNode.removeEventListener('keydown', handleKeyDown, memoisedOptions?.eventListenerOptions)

      if (proxy) {
        hotkeys.forEach((hotkey) =>
          proxy.removeHotkey(
            parseHotkey(hotkey.hotkey, memoisedOptions?.splitKey, memoisedOptions?.useKey, memoisedOptions?.description)
          )
        )
      }
    }
  }, [_keys, _callback, memoisedOptions, activeScopes, proxy])

  return ref
}
