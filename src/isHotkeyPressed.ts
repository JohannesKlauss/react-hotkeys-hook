import { Hotkey } from './types'
import { parseHotkey } from './parseHotkeys'

const currentlyPressedKeys: Set<Hotkey> = new Set<Hotkey>()

export function isHotkeyPressed(key: string | string[]): boolean {
  const hotkeyArray = Array.isArray(key) ? key : [key]

  return hotkeyArray.every(hotkey => currentlyPressedKeys.has(parseHotkey(hotkey)))
}

export function pushToCurrentlyPressedKeys(key: string | string[]): void {
  const hotkeyArray = Array.isArray(key) ? key : [key]

  hotkeyArray.forEach(hotkey => currentlyPressedKeys.add(parseHotkey(hotkey)))
}

export function removeFromCurrentlyPressedKeys(key: string | string[]): void {
  const hotkeyArray = Array.isArray(key) ? key : [key]

  hotkeyArray.forEach(hotkey => currentlyPressedKeys.delete(parseHotkey(hotkey)))
}

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', e => {
      pushToCurrentlyPressedKeys(e.key)
    })

    document.addEventListener('keyup', e => {
      removeFromCurrentlyPressedKeys(e.key)
    })
  })
})()
