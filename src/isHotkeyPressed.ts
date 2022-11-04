import { Hotkey } from './types'
import { parseHotkey } from './parseHotkeys'
import isEqual from 'lodash/isEqual'

const currentlyPressedKeys: Set<Hotkey> = new Set<Hotkey>()

export function isHotkeyPressed(key: string | string[], splitKey: string = ','): boolean {
  const hotkeyArray = Array.isArray(key) ? key : key.split(splitKey)

  return hotkeyArray.every((hotkey) => {
    const parsedHotkey = parseHotkey(hotkey)

    for (const pressedHotkey of currentlyPressedKeys) {
      if (isEqual(parsedHotkey, pressedHotkey)) {
        return true
      }
    }
  })
}

export function pushToCurrentlyPressedKeys(key: string | string[]): void {
  const hotkeyArray = Array.isArray(key) ? key : [key]

  hotkeyArray.forEach(hotkey => currentlyPressedKeys.add(parseHotkey(hotkey)))
}

export function removeFromCurrentlyPressedKeys(key: string | string[]): void {
  const hotkeyArray = Array.isArray(key) ? key : [key]

  hotkeyArray.forEach((hotkey) => {
    const parsedHotkey = parseHotkey(hotkey)

    for (const pressedHotkey of currentlyPressedKeys) {
      if (pressedHotkey.keys?.every((key) => parsedHotkey.keys?.includes(key))) {
        currentlyPressedKeys.delete(pressedHotkey)
      }
    }
  })
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
