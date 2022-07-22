import { Hotkey } from './types'
import { parseHotkey } from './parseHotkeys'

const currentlyPressedKeys: Set<Hotkey> = new Set<Hotkey>()

export function isHotkeyPressed(key: string | string[]): boolean {
  const hotkeyArray = Array.isArray(key) ? key : [key]

  return hotkeyArray.every(hotkey => currentlyPressedKeys.has(parseHotkey(hotkey)))
}
