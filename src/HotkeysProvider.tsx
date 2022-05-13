import { Hotkey } from './types'
import { createContext, ReactNode, useMemo, useState, useContext } from 'react'

type HotkeysContextType = {
  hotkeys: Hotkey[]
  activeScopes: string[]
  toggleScope: (scope: string) => void
  activateScope: (scope: string) => void
  deactivateScope: (scope: string) => void
}

// The context is only needed for special features like global scoping, so we use a graceful default fallback
const HotkeysContext = createContext<HotkeysContextType>({
  hotkeys: [],
  activeScopes: [],
  toggleScope: () => {},
  activateScope: () => {},
  deactivateScope: () => {},
})

interface Props {
  initiallyActiveScopes?: string[]
  children: ReactNode
}

export const useHotkeysContext = () => {
  return useContext(HotkeysContext)
}

export const HotkeysProvider = ({initiallyActiveScopes = ['*'], children}: Props) => {
  const [internalActiveScopes, setInternalActiveScopes] = useState(initiallyActiveScopes?.length > 0 ? initiallyActiveScopes : ['*'])

  const isAllActive = useMemo(() => internalActiveScopes.includes('*'), [internalActiveScopes])

  const activateScope = (scope: string) => {
    if (isAllActive) {
      setInternalActiveScopes([scope])
    } else {
      setInternalActiveScopes([...internalActiveScopes, scope])
    }
  }

  const deactivateScope = (scope: string) => {
    const scopes = internalActiveScopes.filter(s => s !== scope)

    if (scopes.length === 0) {
      setInternalActiveScopes(['*'])
    } else {
      setInternalActiveScopes(scopes)
    }
  }

  const toggleScope = (scope: string) => {
    if (internalActiveScopes.includes(scope)) {
      deactivateScope(scope)
    } else {
      activateScope(scope)
    }
  }

  return (
    <HotkeysContext.Provider value={{activeScopes: internalActiveScopes, hotkeys: [], activateScope, deactivateScope, toggleScope}}>
      {children}
    </HotkeysContext.Provider>
  )
}
