import { renderHook } from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'
import { useHotkeys } from '../src/index'
import { HotkeyCallback, Keys, Options } from '../src/types'
import { DependencyList, MutableRefObject } from 'react'

type HookParameters = {
  keys: Keys
  callback?: HotkeyCallback
  options?: Options
  dependencies?: DependencyList
}

test.skip('should work without a wrapped context provider when not using scopes', () => {})

test.skip('should throw a warning when trying to set a scope without a wrapped provider', () => {})

test.skip('should respect enabled and disabled scopes', () => {})

test.skip('scope should take precedence over enabled flag/function', () => {})

test('should listen to key presses', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should ignore unregistered key events', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback))

  userEvent.keyboard('B')

  expect(callback).not.toHaveBeenCalled()
})

test('should listen to multiple hotkeys', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys(['a', 'b'], callback))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  userEvent.keyboard('B')

  expect(callback).toHaveBeenCalledTimes(2)

  userEvent.keyboard('C')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should be able to parse first argument as string or array', () => {
  const callback = jest.fn()

  const { rerender } = renderHook<HookParameters, void>(({ keys }) => useHotkeys(keys, callback), {
    initialProps: {
      keys: 'a, b',
    },
  })

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({ keys: ['a', 'b'] })

  userEvent.keyboard('B')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should listen to combinations with modifiers', () => {
  const callback = jest.fn()

  const { rerender } = renderHook<HookParameters, void>(({ keys }) => useHotkeys(keys, callback), {
    initialProps: {
      keys: 'ctrl+a',
    },
  })

  userEvent.keyboard('{ctrl}A{/ctrl}')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({ keys: 'ctrl+shift+a' })

  userEvent.keyboard('{ctrl}A{/ctrl}')
  userEvent.keyboard('{ctrl}{shift>}A{/shift}{/ctrl}')

  expect(callback).toHaveBeenCalledTimes(2)

  rerender({ keys: 'ctrl+shift+alt+a' })

  userEvent.keyboard('{ctrl}{alt}{shift}A{/shift}{/alt}{/ctrl}')

  expect(callback).toHaveBeenCalledTimes(3)
})

test('should listen to multiple combinations with modifiers', () => {
  const callback = jest.fn()

  const { rerender } = renderHook(() => useHotkeys('ctrl+shift+a, alt+b', callback))

  userEvent.keyboard('{ctrl}{shift}A{/shift}{/ctrl}')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender(() => useHotkeys('ctrl+shift+alt+a', callback))

  userEvent.keyboard('{alt}B{/alt}')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should reflect set splitKey character', () => {
  const callback = jest.fn()

  const { rerender } = renderHook<HookParameters, MutableRefObject<HTMLElement | null>>(
    ({ keys, options }) => useHotkeys(keys, callback, options),
    {
      initialProps: { keys: 'a, b', options: undefined },
    }
  )

  userEvent.keyboard('A')
  userEvent.keyboard('B')

  expect(callback).toHaveBeenCalledTimes(2)

  rerender({ keys: 'f. shift+g', options: { splitKey: '.' } })

  userEvent.keyboard('F')
  userEvent.keyboard('{shift}G{/shift}')

  expect(callback).toHaveBeenCalledTimes(4)
})

test('should listen to + if the combinationKey is set to something different then +', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('shift-+', callback, { combinationKey: '-' }))

  userEvent.keyboard('{shift}+{/shift}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test.skip('should default to keydown if neither keyup nor keydown is passed', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('shift', callback))

  userEvent.keyboard('{shift>}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should not listen to keyup if keydown is passed', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('shift', callback, { keydown: true }))

  userEvent.keyboard('{shift>}')

  expect(callback).toHaveBeenCalledTimes(1)

  userEvent.keyboard('{/shift}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should not listen to keydown if keyup is passed', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('shift', callback, { keyup: true }))

  userEvent.keyboard('{shift>}')

  expect(callback).toHaveBeenCalledTimes(0)

  userEvent.keyboard('{shift>}{/shift}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should trigger twice if keyup and keydown are passed', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('shift', callback, { keyup: true, keydown: true }))

  const keyboardState = userEvent.keyboard('{shift>}')

  expect(callback).toHaveBeenCalledTimes(1)

  userEvent.keyboard('{/shift}', { keyboardState })

  expect(callback).toHaveBeenCalledTimes(2)
})

test.skip('should be disabled on form tags by default', () => {})

test.skip('should be enabled on given form tags', () => {})

test.skip('should be disabled on all other tags by default', () => {})

test('should not bind the event if enabled is set to false', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback, { enabled: false }))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(0)
})

test('should bind the event and trigger if enabled is set to true', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback, { enabled: true }))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test.skip('should bind the event and execute the callback if enabled is set to a function and returns true', () => {})

test.skip('should bind the event and not execute the callback if enabled is set to a function and returns false', () => {})

test.skip('should return a ref', () => {})

test.skip('should only trigger when the element is focused if a ref is set', () => {})

test.skip('should allow * as a wildcard', () => {})

test.skip('should allow f keys with f1-f16', () => {})

test.skip('should allow named keys like arrow keys, delete, space, enter, backspace, etc.', () => {})

test.skip('should trigger when used in portals', () => {})

test.skip('should parse options and dependencies correctly no matter there position', () => {})

test.skip('should pass keyboard event to callback', () => {})

test.skip('should pass hotkeys event to callback', () => {})

test.skip('should reflect preventDefault option when set', () => {})

test.skip('should trigger on editable content tags if enableOnContentEditable is set to true', () => {})
