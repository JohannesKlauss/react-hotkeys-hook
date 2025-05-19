import { type ReactNode, createContext, useContext, useMemo } from 'react'
import type { Hotkey } from './types'

type BoundHotkeysProxyProviderType = {
  addHotkey: (hotkey: Hotkey) => void
  removeHotkey: (hotkey: Hotkey) => void
}

const BoundHotkeysProxyProvider = createContext<BoundHotkeysProxyProviderType | undefined>(undefined)

export const useBoundHotkeysProxy = () => {
  return useContext(BoundHotkeysProxyProvider)
}

interface Props {
  children: ReactNode
  addHotkey: (hotkey: Hotkey) => void
  removeHotkey: (hotkey: Hotkey) => void
}

export default function BoundHotkeysProxyProviderProvider({ addHotkey, removeHotkey, children }: Props) {
  const value = useMemo<BoundHotkeysProxyProviderType>(() => ({ addHotkey, removeHotkey }), [addHotkey, removeHotkey])

  return <BoundHotkeysProxyProvider.Provider value={value}>{children}</BoundHotkeysProxyProvider.Provider>
}
