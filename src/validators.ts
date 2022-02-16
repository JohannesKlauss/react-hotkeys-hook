import { FormTags, Hotkey, Scopes, Trigger } from './types'

export function possiblyPreventDefault(e: KeyboardEvent, hotkey: Hotkey, preventDefault?: Trigger): void {
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
  return isHotkeyEnabledOnTag(ev, ['INPUT', 'TEXTAREA', 'SELECT'])
}

export function isHotkeyEnabledOnTag({ target }: KeyboardEvent, enabledOnTags?: FormTags[]): boolean {
  const targetTagName = target && (target as HTMLElement).tagName

  return Boolean(targetTagName && enabledOnTags && enabledOnTags.includes(targetTagName as FormTags))
}

export function isScopeActive(activeScopes: string[], scopes?: Scopes): boolean {
  if (activeScopes.length === 0 && scopes) {
    console.warn(
      'A hotkey has a set scopes options, although no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>'
    )

    return true
  }

  if (!scopes) {
    return true
  }

  return activeScopes.some(scope => scopes.includes(scope)) || activeScopes.includes('*')
}

export const isHotkeyMatchingKeyboardEvent = (e: KeyboardEvent, hotkey: Hotkey): boolean => {
  const { alt, ctrl, meta, mod, shift, key } = hotkey
  const { altKey, ctrlKey, metaKey, shiftKey, key: pressedKey, code } = e

  const keyCode = code.toLowerCase().replace('key', '')

  if (altKey !== alt) {
    return false
  }

  if (shiftKey !== shift) {
    return false
  }

  // Mod is a special character that is checking for meta on macOS and ctrl on other platforms
  if (mod) {
    if (!metaKey && !ctrlKey) {
      return false
    }
  } else {
    if (metaKey !== meta) {
      return false
    }

    if (ctrlKey !== ctrl) {
      return false
    }
  }

  // All modifiers are correct, now check the key
  // If the key is set we check for the key
  if (key && (key.toLowerCase() === pressedKey.toLowerCase() || keyCode === key.toLowerCase())) {
    return true
  } else if (!key) {
    // If the key is not set, we only listen for modifiers, that check went alright, so we return true
    return true
  }

  // There is nothing that matches.
  return false
}
