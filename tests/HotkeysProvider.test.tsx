import { render } from '@testing-library/react'
import { HotkeysProvider, useHotkeysContext } from '../src/HotkeyProvider'
import { act, renderHook } from '@testing-library/react-hooks'
import { ReactNode } from 'react'

test('should render children', () => {
  const { getByText } = render(
    <HotkeysProvider>
      <div>Hello</div>
    </HotkeysProvider>
  )

  expect(getByText('Hello')).toBeInTheDocument()
})

test('should default to wildcard scope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should default to wildcard scope if empty array is provided as initialActiveScopes', () => {
  const wrapper = ({ children }: {children: ReactNode}) => <HotkeysProvider initialActiveScopes={[]}>{children}</HotkeysProvider>
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper,
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should return active scopes and scope modifying functions', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  expect(result.current.activeScopes).toEqual(['*'])
  expect(result.current.activateScope).toBeInstanceOf(Function)
  expect(result.current.deactivateScope).toBeInstanceOf(Function)
  expect(result.current.toggleScope).toBeInstanceOf(Function)
})

test('should activate scope by calling activateScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])
})

test('should reactivate wildcard scope if all other scopes are deactivated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])

  act(() => {
    result.current.deactivateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should return multiple scopes if different scopes are activated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])

  act(() => {
    result.current.activateScope('bar')
  })

  expect(result.current.activeScopes).toEqual(['foo', 'bar'])
})

test('should deactivate scope by calling deactivateScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  act(() => {
    result.current.activateScope('bar')
  })

  expect(result.current.activeScopes).toEqual(['foo', 'bar'])

  act(() => {
    result.current.deactivateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['bar'])
})

test('should toggle scope by calling toggleScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])

  act(() => {
    result.current.toggleScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['*'])

  act(() => {
    result.current.toggleScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])
})

test('should keep wildcard scope active when all is the only active scope and gets deactivated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.deactivateScope('*')
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should return initially set scopes', () => {
  const wrapper = ({ children }: {children: ReactNode}) => <HotkeysProvider initialActiveScopes={['foo', 'bar']}>{children}</HotkeysProvider>
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper,
  })

  expect(result.current.activeScopes).toEqual(['foo', 'bar'])
})

test.skip('should return currently active hotkeys', () => {})

test.skip('should return all bound hotkeys', () => {})
