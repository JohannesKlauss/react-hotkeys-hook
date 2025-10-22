import userEvent from '@testing-library/user-event'
import { useHotkeys, HotkeysProvider } from '../lib'
import type { FormTags, HotkeyCallback, Keys, Options } from '../lib/types'
import {
  type DependencyList,
  type JSXElementConstructor,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from 'react'
import { createEvent, fireEvent, render, screen, renderHook, within } from '@testing-library/react'
import {test, expect, beforeEach, vi} from 'vitest'

const wrapper =
  (initialScopes: string[]): JSXElementConstructor<{ children: ReactElement }> =>
    ({ children }: { children: ReactNode }) =>
      <HotkeysProvider initiallyActiveScopes={initialScopes}>{children}</HotkeysProvider>

type HookParameters = {
  keys: Keys
  callback?: HotkeyCallback
  options?: Options
  dependencies?: DependencyList
}

beforeEach(() => {
  window.dispatchEvent(new Event('DOMContentLoaded'))
  vi.useFakeTimers({
    shouldAdvanceTime: true,
  })
})

test('should listen to esc modifier for escape key', async () => {
  const user = userEvent.setup()

  const callback = vi.fn()

  renderHook(() => useHotkeys('esc', callback))

  await user.keyboard('{Escape}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should work without a wrapped context provider when not using scopes', async () => {
  const user = userEvent.setup()

  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should log a warning when trying to set a scope without a wrapped provider', async () => {
  console.warn = vi.fn()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { scopes: 'foo' }))

  expect(console.warn).toHaveBeenCalledWith(
    'A hotkey has the "scopes" option set, however no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>',
  )
  expect(callback).not.toHaveBeenCalled()
})

test('should call hotkey when scopes are set but activatedScopes includes wildcard scope', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  render()

  await user.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should not call hotkey when scopes are set but activatedScopes does not include set scope', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  render(['bar'])

  await user.keyboard('A')

  expect(callback).not.toHaveBeenCalled()
})

test('should call hotkey when scopes are set and activatedScopes does include some set scopes', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  render(['foo'])

  await user.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should handle multiple scopes', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: ['foo', 'bar'] },
      },
    })

  render(['baz', 'bar'])

  await user.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should update call behavior when set scopes change', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'foo' },
      },
    })

  const { rerender } = render(['foo'])

  await user.keyboard('A')

  expect(callback).toHaveBeenCalled()

  rerender({ keys: 'a', options: { scopes: 'bar' } })

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('scope should take precedence over enabled flag/function', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const render = (initialScopes: string[] = []) =>
    renderHook<void, HookParameters>(({ keys, options }) => useHotkeys(keys, callback, options), {
      wrapper: wrapper(initialScopes),
      initialProps: {
        keys: 'a',
        options: { scopes: 'bar', enabled: true },
      },
    })

  const { rerender } = render(['foo'])

  await user.keyboard('A')

  expect(callback).not.toHaveBeenCalled()

  rerender({ keys: 'a', options: { scopes: 'foo', enabled: true } })

  await user.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should listen to key presses', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should ignore unregistered key events', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback))

  await user.keyboard('B')

  expect(callback).not.toHaveBeenCalled()
})

test('should listen to multiple hotkeys', async () => {
  const user = userEvent.setup()

  const callback = vi.fn()

  renderHook(() => useHotkeys(['a', 'b'], callback))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('B')

  expect(callback).toHaveBeenCalledTimes(2)

  await user.keyboard('C')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should be able to always output correct keys on multiple hotkeys', async () => {
  const user = userEvent.setup()

  const callbackA = vi.fn()
  const callbackB = vi.fn()

  renderHook(() => useHotkeys(['a'], callbackA))
  renderHook(() => useHotkeys(['b'], callbackB))

  await user.keyboard('{A>}')

  expect(callbackA).toHaveBeenCalledTimes(1)

  await user.keyboard('B')
  expect(callbackA).toHaveBeenCalledTimes(1)
  expect(callbackB).toHaveBeenCalledTimes(1)

  await user.keyboard('C')

  expect(callbackA).toHaveBeenCalledTimes(1)
  expect(callbackB).toHaveBeenCalledTimes(1)

  await user.keyboard('B')
  expect(callbackA).toHaveBeenCalledTimes(1)
  expect(callbackB).toHaveBeenCalledTimes(2)

  await user.keyboard('{/A}')
  expect(callbackA).toHaveBeenCalledTimes(1)
  expect(callbackB).toHaveBeenCalledTimes(2)
})

