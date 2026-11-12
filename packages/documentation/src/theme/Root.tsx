import React from 'react'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'

export default function Root({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
