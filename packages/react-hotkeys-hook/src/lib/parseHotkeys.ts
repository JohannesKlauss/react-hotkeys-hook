import type { Hotkey, KeyboardModifiers, Options } from './types'

const reservedModifierKeywords = ['shift', 'alt', 'meta', 'mod', 'ctrl', 'control']

export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /mac/i.test(navigator.userAgent) && !/iphone|ipad|ipod/i.test(navigator.userAgent)
}

const mappedKeys: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  left: 'arrowleft',
  right: 'arrowright',
  up: 'arrowup',
  down: 'arrowdown',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  AltLeft: 'alt',
  AltRight: 'alt',
  MetaLeft: 'meta',
  MetaRight: 'meta',
  OSLeft: 'meta',
  OSRight: 'meta',
  ControlLeft: 'ctrl',
  ControlRight: 'ctrl',
}

export function mapCode(key: string): string {
  return (mappedKeys[key.trim()] || key.trim()).toLowerCase().replace(/key|digit|numpad/, '')
}

export function isHotkeyModifier(key: string) {
  return reservedModifierKeywords.includes(key)
}

export function parseKeysHookInput(keys: string, delimiter = ','): string[] {
  return keys.toLowerCase().split(delimiter)
}

// Splits a hotkey while still allowing the separator itself to be used as a key, e.g. `+`, `ctrl++` or `>`
function splitHotkey(hotkey: string, separator: string): string[] {
  // An empty separator splits into characters, as String.prototype.split does
  if (separator === '') {
    return hotkey.split('')
  }

  if (hotkey === separator) {
    return [separator]
  }

  if (hotkey.endsWith(separator + separator)) {
    return [...hotkey.slice(0, -2 * separator.length).split(separator), separator]
  }

  return hotkey.split(separator)
}

export function parseHotkey(hotkey: string, options?: Options): Hotkey {
  const { splitKey = '+', sequenceSplitKey = '>', useKey = false, description, metadata, scopes } = options ?? {}
  let keys: string[] = []
  let isSequence = false

  // hotkey might contain a leading space from eg. `ctrl+a, shift+a`
  // oxlint-disable-next-line no-param-reassign -- Sanitize the hotkey argument.
  hotkey = hotkey.trim()

  if (hotkey.includes(sequenceSplitKey) && hotkey !== sequenceSplitKey) {
    isSequence = true
    keys = splitHotkey(hotkey.toLocaleLowerCase(), sequenceSplitKey).map((k) => mapCode(k))
  } else {
    keys = splitHotkey(hotkey.toLocaleLowerCase(), splitKey).map((k) => mapCode(k))
  }

  const modifiers: KeyboardModifiers = {
    alt: keys.includes('alt'),
    ctrl: keys.includes('ctrl') || keys.includes('control'),
    shift: keys.includes('shift'),
    meta: keys.includes('meta'),
    mod: keys.includes('mod'),
    useKey,
  }

  const singleCharKeys = keys.filter((k) => !reservedModifierKeywords.includes(k))

  return {
    ...modifiers,
    keys: singleCharKeys,
    description,
    isSequence,
    hotkey,
    metadata,
    scopes,
  }
}