test('should be able to parse first argument as string, array or readonly array', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const { rerender } = renderHook<void, HookParameters>(({ keys }) => useHotkeys(keys, callback), {
    initialProps: {
      keys: 'a, b',
    },
  })

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({ keys: ['a', 'b'] })

  await user.keyboard('B')

  expect(callback).toHaveBeenCalledTimes(2)

  rerender({ keys: ['a', 'c'] as const })

  await user.keyboard('C')

  expect(callback).toHaveBeenCalledTimes(3)
})

test('should listen to combinations with modifiers', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const { rerender } = renderHook<void, HookParameters>(({ keys }) => useHotkeys(keys, callback), {
    initialProps: {
      keys: 'meta+a',
    },
  })

  await user.keyboard('{Meta>}A{/Meta}')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({ keys: 'meta+shift+a' })

  await user.keyboard('{Meta}A{/Meta}')
  await user.keyboard('{Meta>}{Shift>}A{/Shift}{/Meta}')

  expect(callback).toHaveBeenCalledTimes(2)

  rerender({ keys: 'meta+shift+alt+a' })

  await user.keyboard('{Meta>}{Alt>}{Shift>}A{/Shift}{/Alt}{/Meta}')

  expect(callback).toHaveBeenCalledTimes(3)
})

test('should not trigger when combinations are incomplete', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(['meta+a'], callback))

  await user.keyboard('{Meta}')

  expect(callback).not.toHaveBeenCalled()
})

test('should trigger on combinations without modifiers', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a+b+c', callback))

  await user.keyboard('{A>}{B>}C{/B}{/A}')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('{A>}B{/A}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should listen to multiple combinations with modifiers', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const { rerender } = renderHook(() => useHotkeys('meta+shift+a, alt+b', callback))

  await user.keyboard('{Meta>}{Shift>}A{/Shift}{/Meta}')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender(() => useHotkeys('meta+shift+alt+a', callback))

  await user.keyboard('{Alt>}B{/Alt}')

  expect(callback).toHaveBeenCalledTimes(2)

  // Assert the leading space from alt+b is dropped
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['b'],
    shift: false,
    ctrl: false,
    alt: true,
    meta: false,
    mod: false,
    useKey: false,
    isSequence: false,
    hotkey: 'alt+b',
  })
})

test('should listen to sequences', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const { rerender } = renderHook<void, HookParameters>(({ keys }) => useHotkeys(keys, callback), {
    initialProps: {
      keys: 'y>e>e>t',
    },
  })

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('t')

  expect(callback).toHaveBeenCalledTimes(1)

  vi.runAllTimers()

  rerender({ keys: 'y>e>e>t' })

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('t')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should not trigger when sequence is incomplete', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('y>e>e>t', callback))

  await user.keyboard('y')
  vi.advanceTimersByTime(500)
  await user.keyboard('e')
  vi.advanceTimersByTime(500)
  await user.keyboard('e')
  vi.advanceTimersByTime(500)

  expect(callback).not.toHaveBeenCalled()
})

test('should not trigger when sequence and combination are mixed', async () => {
  console.warn = vi.fn()
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('y>e+e>t', callback))

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('t')

  expect(console.warn).toHaveBeenCalledWith(
    'Hotkey y>e+e>t contains both + and > which is not supported.',
  )

  expect(callback).not.toHaveBeenCalled()
})

test('should work with sequences and other hotkeys together', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook<void, HookParameters>(({ keys }) => useHotkeys(keys, callback), {
    initialProps: {
      keys: ['y>e>e>t', 'y', 'meta+a'],
    },
  })

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('t')

  expect(callback).toHaveBeenCalledTimes(2)

  await user.keyboard('{Meta>}A{/Meta}')

  expect(callback).toHaveBeenCalledTimes(3)
})

test('should reset sequence when timeout occurs', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('y>e>e>t', callback))

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(1100)

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('t')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should handle component unmount during sequence detection', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const { unmount } = renderHook(() => useHotkeys('y>e>e>t', callback))

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')

  unmount()

  vi.advanceTimersByTime(1100)
})

