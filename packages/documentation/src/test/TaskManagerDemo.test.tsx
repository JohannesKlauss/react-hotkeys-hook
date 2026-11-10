import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import TaskManagerDemo from '../components/TaskManagerDemo'

vi.mock('@docusaurus/theme-common', () => ({
  usePrismTheme: () => ({ plain: { color: '#f3efe9', backgroundColor: '#15171c' }, styles: [] }),
}))

afterEach(cleanup)

test('keyboard focus can leave the live editor and reach the preview', async () => {
  const user = userEvent.setup()
  render(<TaskManagerDemo />)
  const preview = await screen.findByRole('region', { name: /task preview/i })
  const editor = screen.getByRole('textbox', { name: /edit the task manager example/i })

  // jsdom does not make contenteditable elements focusable by default.
  editor.setAttribute('tabindex', '0')
  editor.focus()
  expect(document.activeElement).toBe(editor)
  await user.tab()

  expect(document.activeElement).toBe(preview)
})

test('the task shortcut follows the produced character on a different keyboard layout', async () => {
  render(<TaskManagerDemo />)
  const preview = await screen.findByRole('region', { name: /task preview/i })
  preview.focus()

  fireEvent.keyDown(preview, { key: 'n', code: 'KeyB' })
  fireEvent.keyUp(preview, { key: 'n', code: 'KeyB' })

  expect(within(preview).getByText('New task')).not.toBeNull()
})

test('new tasks are exposed as live additions to assistive technology', async () => {
  render(<TaskManagerDemo />)
  const preview = await screen.findByRole('region', { name: /task preview/i })
  const list = within(preview).getByRole('list')

  expect(list.getAttribute('aria-live')).toBe('polite')
  expect(list.getAttribute('aria-relevant')).toBe('additions')
})
