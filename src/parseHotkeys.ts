import { Hotkey, KeyboardModifiers, Keys } from './types'

const reservedModifierKeywords = ['shift', 'alt', 'meta', 'mod']

const mappedKeys: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  '.': 'period',
  ',': 'comma',
  '-': 'slash',
  ' ': 'space',
  '#': 'backslash',
  '+': 'bracketright',
  'ShiftLeft': 'shift',
  'ShiftRight': 'shift',
  'AltLeft': 'alt',
  'AltRight': 'alt',
  'MetaLeft': 'meta',
  'MetaRight': 'meta',
  'ControlLeft': 'ctrl',
  'ControlRight': 'ctrl',
}

export function mapKey(key: string): string {
  return (mappedKeys[key] || key)
    .trim()
    .toLowerCase()
    .replace('key', '')
    .replace('digit', '')
    .replace('numpad', '')
    .replace('arrow', '')
}

export function isHotkeyModifier(key: string) {
  return reservedModifierKeywords.includes(key)
}

export function parseKeysHookInput(keys: Keys, splitKey: string = ','): string[] {
  if (typeof keys === 'string') {
    return keys.split(splitKey)
  }

  return keys
}

export function parseHotkey(hotkey: string, combinationKey: string = '+'): Hotkey {
  const keys = hotkey
    .toLocaleLowerCase()
    .split(combinationKey)
    .map(k => mapKey(k))

  const modifiers: KeyboardModifiers = {
    alt: keys.includes('alt'),
    shift: keys.includes('shift'),
    meta: keys.includes('meta'),
    mod: keys.includes('mod'),
  }

  const singleCharKeys = keys.filter((k) => !reservedModifierKeywords.includes(k))

  return {
    ...modifiers,
    keys: singleCharKeys,
  }
}