test('should reset sequence when incorrect key is pressed', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('y>e>e>t', callback))

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('x')
  vi.advanceTimersByTime(200)
  await user.keyboard('t')

  expect(callback).not.toHaveBeenCalled()

  vi.runAllTimers()

  await user.keyboard('y')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('e')
  vi.advanceTimersByTime(200)
  await user.keyboard('t')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should trigger sequence with useKey', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('%>!', callback, { useKey: true }))

  await user.keyboard(`{Shift>}{%}{/Shift}`)
  vi.advanceTimersByTime(200)
  await user.keyboard(`{Shift>}{!}{/Shift}`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should not trigger sequence without useKey', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('%>!', callback, { useKey: false }))

  await user.keyboard(`{Shift>}{%}{/Shift}`)
  vi.advanceTimersByTime(200)
  await user.keyboard(`{Shift>}{!}{/Shift}`)

  expect(callback).toHaveBeenCalledTimes(0)
})

test('should reflect set delimiter character', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const { rerender } = renderHook<MutableRefObject<HTMLElement | null>, HookParameters>(
    ({ keys, options }) => useHotkeys(keys, callback, options),
    {
      initialProps: { keys: 'a, b', options: undefined },
    },
  )

  await user.keyboard('A')
  await user.keyboard('B')

  expect(callback).toHaveBeenCalledTimes(2)

  rerender({ keys: 'f. shift+g', options: { delimiter: '.' } })

  await user.keyboard('F')
  await user.keyboard('{Shift>}G{/Shift}')

  expect(callback).toHaveBeenCalledTimes(4)
})

test('should listen to + if the splitKey is set to something different then +', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('+', callback, { splitKey: '-', useKey: true }))

  await user.keyboard('+')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should default to keydown if neither keyup nor keydown is passed', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('shift', callback))

  await user.keyboard('{Shift>}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should not listen to keyup if keydown is passed', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('shift', callback, { keydown: true }))

  await user.keyboard('{Shift>}')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('{/Shift}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should not listen to keydown if keyup is passed', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { keyup: true }))

  await user.keyboard('{A>}')

  expect(callback).toHaveBeenCalledTimes(0)

  await user.keyboard('{/A}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should trigger on named keys when keyup is set to true', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('shift', callback, { keyup: true }))

  await user.keyboard('{Shift>}')

  expect(callback).toHaveBeenCalledTimes(0)

  await user.keyboard('{/Shift}')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should trigger twice if keyup and keydown are passed', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('A', callback, { keyup: true, keydown: true }))

  await user.keyboard('{A}')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should be disabled on form tags by default', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    useHotkeys<HTMLDivElement>('a', cb)

    return <input type={'text'} data-testid={'form-tag'} />
  }

  const { getByTestId } = render(<Component cb={callback} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('form-tag'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(getByTestId('form-tag')).toHaveValue('A')
})

test('should be disabled on aria form roles by default', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const formCallback = vi.fn()
  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    useHotkeys<HTMLDivElement>('a', cb)

    return <div role={'searchbox'} tabIndex={0} onKeyDown={formCallback} data-testid={'form-tag'} />
  }

  const { getByTestId } = render(<Component cb={callback} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('form-tag'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(formCallback).toHaveBeenCalledTimes(1)
})

test('should be enabled on given form tags', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, enableOnFormTags }: { cb: HotkeyCallback; enableOnFormTags?: readonly FormTags[] }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags })

    return <input type={'text'} data-testid={'form-tag'} />
  }

  const { getByTestId } = render(<Component cb={callback} enableOnFormTags={['INPUT']} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('form-tag'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
  expect(getByTestId('form-tag')).toHaveValue('A')
})

test('should ignore case of form tags', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, enableOnFormTags }: { cb: HotkeyCallback; enableOnFormTags?: FormTags[] }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags })

    return <input type={'text'} data-testid={'form-tag'} />
  }

  const { getByTestId } = render(<Component cb={callback} enableOnFormTags={['input']} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('form-tag'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
  expect(getByTestId('form-tag')).toHaveValue('A')
})

