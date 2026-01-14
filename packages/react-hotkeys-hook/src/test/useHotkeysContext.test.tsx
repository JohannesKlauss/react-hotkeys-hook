import { renderHook } from '@testing-library/react'
import { HotkeysProvider, useHotkeysContext, useHotkeys } from '../lib'
import type { ReactNode } from 'react'
import { test, expect } from 'vitest'

test('should return hotkey with correct keys', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('ctrl+a', () => null)

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider>{children}</HotkeysProvider>
  )

  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })

  expect(result.current.hotkeys).toHaveLength(1)
  expect(result.current.hotkeys[0].hotkey).toEqual('ctrl+a')
})

test('should return hotkey with correct scope', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('ctrl+b', () => null, { scopes: ['scope'] })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['scope']}>{children}</HotkeysProvider>
  )

  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })

  expect(result.current.hotkeys).toHaveLength(1)
  expect(result.current.hotkeys[0].hotkey).toEqual('ctrl+b')
})

test('should not return hotkey with different scope', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('ctrl+b', () => null, { scopes: ['differentScope'] })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['scope']}>{children}</HotkeysProvider>
  )

  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })

  console.log(result.current.hotkeys)
  expect(result.current.hotkeys).toHaveLength(0)
})

test('should return hotkey with correct description and metadata', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('ctrl+c', () => null, {
      description: 'Copy text',
      metadata: { category: 'editing', priority: 'high' }
    })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider>{children}</HotkeysProvider>
  )

  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })

  expect(result.current.hotkeys).toHaveLength(1)
  expect(result.current.hotkeys[0].hotkey).toEqual('ctrl+c')
  expect(result.current.hotkeys[0].description).toEqual('Copy text')
  expect(result.current.hotkeys[0].metadata).toEqual({ category: 'editing', priority: 'high' })
})
