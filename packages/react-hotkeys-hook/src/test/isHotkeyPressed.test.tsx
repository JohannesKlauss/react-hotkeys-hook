import userEvent from '@testing-library/user-event'
import { isHotkeyPressed } from '../lib'
import {test, expect} from 'vitest'

test('should return true if hotkey is currently pressed down', async () => {
  const user = userEvent.setup()

  await user.keyboard('{A>}')

  expect(isHotkeyPressed('A')).toBe(true)
  expect(isHotkeyPressed('a')).toBe(true)
})

test('should return false if hotkey is not pressed down', async () => {
  const user = userEvent.setup()

  await user.keyboard('{A>}')

  expect(isHotkeyPressed('a')).toBe(true)

  await user.keyboard('{/A}')

  expect(isHotkeyPressed('a')).toBe(false)
})

test.skip('should take modifiers into account', async () => {
  const user = userEvent.setup()

  await user.keyboard('{Shift>}{Alt>}{Meta>}')

  expect(isHotkeyPressed('shift')).toBe(true)
  expect(isHotkeyPressed('alt')).toBe(true)
  expect(isHotkeyPressed('meta')).toBe(true)
})

test('should support multiple hotkeys', async () => {
  const user = userEvent.setup()

  await user.keyboard('{B>}{A>}')

  expect(isHotkeyPressed('a')).toBe(true)
  expect(isHotkeyPressed('b')).toBe(true)
  expect(isHotkeyPressed(['b', 'a'])).toBe(true)

  await user.keyboard('{/B}')

  expect(isHotkeyPressed('a')).toBe(true)
  expect(isHotkeyPressed('b')).toBe(false)
  expect(isHotkeyPressed(['b', 'a'])).toBe(false)
})

test('should support multiple hotkeys with modifiers', async () => {
  const user = userEvent.setup()

  await user.keyboard('{Shift>}{A>}')

  expect(isHotkeyPressed('a')).toBe(true)
  expect(isHotkeyPressed('shift')).toBe(true)
  expect(isHotkeyPressed(['shift', 'a'])).toBe(true)

  await user.keyboard('{/Shift}')

  expect(isHotkeyPressed('a')).toBe(true)
  expect(isHotkeyPressed('shift')).toBe(false)
  expect(isHotkeyPressed(['shift', 'a'])).toBe(false)
})

test('should use , as delimiter as default', async () => {
  const user = userEvent.setup()

  await user.keyboard('{B>}{A>}')

  expect(isHotkeyPressed('a')).toBe(true)
  expect(isHotkeyPressed('b')).toBe(true)
  expect(isHotkeyPressed('  a, b  ')).toBe(true)
  expect(isHotkeyPressed(['a', 'b'])).toBe(true)

  await user.keyboard('{/B}')

  expect(isHotkeyPressed('a')).toBe(true)
  expect(isHotkeyPressed('b')).toBe(false)
  expect(isHotkeyPressed('  a, b  ')).toBe(false)
  expect(isHotkeyPressed(['a', 'b'])).toBe(false)
})

test.skip('should respect the delimiter option', async () => {
  const user = userEvent.setup()

  await user.keyboard('{B>}{,>}')

  expect(isHotkeyPressed(',')).toBe(false)
  expect(isHotkeyPressed(',', '+')).toBe(true)
  expect(isHotkeyPressed('b')).toBe(true)
  expect(isHotkeyPressed('b, a')).toBe(false)
  expect(isHotkeyPressed('ba,', 'a')).toBe(true)
  expect(isHotkeyPressed(['b', ','])).toBe(true)

  await user.keyboard('{/B}')

  expect(isHotkeyPressed(',')).toBe(false)
  expect(isHotkeyPressed(',', '+')).toBe(true)
  expect(isHotkeyPressed('b')).toBe(false)
  expect(isHotkeyPressed('b, a')).toBe(false)
  expect(isHotkeyPressed('ba,', 'a')).toBe(false)
  expect(isHotkeyPressed(['b', ','])).toBe(false)
})

test('Should clear pressed hotkeys when window blurs', async () => {
  const user = userEvent.setup()

  await user.keyboard('{Meta>}')

  expect(isHotkeyPressed('meta')).toBe(true)

  window.document.dispatchEvent(new Event("blur", {
    bubbles: true,
    cancelable: true
  }))

  expect(isHotkeyPressed('meta')).toBe(false)
})

test('Should return true for shift and 1 if shift+1 is held down, but not for ! as it is a produced key', async () => {
  const user = userEvent.setup()

  await user.keyboard('[ShiftLeft>]{1>}')

  expect(isHotkeyPressed('shift')).toBe(true)
  expect(isHotkeyPressed('1')).toBe(true)
  expect(isHotkeyPressed('!')).toBe(false)
})

test('Should clear pressed hotkeys when contextmenu opens', async () => {
  const user = userEvent.setup()

  await user.keyboard('{Meta>}')

  expect(isHotkeyPressed('meta')).toBe(true)

  window.document.dispatchEvent(new Event("contextmenu", {
    bubbles: true,
    cancelable: true
  }))

  // Stuck keys are cleared asynchronously for `contextmenu`. Must check after queue is clear.
  setTimeout(() => {
    expect(isHotkeyPressed('meta')).toBe(false)
  }, 0)
})