test('should ignore event when ignoreEventWhen\'s condition matches', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, ignoreEventWhen }: {
    cb: HotkeyCallback;
    ignoreEventWhen?: (e: KeyboardEvent) => boolean
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { ignoreEventWhen })

    return <button className='ignore' data-testid={'test-button'} />
  }

  const eventCondition = (e: KeyboardEvent) => {
    const element = e.target as HTMLElement

    return element.className === 'ignore'
  }

  const { getByTestId } = render(<Component cb={callback} ignoreEventWhen={eventCondition} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('test-button'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('shouldn\'t ignore event when ignoreEventWhen\'s condition doesn\'t match', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, ignoreEventWhen }: {
    cb: HotkeyCallback;
    ignoreEventWhen?: (e: KeyboardEvent) => boolean
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { ignoreEventWhen })

    return <button className='dont-ignore' data-testid={'test-button'} />
  }

  const eventCondition = (e: KeyboardEvent) => {
    const element = e.target as HTMLElement

    return element.className === 'ignore'
  }

  const { getByTestId } = render(<Component cb={callback} ignoreEventWhen={eventCondition} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('test-button'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should call ignoreEventWhen callback only when event is a hotkey match', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, ignoreEventWhen }: {
    cb: HotkeyCallback;
    ignoreEventWhen?: (e: KeyboardEvent) => boolean
  }) => {
    useHotkeys<HTMLDivElement>('a', cb, { ignoreEventWhen })

    return <button className='ignore' data-testid={'test-button'} />
  }

  const { getByTestId } = render(<Component cb={vi.fn()} ignoreEventWhen={callback} />)

  await user.keyboard('X')

  expect(callback).not.toHaveBeenCalled()

  await user.click(getByTestId('test-button'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('enabledOnTags should accept boolean', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, enableOnFormTags }: { cb: HotkeyCallback; enableOnFormTags?: FormTags[] | boolean }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags })

    return <input type={'text'} data-testid={'form-tag'} />
  }

  const { getByTestId } = render(<Component cb={callback} enableOnFormTags />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('form-tag'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
  expect(getByTestId('form-tag')).toHaveValue('A')
})

test('should prevent pressed down key propagate to input field when preventDefault is set to true and form tag is enabled', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, enableOnFormTags }: { cb: HotkeyCallback; enableOnFormTags?: FormTags[] }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags, preventDefault: true })

    return <input type={'text'} data-testid={'form-tag'} />
  }

  const { getByTestId } = render(<Component cb={callback} enableOnFormTags={['INPUT']} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(getByTestId('form-tag'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
  expect(getByTestId('form-tag')).toHaveValue('')
})

test('should be disabled on all other tags by default', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()
  const Component = ({ cb, enableOnFormTags }: { cb: HotkeyCallback; enableOnFormTags?: FormTags[] }) => {
    useHotkeys<HTMLDivElement>('a', cb, { enableOnFormTags })

    return (
      <>
        <input type={'text'} data-testid={'form-tag'} />
        <textarea />
      </>
    )
  }

  const { getByTestId } = render(<Component cb={callback} enableOnFormTags={['TEXTAREA']} />)

  await user.click(getByTestId('form-tag'))
  await user.keyboard('A')

  expect(callback).not.toHaveBeenCalled()
  expect(getByTestId('form-tag')).toHaveValue('A')
})

test('should not bind the event if enabled is set to false', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { enabled: false }))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(0)
})

test('should bind the event and trigger if enabled is set to true', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { enabled: true }))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should bind the event and execute the callback if enabled is set to a function and returns true', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const { rerender } = renderHook<void, HookParameters>(({ keys, options }) => useHotkeys(keys, callback, options), {
    initialProps: {
      keys: 'a',
      options: {
        enabled: () => true,
      },
    },
  })

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({
    keys: 'a',
    options: {
      enabled: () => false,
    },
  })

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  rerender({
    keys: 'a',
    options: {
      enabled: () => true,
    },
  })

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should return a ref', async () => {
  const callback = vi.fn()

  const { result } = renderHook(() => useHotkeys('a', callback))

  expect(result.current).toBeDefined()
})

