import { render, act, renderHook } from '@testing-library/react'
import { HotkeysProvider, useHotkeysContext, useHotkeys } from '../src'
import { ReactNode } from 'react'
import { HotkeysContextType } from '../src/HotkeysProvider'

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

  expect(result.current.enabledScopes).toEqual(['*'])
})

test('should default to wildcard scope if empty array is provided as initialActiveScopes', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={[]}>{children}</HotkeysProvider>
  )
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper,
  })

  expect(result.current.enabledScopes).toEqual(['*'])
})

test('should return active scopes and scope modifying functions', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  expect(result.current.enabledScopes).toEqual(['*'])
  expect(result.current.enableScope).toBeInstanceOf(Function)
  expect(result.current.disableScope).toBeInstanceOf(Function)
  expect(result.current.toggleScope).toBeInstanceOf(Function)
})

test('should activate scope by calling enableScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.enableScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['foo'])
})

test('should reactivate wildcard scope if all other scopes are deactivated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.enableScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['foo'])

  act(() => {
    result.current.disableScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['*'])
})

test('should return multiple scopes if different scopes are activated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.enableScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['foo'])

  act(() => {
    result.current.enableScope('bar')
  })

  expect(result.current.enabledScopes).toEqual(['foo', 'bar'])
})

test('should deactivate scope by calling disableScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.enableScope('foo')
  })

  act(() => {
    result.current.enableScope('bar')
  })

  expect(result.current.enabledScopes).toEqual(['foo', 'bar'])

  act(() => {
    result.current.disableScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['bar'])
})

test('should toggle scope by calling toggleScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.enableScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['foo'])

  act(() => {
    result.current.toggleScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['*'])

  act(() => {
    result.current.toggleScope('foo')
  })

  expect(result.current.enabledScopes).toEqual(['foo'])
})

test('should keep wildcard scope active when all is the only active scope and gets deactivated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.disableScope('*')
  })

  expect(result.current.enabledScopes).toEqual(['*'])
})

test('should return initially set scopes', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo', 'bar']}>{children}</HotkeysProvider>
  )
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper,
  })

  expect(result.current.enabledScopes).toEqual(['foo', 'bar'])
})

test('should return all bound hotkeys', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('a', () => null, { scopes: ['foo'] })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo']}>{children}</HotkeysProvider>
  )
  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })

  expect(result.current.hotkeys).toHaveLength(1)
})

test('should update bound hotkeys when useHotkeys changes its scopes', () => {
  const useIntegratedHotkeys = (scopes: string[]) => {
    useHotkeys('a', () => null, { scopes })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => {
    return <HotkeysProvider initiallyActiveScopes={['foo']}>{children}</HotkeysProvider>
  }

  const { result, rerender } = renderHook<HotkeysContextType, { scopes: string[] }>(
    ({ scopes }) => useIntegratedHotkeys(scopes),
    {
      // @ts-ignore
      wrapper,
      initialProps: {
        scopes: ['foo'],
      },
    }
  )

  expect(result.current.hotkeys).toHaveLength(1)

  rerender({ scopes: ['bar'] })

  expect(result.current.hotkeys).toHaveLength(0)
})

test('should return bound hotkeys when defined as a string array', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys(['a+c', 'b'], () => null, { scopes: ['foo'] })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo']}>{children}</HotkeysProvider>
  )
  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })
  expect(result.current.hotkeys[0].keys).toEqual(['a', 'c'])
  expect(result.current.hotkeys[1].keys).toEqual(['b'])
})

test('should return descriptions for bound hotkeys', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('a', () => null, { scopes: ['foo'], description: 'bar' })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo']}>{children}</HotkeysProvider>
  )
  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })

  expect(result.current.hotkeys[0].description).toEqual('bar')
})
