import { Hotkey } from './types'
import { createContext, ReactNode, useMemo, useState, useContext } from 'react'
import BoundHotkeysProxyProviderProvider from './BoundHotkeysProxyProvider'

type HotkeysContextType = {
  hotkeys: ReadonlyArray<Hotkey>
  activeScopes: string[]
  toggleScope: (scope: string) => void
  activateScope: (scope: string) => void
  deactivateScope: (scope: string) => void
}

// The context is only needed for special features like global scoping, so we use a graceful default fallback
const HotkeysContext = createContext<HotkeysContextType>({
  hotkeys: [],
  activeScopes: [], // This array has to be empty to check if the provider is set or not
  toggleScope: () => {},
  activateScope: () => {},
  deactivateScope: () => {},
})

export const useHotkeysContext = () => {
  return useContext(HotkeysContext)
}

interface Props {
  initiallyActiveScopes?: string[]
  children: ReactNode
}

export const HotkeysProvider = ({initiallyActiveScopes = ['*'], children}: Props) => {
  const [internalActiveScopes, setInternalActiveScopes] = useState(initiallyActiveScopes?.length > 0 ? initiallyActiveScopes : ['*'])
  const [boundHotkeys, setBoundHotkeys] = useState<Hotkey[]>([]);

  const isAllActive = useMemo(() => internalActiveScopes.includes('*'), [internalActiveScopes])

  const activateScope = (scope: string) => {
    if (isAllActive) {
      setInternalActiveScopes([scope])
    } else {
      setInternalActiveScopes(Array.from(new Set([...internalActiveScopes, scope])))
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

  const addBoundHotkey = (hotkey: Hotkey) => {
    setBoundHotkeys([...boundHotkeys, hotkey])
  }

  const removeBoundHotkey = (hotkey: Hotkey) => {
    setBoundHotkeys(boundHotkeys.filter(h => h.keys !== hotkey.keys))
  }

  return (
    <HotkeysContext.Provider value={{activeScopes: internalActiveScopes, hotkeys: boundHotkeys, activateScope, deactivateScope, toggleScope}}>
      <BoundHotkeysProxyProviderProvider addHotkey={addBoundHotkey} removeHotkey={removeBoundHotkey}>
        {children}
      </BoundHotkeysProxyProviderProvider>
    </HotkeysContext.Provider>
  )
}