test('should only trigger when the element is focused if a ref is set', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    const ref = useHotkeys<HTMLDivElement>('a', cb)

    return (
      <div ref={ref} tabIndex={0} data-testid={'div'}>
        <input type={'text'} />
      </div>
    )
  }

  const { getByTestId } = render(<Component cb={callback} />)

  await user.keyboard('A')

  expect(callback).not.toHaveBeenCalled()

  await user.click(getByTestId('div'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test.skip('should preventDefault and stop propagation when ref is not focused', async () => {
  const callback = vi.fn()

  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    const ref = useHotkeys<HTMLDivElement>('a', cb)

    return (
      <div tabIndex={-1} data-testid={'div'}>
        <div ref={ref} tabIndex={-1} data-testid={'ref'}>
          <span>Example text</span>
        </div>
      </div>
    )
  }

  render(<Component cb={vi.fn()} />)

  await userEvent.click(screen.getByTestId('div'))

  await userEvent.keyboard('A')

  expect(callback).not.toHaveBeenCalled()

  await userEvent.click(screen.getByTestId('ref'))

  await userEvent.keyboard('A')

  expect(callback).toHaveBeenCalled()
})

test('should allow * as a wildcard', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('*', callback))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should listen to function keys f1-f16', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('f1, f16', callback))

  await user.keyboard('[F1]')
  await user.keyboard('[F16]')

  expect(callback).toHaveBeenCalledTimes(2)
})

test.each([
  'arrowUp',
  'arrowDown',
  'arrowLeft',
  'arrowRight',
  'space',
  'enter',
  'backspace',
])('should allow named key %s', async (key) => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(key, callback))

  await user.keyboard(key === 'space' ? '[Space]' : `{${key}}`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test.skip('should trigger when used in portals', async () => {
})

test('should parse options and dependencies correctly no matter their position', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, [true], { enabled: true }))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  renderHook(() => useHotkeys('b', callback, { enabled: true }, [true]))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)

  renderHook(() => useHotkeys('c', callback, [true], { enabled: false }))

  await user.keyboard('C')

  renderHook(() => useHotkeys('d', callback, { enabled: false }, [true]))

  await user.keyboard('D')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should pass keyboard event and hotkey object to callback', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback))

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
    mod: false,
    useKey: false,
    isSequence: false,
    hotkey: 'a',
  })
})

test('should set shift to true in hotkey object if listening to shift', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('shift+a', callback))

  await user.keyboard('{Shift>}A{/Shift}')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: true,
    ctrl: false,
    alt: false,
    meta: false,
    mod: false,
    useKey: false,
    isSequence: false,
    hotkey: 'shift+a',
  })
})

test('should set ctrl to true in hotkey object if listening to ctrl', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('ctrl+a', callback))

  await user.keyboard('{Control>}A{/Control}')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: false,
    ctrl: true,
    alt: false,
    meta: false,
    mod: false,
    useKey: false,
    isSequence: false,
    hotkey: 'ctrl+a',
  })
})

test('should set alt to true in hotkey object if listening to alt', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('alt+a', callback))

  await user.keyboard('{Alt>}A{/Alt}')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: false,
    ctrl: false,
    alt: true,
    meta: false,
    mod: false,
    useKey: false,
    isSequence: false,
    hotkey: 'alt+a',
  })
})

test('should set mod to true in hotkey object if listening to mod', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('mod+a', callback))

  await user.keyboard('{Meta>}A{/Meta}')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
    mod: true,
    useKey: false,
    isSequence: false,
    hotkey: 'mod+a',
  })
})

test('should set meta to true in hotkey object if listening to meta', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('meta+a', callback))

  await user.keyboard('{Meta>}A{/Meta}')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: false,
    ctrl: false,
    alt: false,
    meta: true,
    mod: false,
    useKey: false,
    isSequence: false,
    hotkey: 'meta+a',
  })
})

test('should set multiple modifiers to true in hotkey object if listening to multiple modifiers', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('mod+shift+a', callback))

  await user.keyboard('{Meta>}{Shift>}A{/Shift}{/Meta}')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: true,
    alt: false,
    ctrl: false,
    meta: false,
    mod: true,
    useKey: false,
    isSequence: false,
    hotkey: 'mod+shift+a',
  })
})

test('should stop propagation when enabled function resolves to false', async () => {
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { enabled: () => false }))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  })

  fireEvent(document, keyDownEvent)

  expect(keyDownEvent.defaultPrevented).toBe(true)
})

test('should reflect preventDefault option when set', async () => {
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { preventDefault: true }))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(true)
})

test('should not prevent default behavior when preventDefault option is not set', async () => {
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(false)
})

test('should prevent default behavior if preventDefault option is set to a function that returns true', async () => {
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { preventDefault: () => true }))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(true)
})

