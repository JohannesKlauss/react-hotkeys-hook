import { renderHook } from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'
import { useHotkeys } from '../src/index'
import { HotkeyCallback, Keys, Options } from '../src/types'
import { DependencyList, MutableRefObject, ReactNode } from 'react'
import { HotkeysProvider } from '../src/HotkeyProvider'
import { createEvent, fireEvent } from '@testing-library/react'

const wrapper =
  (initialScopes: string[]) =>
  ({ children }: { children?: ReactNode }) =>
    <HotkeysProvider initialActiveScopes={initialScopes}>{children}</HotkeysProvider>

type HookParameters = {
  keys: Keys
  callback?: HotkeyCallback
  options?: Options
  dependencies?: DependencyList
}

test('should work without a wrapped context provider when not using scopes', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should log a warning when trying to set a scope without a wrapped provider', () => {
  console.warn = jest.fn()
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback, { scopes: 'foo' }))

  expect(console.warn).toHaveBeenCalledWith(
    'A hotkey has a set scopes options, although no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>'
  )
  expect(callback).not.toHaveBeenCalled()
})

test('should call hotkey when scopes are set but activatedScopes includes wildcard scope', () => {
  const callback = jest.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<HookParameters, void>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  render()

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should not call hotkey when scopes are set but activatedScopes does not include set scope', () => {
  const callback = jest.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<HookParameters, void>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  render(['bar'])

  userEvent.keyboard('A')

  expect(callback).not.toHaveBeenCalled()
})

test('should call hotkey when scopes are set and activatedScopes does include some set scopes', () => {
  const callback = jest.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<HookParameters, void>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  render(['foo'])

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should handle multiple scopes', () => {
  const callback = jest.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<HookParameters, void>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: ['foo', 'bar'] },
      },
    })

  render(['baz', 'bar'])

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should update call behavior when set scopes change', () => {
  const callback = jest.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<HookParameters, void>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  const { rerender } = render(['foo'])

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalled()

  rerender({ keys: 'a', options: { scopes: 'bar' } })

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('scope should take precedence over enabled flag/function', () => {
  const callback = jest.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<HookParameters, void>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'bar', enabled: true },
      },
    })

  const {rerender} = render(['foo'])

  userEvent.keyboard('A')

  expect(callback).not.toHaveBeenCalled()

  rerender({ keys: 'a', options: { scopes: 'foo', enabled: true } })

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

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

test('should default to keydown if neither keyup nor keydown is passed', () => {
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

test('should bind the event and execute the callback if enabled is set to a function and returns true', () => {
  const callback = jest.fn()

  const { rerender } = renderHook<HookParameters, void>(({ keys, options }) => useHotkeys(keys, callback, options), {
    initialProps: {
      keys: 'a',
      options: {
        enabled: () => true,
      },
    },
  })

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({
    keys: 'a',
    options: {
      enabled: () => false,
    },
  })

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({
    keys: 'a',
    options: {
      enabled: () => true,
    },
  })

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should return a ref', () => {
  const callback = jest.fn()

  const { result } = renderHook(() => useHotkeys('a', callback))

  expect(result.current).toBeDefined()
})

test.skip('should only trigger when the element is focused if a ref is set', () => {})

test.skip('should allow * as a wildcard', () => {})

test('should listen to function keys f1-f16', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('f1, f16', callback))

  userEvent.keyboard('{f1}')
  userEvent.keyboard('{f16}')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should allow named keys like arrow keys, space, enter, backspace, etc.', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('arrowUp, arrowDown, arrowLeft, arrowRight, space, enter, backspace', callback))

  userEvent.keyboard('{arrowUp}')
  userEvent.keyboard('{arrowDown}')
  userEvent.keyboard('{arrowLeft}')
  userEvent.keyboard('{arrowRight}')
  userEvent.keyboard('[Space]')
  userEvent.keyboard('{enter}')
  userEvent.keyboard('{backspace}')

  expect(callback).toHaveBeenCalledTimes(7)
})

test.skip('should trigger when used in portals', () => {})

test('should parse options and dependencies correctly no matter their position', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback, [true], { enabled: true }))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  renderHook(() => useHotkeys('b', callback, { enabled: true }, [true]))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)

  renderHook(() => useHotkeys('c', callback, [true], { enabled: false }))

  userEvent.keyboard('C')

  renderHook(() => useHotkeys('d', callback, { enabled: false }, [true]))

  userEvent.keyboard('D')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should pass keyboard event and hotkey object to callback', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    key: 'a',
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
    mod: false,
  })
})

test('should reflect preventDefault option when set', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback, { preventDefault: true }))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA'
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(true)
})

test('should not prevent default behavior when preventDefault option is not set', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA'
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(false)
})

test('should prevent default behavior if preventDefault option is set to a function that returns true', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback, { preventDefault: () => true }))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA'
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(true)
})

test('should not prevent default behavior if preventDefault option is set to a function that returns false', () => {
  const callback = jest.fn()

  renderHook(() => useHotkeys('a', callback, { preventDefault: () => false }))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA'
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(false)
})

test('should call preventDefault option function with hotkey and keyboard event', () => {
  const preventDefault = jest.fn()

  renderHook(() => useHotkeys('a', () => {}, { preventDefault}))

  userEvent.keyboard('A')

  expect(preventDefault).toHaveBeenCalledTimes(1)
  expect(preventDefault).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    key: 'a',
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
    mod: false,
  })
})

test.skip('should trigger on editable content tags if enableOnContentEditable is set to true', () => {})
