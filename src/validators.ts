import { FormTags, Hotkey, Scopes, Trigger } from './types'
import { isHotkeyPressed } from './isHotkeyPressed'
import { mapKey } from './parseHotkeys'

export function maybePreventDefault(e: KeyboardEvent, hotkey: Hotkey, preventDefault?: Trigger): void {
  if ((typeof preventDefault === 'function' && preventDefault(e, hotkey)) || preventDefault === true) {
    e.preventDefault()
  }
}

export function isHotkeyEnabled(e: KeyboardEvent, hotkey: Hotkey, enabled?: Trigger): boolean {
  if (typeof enabled === 'function') {
    return enabled(e, hotkey)
  }

  return enabled === true || enabled === undefined
}

export function isKeyboardEventTriggeredByInput(ev: KeyboardEvent): boolean {
  return isHotkeyEnabledOnTag(ev, ['input', 'textarea', 'select'])
}

export function isHotkeyEnabledOnTag({ target }: KeyboardEvent, enabledOnTags: FormTags[] | boolean = false): boolean {
  const targetTagName = target && (target as HTMLElement).tagName

  // Enable hotkeys on components with enableHotkeys data property
  const enableHotkeys = (
    !!(target && (target as HTMLInputElement).dataset.enableHotkeys)
    || !!(target && (target as HTMLInputElement)?.parentElement?.dataset.enableHotkeys)
  )
  if (enableHotkeys) {
    return true
  }

  if (enabledOnTags instanceof Array) {
    return Boolean(targetTagName && enabledOnTags && enabledOnTags.some(tag => tag.toLowerCase() === targetTagName.toLowerCase()))
  }

  return Boolean(targetTagName && enabledOnTags && enabledOnTags === true)
}

export function isScopeActive(activeScopes: string[], scopes?: Scopes): boolean {
  if (activeScopes.length === 0 && scopes) {
    console.warn(
      'A hotkey has the "scopes" option set, however no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>',
    )

    return true
  }

  if (!scopes) {
    return true
  }

  return activeScopes.some(scope => scopes.includes(scope)) || activeScopes.includes('*')
}

export const isHotkeyMatchingKeyboardEvent = (e: KeyboardEvent, hotkey: Hotkey, ignoreModifiers: boolean = false): boolean => {
  const { alt, meta, mod, shift, ctrl, keys } = hotkey
  const { key: pressedKeyUppercase, code, ctrlKey, metaKey, shiftKey, altKey } = e

  const keyCode = mapKey(code)
  const pressedKey = pressedKeyUppercase.toLowerCase()

  if (!ignoreModifiers) {
    // We check the pressed keys for compatibility with the keyup event. In keyup events the modifier flags are not set.
    if (alt === !altKey && pressedKey !== 'alt') {
      return false
    }

    if (shift === !shiftKey && pressedKey !== 'shift') {
      return false
    }

    // Mod is a special key name that is checking for meta on macOS and ctrl on other platforms
    if (mod) {
      if (!metaKey && !ctrlKey) {
        return false
      }
    } else {
      if (meta === !metaKey && pressedKey !== 'meta') {
        return false
      }

      if (ctrl === !ctrlKey && pressedKey !== 'ctrl') {
        return false
      }
    }
  }

  // All modifiers are correct, now check the key
  // If the key is set, we check for the key
  if (keys && keys.length === 1 && (keys.includes(pressedKey) || keys.includes(keyCode))) {
    return true
  } else if (keys) {
    // Check if all keys are present in pressedDownKeys set
    return isHotkeyPressed(keys)
  } else if (!keys) {
    // If the key is not set, we only listen for modifiers, that check went alright, so we return true
    return true
  }

  // There is nothing that matches.
  return false
}
