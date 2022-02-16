import { Hotkey } from './types'
import { createContext, ReactNode, useMemo, useState, useContext } from 'react'

type HotkeysContextType = {
  hotkeys: Hotkey[]
  activeScopes: string[]
  toggleScope: (scope: string) => void
  activateScope: (scope: string) => void
  deactivateScope: (scope: string) => void
}

const HotkeysContext = createContext<HotkeysContextType | undefined>(undefined)

interface Props {
  initialActiveScopes?: string[]
  children: ReactNode
}

export const useHotkeysContext = () => {
  const context = useContext(HotkeysContext)

  // The context is only needed for special features like global scoping, so we don't throw an error if it's not defined
  if (context === undefined) {
    return {
      hotkeys: [],
      activeScopes: [],
      toggleScope: () => {},
      activateScope: () => {},
      deactivateScope: () => {},
    }
  }

  return context
}

export const HotkeysProvider = ({initialActiveScopes = ['*'], children}: Props) => {
  const [activeScopes, setActiveScopes] = useState(initialActiveScopes?.length > 0 ? initialActiveScopes : ['*'])

  const isAllActive = useMemo(() => activeScopes.includes('*'), [activeScopes])

  const activateScope = (scope: string) => {
    if (isAllActive) {
      setActiveScopes([scope])
    } else {
      setActiveScopes([...activeScopes, scope])
    }
  }

  const deactivateScope = (scope: string) => {
    const scopes = activeScopes.filter(s => s !== scope)

    if (scopes.length === 0) {
      setActiveScopes(['*'])
    } else {
      setActiveScopes(scopes)
    }
  }

  const toggleScope = (scope: string) => {
    if (activeScopes.includes(scope)) {
      deactivateScope(scope)
    } else {
      activateScope(scope)
    }
  }

  return (
    <HotkeysContext.Provider value={{activeScopes, hotkeys: [], activateScope, deactivateScope, toggleScope}}>
      {children}
    </HotkeysContext.Provider>
  )
}