test('should not prevent default behavior if preventDefault option is set to a function that returns false', async () => {
  const callback = vi.fn()

  renderHook(() => useHotkeys('a', callback, { preventDefault: () => false }))

  const keyDownEvent = createEvent.keyDown(document, {
    key: 'A',
    code: 'KeyA',
  })

  fireEvent(document, keyDownEvent)

  expect(callback).toHaveBeenCalledTimes(1)
  expect(keyDownEvent.defaultPrevented).toBe(false)
})

test('should call preventDefault option function with hotkey and keyboard event', async () => {
  const user = userEvent.setup()
  const preventDefault = vi.fn()

  renderHook(() => useHotkeys('a', async () => {
  }, { preventDefault }))

  await user.keyboard('A')

  expect(preventDefault).toHaveBeenCalledTimes(1)
  expect(preventDefault).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    keys: ['a'],
    shift: false,
    alt: false,
    ctrl: false,
    meta: false,
    mod: false,
    useKey: false,
    isSequence: false,
    hotkey: 'a',
  })
})

test('Should listen to space key', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('space', callback))

  await user.keyboard(' ')

  expect(callback).toHaveBeenCalledTimes(1)
})

test.each([
  ['esc', 'Escape'],
  ['return', 'Enter'],
  ['left', 'ArrowLeft'],
  ['up', 'ArrowUp'],
  ['right', 'ArrowRight'],
  ['down', 'ArrowDown'],
])('Should map key %s to %s', async (hotkey, keyboardKey) => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(hotkey, callback))

  await user.keyboard(`{${keyboardKey}}`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test.each(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])(`Should listen to number key %s`, async (key) => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(`shift+${key}`, callback))

  await user.keyboard(`{Shift>}${key}{/Shift}`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test('should not call callback if meta is held down but other key is not present in combination is pressed', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(`meta+z`, callback))

  await user.keyboard(`{Meta>}Z`)

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('Z')

  expect(callback).toHaveBeenCalledTimes(2)

  await user.keyboard('F{/Meta}')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('should listen to keydown permanently', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('A', callback, { keyup: true, keydown: true }))

  await user.keyboard('{A}')
  await user.keyboard('{A}')

  expect(callback).toHaveBeenCalledTimes(4)
})

test('Should test for modifiers by default', async () => {
  const user = userEvent.setup()

  const callback = vi.fn()

  renderHook(() => useHotkeys('shift+d', callback))

  await user.keyboard('{Shift>}d{/Shift}')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('d')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('Should ignore modifiers if option is set', async () => {
  const user = userEvent.setup()

  const callback = vi.fn()

  renderHook(() => useHotkeys('d', callback, { ignoreModifiers: true }))

  await user.keyboard('{Shift>}d{/Shift}')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('d')

  expect(callback).toHaveBeenCalledTimes(2)
})

test("Should test for modifiers when useKey is true", async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('meta+.', callback, { useKey: true }))
  renderHook(() => useHotkeys('shift+a', callback, { useKey: true }))

  await user.keyboard('{Meta>}.{/Meta}')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('.')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.keyboard('{Shift>}a{/Shift}')

  expect(callback).toHaveBeenCalledTimes(2)

  await user.keyboard('a')

  expect(callback).toHaveBeenCalledTimes(2)
});


test('should respect dependencies array if they are passed', async () => {
  function Fixture() {
    const [count, setCount] = useState(0)

    const incrementCount = useCallback(() => {
      setCount(count + 1)
    }, [count])

    useHotkeys('esc', incrementCount, [])

    return <div>{count}</div>
  }

  const user = userEvent.setup()

  const { getByText } = render(<Fixture />)

  expect(getByText('0')).not.toBeNull()

  await user.keyboard('{Escape}')
  await user.keyboard('{Escape}')

  expect(getByText('1')).not.toBeNull()
})

test('should use updated callback if no dependencies are passed', async () => {
  function Fixture() {
    const [count, setCount] = useState(0)

    const incrementCount = useCallback(() => {
      setCount(count + 1)
    }, [count])

    useHotkeys('esc', incrementCount)

    return <div>{count}</div>
  }

  const user = userEvent.setup()

  const { getByText } = render(<Fixture />)

  expect(getByText('0')).not.toBeNull()

  await user.keyboard('{Escape}')
  await user.keyboard('{Escape}')

  expect(getByText('2')).not.toBeNull()
})

