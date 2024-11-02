import { FormTags, Hotkey, Scopes, Trigger } from './types'
import { isHotkeyPressed, isReadonlyArray } from './isHotkeyPressed'
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

export function isHotkeyEnabledOnTag(
  event: KeyboardEvent,
  enabledOnTags: readonly FormTags[] | boolean = false
): boolean {
  const {target, composed} = event;

  let targetTagName: string | null = null

  if (isCustomElement(target as HTMLElement) && composed) {
    targetTagName = event.composedPath()[0] && (event.composedPath()[0] as HTMLElement).tagName;
  } else {
    targetTagName = target && (target as HTMLElement).tagName;
  }

  if (isReadonlyArray(enabledOnTags)) {
    return Boolean(
      targetTagName && enabledOnTags && enabledOnTags.some((tag) => tag.toLowerCase() === targetTagName?.toLowerCase())
    )
  }

  return Boolean(targetTagName && enabledOnTags && enabledOnTags)
}

export function isCustomElement(element: HTMLElement): boolean {
  // We just do a basic check w/o any complex RegEx or validation against the list of legacy names containing a hyphen,
  // as none of them is likely to be an event target, and it won't hurt anyway if we miss.
  // see: https://html.spec.whatwg.org/multipage/custom-elements.html#prod-potentialcustomelementname
  return !!element.tagName && !element.tagName.startsWith("-") && element.tagName.includes("-");
}

export function isScopeActive(activeScopes: string[], scopes?: Scopes): boolean {
  if (activeScopes.length === 0 && scopes) {
    console.warn(
      'A hotkey has the "scopes" option set, however no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>'
    )

    return true
  }

  if (!scopes) {
    return true
  }

  return activeScopes.some((scope) => scopes.includes(scope)) || activeScopes.includes('*')
}

export const isHotkeyMatchingKeyboardEvent = (e: KeyboardEvent, hotkey: Hotkey, ignoreModifiers = false): boolean => {
  const { alt, meta, mod, shift, ctrl, keys } = hotkey
  const { key: pressedKeyUppercase, code, ctrlKey, metaKey, shiftKey, altKey } = e

  const keyCode = mapKey(code)
  const pressedKey = pressedKeyUppercase.toLowerCase()

  if (
    !keys?.includes(keyCode) &&
    !keys?.includes(pressedKey) &&
    !['ctrl', 'control', 'unknown', 'meta', 'alt', 'shift', 'os'].includes(keyCode)
  ) {
    return false
  }

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
      if (meta === !metaKey && pressedKey !== 'meta' && pressedKey !== 'os') {
        return false
      }

      if (ctrl === !ctrlKey && pressedKey !== 'ctrl' && pressedKey !== 'control') {
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
