import { FormTags, Hotkey, Scopes, Trigger } from './types'
import { isHotkeyPressed, isReadonlyArray } from './isHotkeyPressed'
import { mapCode } from './parseHotkeys'
import { $activeScopes } from './HotkeysProvider.tsx'

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
  const {target, composed} = event

  let targetTagName

  if (isCustomElement(target as HTMLElement) && composed) {
    targetTagName = event.composedPath()[0] && (event.composedPath()[0] as HTMLElement).tagName
  } else {
    targetTagName = target && (target as HTMLElement).tagName
  }

  if (isReadonlyArray(enabledOnTags)) {
    return Boolean(
      targetTagName && enabledOnTags && enabledOnTags.some((tag) => tag.toLowerCase() === targetTagName.toLowerCase())
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

export function isScopeActive(scopes?: Scopes): boolean {
  if (($activeScopes.value.length === 0 && scopes) || !scopes) {
    return true
  }

  return $activeScopes.value.some((scope) => scopes.includes(scope)) || $activeScopes.value.includes('*')
}

export const isHotkeyMatchingKeyboardEvent = (e: KeyboardEvent, hotkey: Hotkey, ignoreModifiers = false): boolean => {
  const { alt, meta, mod, shift, ctrl, keys, useKey } = hotkey
  const { code, key: producedKey, ctrlKey, metaKey, shiftKey, altKey } = e

  const mappedCode = mapCode(code)

  if (useKey && keys?.length === 1 && keys.includes(producedKey)) {
    return true
  }

  if (
    !keys?.includes(mappedCode) &&
    !['ctrl', 'control', 'unknown', 'meta', 'alt', 'shift', 'os'].includes(mappedCode)
  ) {
    return false
  }

  if (!ignoreModifiers) {
    // We check the pressed keys for compatibility with the keyup event. In keyup events the modifier flags are not set.
    if (alt !== altKey && mappedCode !== 'alt') {
      return false
    }

    if (shift !== shiftKey && mappedCode !== 'shift') {
      return false
    }

    // Mod is a special key name that is checking for meta on macOS and ctrl on other platforms
    if (mod) {
      if (!metaKey && !ctrlKey) {
        return false
      }
    } else {
      if (meta !== metaKey && mappedCode !== 'meta' && mappedCode !== 'os') {
        return false
      }

      if (ctrl !== ctrlKey && mappedCode !== 'ctrl' && mappedCode !== 'control') {
        return false
      }
    }
  }

  // All modifiers are correct, now check the key
  // If the key is set, we check for the key
  if (keys && keys.length === 1 && keys.includes(mappedCode)) {
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
