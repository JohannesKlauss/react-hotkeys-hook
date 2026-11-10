import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test } from 'vite-plus/test'
import ShortcutCue from '../components/ShortcutCue'

afterEach(cleanup)

test('pressing K while the shortcut is focused updates the result', async () => {
  const user = userEvent.setup()
  render(<ShortcutCue />)

  await user.tab()
  await user.keyboard('k')

  expect(screen.getByRole('status').textContent).toBe('1 press')
})

test('the shortcut follows the produced character on a different keyboard layout', () => {
  render(<ShortcutCue />)
  const button = screen.getByRole('button', { name: /try k/i })
  button.focus()

  fireEvent.keyDown(button, { key: 'k', code: 'KeyJ' })
  fireEvent.keyUp(button, { key: 'k', code: 'KeyJ' })

  expect(screen.getByRole('status').textContent).toBe('1 press')
})

test('clicking the shortcut button updates the result', async () => {
  const user = userEvent.setup()
  render(<ShortcutCue />)

  await user.click(screen.getByRole('button', { name: /try k/i }))

  expect(screen.getByRole('status').textContent).toBe('1 press')
})

test('pressing K elsewhere on the page updates the result', async () => {
  const user = userEvent.setup()
  render(
    <>
      <button type="button">Outside the demo</button>
      <ShortcutCue />
    </>,
  )

  await user.click(screen.getByRole('button', { name: 'Outside the demo' }))
  await user.keyboard('k')

  expect(screen.getByRole('status').textContent).toBe('1 press')
})

test('the global shortcut does not fire while typing in a text field', async () => {
  const user = userEvent.setup()
  render(
    <>
      <label>
        Search
        <input />
      </label>
      <ShortcutCue />
    </>,
  )

  await user.type(screen.getByRole('textbox', { name: 'Search' }), 'k')

  expect(screen.getByRole('status').textContent).toBe('0 presses')
})

test('the result does not say the shortcut is ready when it is off', async () => {
  const user = userEvent.setup()
  render(<ShortcutCue />)

  await user.click(screen.getByRole('switch', { name: 'Keyboard shortcut', checked: true }))

  expect(screen.getByText('The shortcut is off.')).not.toBeNull()
  expect(screen.queryByText('Your shortcut is ready.')).toBeNull()
})

test('the shortcut switch controls the global key without disabling the button', async () => {
  const user = userEvent.setup()
  render(<ShortcutCue />)
  const toggle = screen.getByRole('switch', { name: 'Keyboard shortcut', checked: true })

  await user.click(toggle)
  expect(screen.getByRole('switch', { name: 'Keyboard shortcut', checked: false })).not.toBeNull()

  await user.keyboard('k')
  expect(screen.getByRole('status').textContent).toBe('0 presses')

  await user.click(screen.getByRole('button', { name: /try k/i }))
  expect(screen.getByRole('status').textContent).toBe('1 press')

  await user.click(toggle)
  await user.keyboard('k')
  expect(screen.getByRole('status').textContent).toBe('2 presses')
})
