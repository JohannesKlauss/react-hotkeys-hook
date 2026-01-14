import type { FormTags, Hotkey, Scopes, Trigger } from './types'
import { isHotkeyPressed, isReadonlyArray } from './isHotkeyPressed'
import { mapCode } from './parseHotkeys'

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

// these are ARIA roles that are considered form fields
const FORM_TAGS_AND_ROLES: readonly FormTags[] = [
  'input',
  'textarea',
  'select',
  'searchbox',
  'slider',
  'spinbutton',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'textbox',
]

export function isKeyboardEventTriggeredByInput(ev: KeyboardEvent): boolean {
  return isHotkeyEnabledOnTag(ev, FORM_TAGS_AND_ROLES)
}

export function isHotkeyEnabledOnTag(
  event: KeyboardEvent,
  enabledOnTags: readonly FormTags[] | boolean = false,
): boolean {
  const { target, composed } = event

  let targetTagName: EventTarget | string | undefined | null
  let targetRole: string | undefined | null

  if (isCustomElement(target as HTMLElement) && composed) {
    targetTagName = event.composedPath()[0] && (event.composedPath()[0] as HTMLElement).tagName
    targetRole = event.composedPath()[0] && (event.composedPath()[0] as HTMLElement).role
  } else {
    targetTagName = target && (target as HTMLElement).tagName
    targetRole = target && (target as HTMLElement).role
  }

  if (isReadonlyArray(enabledOnTags)) {
    return Boolean(
      targetTagName &&
        enabledOnTags &&
        enabledOnTags.some((tag) => tag.toLowerCase() === targetTagName.toLowerCase() || tag === targetRole),
    )
  }

  return Boolean(targetTagName && enabledOnTags && enabledOnTags)
}

export function isCustomElement(element: HTMLElement): boolean {
  // We just do a basic check w/o any complex RegEx or validation against the list of legacy names containing a hyphen,
  // as none of them is likely to be an event target, and it won't hurt anyway if we miss.
  // see: https://html.spec.whatwg.org/multipage/custom-elements.html#prod-potentialcustomelementname
  return !!element.tagName && !element.tagName.startsWith('-') && element.tagName.includes('-')
}

export function isScopeActive(activeScopes: string[], scopes?: Scopes): boolean {
  if (activeScopes.length === 0 && scopes) {
    return false
  }

  if (!scopes) {
    return true
  }

  return activeScopes.some((scope) => scopes.includes(scope)) || activeScopes.includes('*')
}

export const isHotkeyMatchingKeyboardEvent = (e: KeyboardEvent, hotkey: Hotkey, ignoreModifiers = false): boolean => {
  const { alt, meta, mod, shift, ctrl, keys, useKey } = hotkey
  const { code, key: producedKey, ctrlKey, metaKey, shiftKey, altKey } = e

  const mappedCode = mapCode(code)

  if (useKey) {
    if (keys?.length === 1 && keys.includes(producedKey.toLowerCase())) {
      if (!ignoreModifiers) {
        if (alt !== altKey) return false
        if (shift !== shiftKey) return false
        if (mod) {
          if (!metaKey && !ctrlKey) return false
        } else {
          if (meta !== metaKey) return false
          if (ctrl !== ctrlKey) return false
        }
      }
      return true
    }
    return false
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
  }

  if (keys && keys.length > 0) {
    // For multi-key combinations, the pressed key must be one of the expected keys
    // This prevents triggering when a modifier is pressed while holding an unrelated key
    if (!keys.includes(mappedCode)) {
      return false
    }
    // Check if all keys are present in pressedDownKeys set
    return isHotkeyPressed(keys)
  }

  if (!keys || keys.length === 0) {
    // If no keys are set (modifier-only hotkey like 'shift'), we only listen for modifiers.
    // The modifier checks above passed, so we return true.
    return true
  }

  // There is nothing that matches.
  return false
}
