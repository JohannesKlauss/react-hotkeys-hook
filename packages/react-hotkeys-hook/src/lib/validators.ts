import { isHotkeyPressed, isReadonlyArray } from './isHotkeyPressed'
import { isMacOS, mapCode } from './parseHotkeys'
import type { FormTags, Hotkey, HotkeyCallback, Options, Scopes, Trigger } from './types'

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

// Runs the callback of a completed sequence, honouring the same guards as a single key combination.
export function triggerSequenceHotkey(
  e: KeyboardEvent,
  hotkey: Hotkey,
  callback: HotkeyCallback,
  { enabled, ignoreEventWhen, preventDefault }: Pick<Options, 'enabled' | 'ignoreEventWhen' | 'preventDefault'>,
): void {
  if (ignoreEventWhen?.(e)) {
    return
  }

  maybePreventDefault(e, hotkey, preventDefault)

  if (isHotkeyEnabled(e, hotkey, enabled)) {
    callback(e, hotkey)
  }
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
      enabledOnTags?.some((tag) => tag.toLowerCase() === targetTagName.toLowerCase() || tag === targetRole),
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

  return activeScopes.some((scope) => (typeof scopes === 'string' ? scopes === scope : scopes.includes(scope)))
}

// Physical keys of the main block that produce a symbol. Shift changes what these keys produce on most layouts
// (e.g. Shift+Period gives `>` and Shift+Equal gives `+` on a US layout). Numpad keys, Space, digits and letters are
// deliberately not listed: Shift does not change the character they produce (Chromium reports `key: "1"` with
// `shiftKey: true` for Shift+Numpad1), or, for letters, `a` and `shift+a` must stay distinct.
const SHIFTABLE_SYMBOL_CODES = new Set([
  'Backquote',
  'Minus',
  'Equal',
  'BracketLeft',
  'BracketRight',
  'Backslash',
  'Semicolon',
  'Quote',
  'Comma',
  'Period',
  'Slash',
  'IntlBackslash',
  'IntlYen',
  'IntlRo',
])

function isCaseless(key: string): boolean {
  return key.toLowerCase() === key.toUpperCase()
}

// With useKey, a symbol binding without an explicit `shift` (e.g. `>`) also matches when the layout needs shift to
// type it. This only applies to caseless symbols produced by a main-block symbol key, see SHIFTABLE_SYMBOL_CODES.
function isShiftableSymbol(e: KeyboardEvent): boolean {
  return isCaseless(e.key) && SHIFTABLE_SYMBOL_CODES.has(e.code)
}

function isImplicitShiftAllowed(e: KeyboardEvent, hotkey: Hotkey): boolean {
  const { shift, keys, useKey } = hotkey

  if (!useKey || shift) {
    return false
  }

  if (!e.shiftKey || keys?.length !== 1) {
    return false
  }

  return keys[0] === e.key && isShiftableSymbol(e)
}

function isShiftStateMatching(e: KeyboardEvent, hotkey: Hotkey, mappedCode: string): boolean {
  if (hotkey.shift === e.shiftKey || mappedCode === 'shift') {
    return true
  }

  return isImplicitShiftAllowed(e, hotkey)
}

export const isHotkeyMatchingKeyboardEvent = (e: KeyboardEvent, hotkey: Hotkey, ignoreModifiers = false): boolean => {
  const { alt, meta, mod, ctrl, keys, useKey } = hotkey
  const { code, key: producedKey, ctrlKey, metaKey, altKey } = e

  const mappedCode = mapCode(code)
  const altGraphKey = typeof e.getModifierState === 'function' && e.getModifierState('AltGraph')

  if (
    !useKey &&
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

    if (!isShiftStateMatching(e, hotkey, mappedCode)) {
      return false
    }

    // Mod is a special key name that is checking for meta on macOS and ctrl on other platforms
    if (mod) {
      if (isMacOS() ? !metaKey : !ctrlKey) {
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

    if (altGraphKey && !alt && !ctrl && !mod && !['alt', 'ctrl', 'control'].includes(mappedCode)) {
      return false
    }
  }

  // All modifiers are correct, now check the key
  // If useKey is set, match only against the produced key value and don't fall back to the mapped code
  if (useKey && keys?.length === 1) {
    return keys.includes(producedKey.toLowerCase())
  }

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