test('Should trigger only callback for combination', async () => {
  const user = userEvent.setup()

  const combinationsCallback = vi.fn()
  const keysCallback = vi.fn()

  const handleHotkey: HotkeyCallback = (_, hotkeysEvent) => {
    const { meta, keys } = hotkeysEvent
    if (meta && keys && keys[0] === 'z') {
      combinationsCallback()
    } else if (!meta && keys && keys[0] === 'z') {
      keysCallback()
    }
  }

  renderHook(() => useHotkeys([`meta+z`, `z`], handleHotkey))

  await user.keyboard(`{Meta>}Z`)

  expect(combinationsCallback).toHaveBeenCalledTimes(1)
  expect(keysCallback).toHaveBeenCalledTimes(0)
})

test.each(['Shift', 'Alt', 'Meta', 'Ctrl', 'Control'])('Should listen to %s on keyup', async (key) => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(key, callback, { keyup: true }))

  await user.keyboard(`{${key === 'Ctrl' ? 'Control' : key}}`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test('Should listen to produced key and not to code', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys('!', callback))

  await user.keyboard(`{Shift>}{!}{/Shift}`)

  expect(callback).toHaveBeenCalledTimes(0)

  renderHook(() => useHotkeys('shift+1', callback))

  await user.keyboard(`{Shift>}{1}{/Shift}`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test('Should not check produced key if useKey is not set', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(`=`, callback))

  await user.keyboard(`=`)

  expect(callback).toHaveBeenCalledTimes(0)
})

test('Should check produced key if useKey is true', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  renderHook(() => useHotkeys(`=`, callback, { useKey: true }))

  await user.keyboard(`=`)

  expect(callback).toHaveBeenCalledTimes(1)
})

test('Should remove listener on AbortSignal', async () => {
  const abortController = new AbortController()
  const { signal } = abortController

  function Fixture() {
    const [count, setCount] = useState(0)

    const incrementCount = useCallback(() => {
      setCount(count + 1)
    }, [count])

    useHotkeys('esc', incrementCount, { eventListenerOptions: { signal } })

    return <div>{count}</div>
  }

  const user = userEvent.setup()

  const { getByText } = render(<Fixture />)

  expect(getByText('0')).not.toBeNull()

  await user.keyboard('{Escape}')
  await user.keyboard('{Escape}')
  abortController.abort()
  await user.keyboard('{Escape}')

  expect(getByText('2')).not.toBeNull()
})

test('should be disabled on form tags inside custom elements by default', async () => {
  const user = userEvent.setup()
  const callback = vi.fn()

  customElements.define(
    "custom-input",
    class extends HTMLElement {
      constructor() {
        super();

        const inputEle = document.createElement("input");
        inputEle.setAttribute("type", "text");
        inputEle.setAttribute("data-testid", "input");

        const shadowRoot = this.attachShadow({
          mode: "open"
        });

        shadowRoot.appendChild(inputEle);
      }
    },
  );

  const Component = ({ cb }: { cb: HotkeyCallback }) => {
    useHotkeys<HTMLDivElement>('a', cb)

    return <custom-input data-testid={'form-tag'}/>
  }

  const { getByTestId } = render(<Component cb={callback} />)

  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)

  await user.click(within(getByTestId('form-tag').shadowRoot).getByTestId('input'))
  await user.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(within(getByTestId('form-tag').shadowRoot).getByTestId('input')).toHaveValue('A')
})

test('Should trigger only produced key hotkeys', async () => {
  const user = userEvent.setup()

  const callbackZ = vi.fn()
  const callbackY = vi.fn()

  renderHook(() => useHotkeys(['z'], callbackZ, {useKey: true}))
  renderHook(() => useHotkeys(['y'], callbackY, {useKey: true}))

  await user.keyboard('Z')
  expect(callbackZ).toHaveBeenCalledTimes(1)
  expect(callbackY).toHaveBeenCalledTimes(0)

  await user.keyboard('Y')
  expect(callbackZ).toHaveBeenCalledTimes(1)
  expect(callbackY).toHaveBeenCalledTimes(1)

  await user.keyboard('W')

  expect(callbackZ).toHaveBeenCalledTimes(1)
  expect(callbackY).toHaveBeenCalledTimes(1)

  await user.keyboard('Y')
  expect(callbackZ).toHaveBeenCalledTimes(1)
  expect(callbackY).toHaveBeenCalledTimes(2)
})