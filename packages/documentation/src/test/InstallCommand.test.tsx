import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import InstallCommand from '../components/InstallCommand'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('starts with pnpm and lists package managers in the preferred order', () => {
  render(<InstallCommand />)

  expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual([
    'pnpm',
    'bun',
    'npm',
    'yarn',
  ])
  expect(screen.getByRole('radio', { name: 'pnpm' })).toHaveProperty('checked', true)
  expect(screen.getByText('pnpm add react-hotkeys-hook')).not.toBeNull()
})

test('copies the install command and confirms success', async () => {
  const user = userEvent.setup()
  render(<InstallCommand />)

  await user.click(screen.getByRole('button', { name: 'Copy install command' }))

  expect(await navigator.clipboard.readText()).toBe('pnpm add react-hotkeys-hook')
  expect(screen.getByRole('status').textContent).toBe('Copied')
})

test.each([
  ['pnpm', 'pnpm add react-hotkeys-hook'],
  ['bun', 'bun add react-hotkeys-hook'],
  ['npm', 'npm install react-hotkeys-hook'],
  ['yarn', 'yarn add react-hotkeys-hook'],
])('shows and copies the %s install command', async (manager, command) => {
  const user = userEvent.setup()
  render(<InstallCommand />)

  await user.click(screen.getByRole('radio', { name: manager }))
  expect(screen.getByText(command)).not.toBeNull()
  expect(screen.getByRole('radio', { name: manager })).toHaveProperty('checked', true)

  await user.click(screen.getByRole('button', { name: 'Copy install command' }))
  expect(await navigator.clipboard.readText()).toBe(command)
})

test('package managers can be selected with the keyboard', async () => {
  // jsdom omits CSS.escape, which user-event uses for native radio groups.
  vi.stubGlobal('CSS', { escape: (value: string) => value.replace(/[^\w-]/g, '\\$&') })
  const user = userEvent.setup()
  render(<InstallCommand />)

  await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'pnpm' }))
  await user.keyboard('{ArrowRight}')

  expect(screen.getByRole('radio', { name: 'bun' })).toHaveProperty('checked', true)
  expect(screen.getByText('bun add react-hotkeys-hook')).not.toBeNull()
})

test('changing package manager clears the previous copy confirmation', async () => {
  const user = userEvent.setup()
  render(<InstallCommand />)

  await user.click(screen.getByRole('button', { name: 'Copy install command' }))
  expect(screen.getByRole('status').textContent).toBe('Copied')

  await user.click(screen.getByRole('radio', { name: 'bun' }))
  expect(screen.getByRole('status').textContent).toBe('')
})

test('explains how to copy when clipboard access fails', async () => {
  const user = userEvent.setup()
  vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('Clipboard unavailable'))
  render(<InstallCommand />)

  await user.click(screen.getByRole('button', { name: 'Copy install command' }))

  expect(screen.getByRole('status').textContent).toBe('Copy failed. Select the command to copy it.')
})
