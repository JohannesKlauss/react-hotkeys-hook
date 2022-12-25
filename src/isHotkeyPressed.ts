import { isHotkeyModifier } from './parseHotkeys'

const currentlyPressedKeys: Set<string> = new Set<string>()

export function isHotkeyPressed(key: string | string[], splitKey: string = ','): boolean {
  const hotkeyArray = Array.isArray(key) ? key : key.split(splitKey)

  return hotkeyArray.every((hotkey) => currentlyPressedKeys.has(hotkey.trim().toLowerCase()))
}

function pushToCurrentlyPressedKeys(key: string | string[]): void {
  const hotkeyArray = Array.isArray(key) ? key : [key]

  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (currentlyPressedKeys.has('meta')) {
    currentlyPressedKeys.forEach(key => !isHotkeyModifier(key) && currentlyPressedKeys.delete(key))
  }

  hotkeyArray.forEach(hotkey => currentlyPressedKeys.add(hotkey.toLowerCase()))
}

function removeFromCurrentlyPressedKeys(key: string): void {
  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (key === 'meta') {
    currentlyPressedKeys.clear()
  } else {
    currentlyPressedKeys.delete(key)
  }
}

(() => {
  document.addEventListener('keydown', e => {
    if (e.key === undefined) {
      // Synthetic event (e.g., Chrome autofill).  Ignore.
      return
    }

    pushToCurrentlyPressedKeys(e.key.toLowerCase())
  })

  document.addEventListener('keyup', e => {
    if (e.key === undefined) {
      // Synthetic event (e.g., Chrome autofill).  Ignore.
      return
    }

    removeFromCurrentlyPressedKeys(e.key.toLowerCase())
  })
})()
