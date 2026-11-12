import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vite-plus/test'
import Root from '../theme/Root'

afterEach(() => {
  cleanup()
  document.head.querySelector('script[data-sdkn="@vercel/analytics/react"]')?.remove()
})

test('loads Vercel Analytics alongside documentation pages', () => {
  render(
    <Root>
      <main>Documentation</main>
    </Root>,
  )

  expect(screen.getByRole('main').textContent).toBe('Documentation')
  expect(document.head.querySelectorAll('script[data-sdkn="@vercel/analytics/react"]')).toHaveLength(1)
})
