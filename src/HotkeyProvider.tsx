import { Hotkey } from './types'
import { createContext, ReactNode } from 'react'

type HotkeysContextType = {
  hotkeys: Hotkey[]
  activeScopes: string[]
  toggleScope: (scope: string) => void
  activateScope: (scope: string) => void
  deactivateScope: (scope: string) => void
}

const HotkeysContext = createContext<HotkeysContextType | undefined>(undefined)

interface Props {
  activeScopes: string[]
  children: ReactNode
}

export const HotkeysProvider = ({activeScopes = ['all'], children}: Props) => {
  return (
    <HotkeysContext.Provider value={{}}>
      {children}
    </HotkeysContext.Provider>
  )
}
