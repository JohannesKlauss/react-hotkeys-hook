import { Hotkey, KeyboardModifiers, Keys } from './types'

const reservedModifierKeywords = ['ctrl', 'shift', 'alt', 'meta', 'mod']

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
    .map(k => k.trim())
    .map(k => k === 'esc' ? 'escape' : k)
    .map(k => k === 'return' ? 'enter' : k)

  const modifiers: KeyboardModifiers = {
    alt: keys.includes('alt'),
    ctrl: keys.includes('ctrl'),
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
