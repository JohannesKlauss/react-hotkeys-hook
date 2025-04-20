import { Hotkey } from './types'
import { createContext, ReactNode, useState, useContext, useCallback, useMemo } from 'react'
import deepEqual from './util/deepEqual'
import BoundHotkeysProxyProviderProvider from './BoundHotkeysProxyProvider'

export type HotkeysContextType = {
  hotkeys: ReadonlyArray<Hotkey>
  activeScopes: string[]
  toggleScope: (scope: string) => void
  enableScope: (scope: string) => void
  disableScope: (scope: string) => void
}

// The context is only needed for special features like global scoping, so we use a graceful default fallback
const HotkeysContext = createContext<HotkeysContextType>({
  hotkeys: [],
  activeScopes: [], // This array has to be empty instead of containing '*' as default, to check if the provider is set or not
  toggleScope: () => {},
  enableScope: () => {},
  disableScope: () => {},
})

export const useHotkeysContext = () => {
  return useContext(HotkeysContext)
}

interface Props {
  initiallyActiveScopes?: string[]
  children: ReactNode
}

export const HotkeysProvider = ({ initiallyActiveScopes = ['*'], children }: Props) => {
  const [internalActiveScopes, setInternalActiveScopes] = useState(initiallyActiveScopes)
  const [boundHotkeys, setBoundHotkeys] = useState<Hotkey[]>([])

  const enableScope = useCallback((scope: string) => {
    setInternalActiveScopes((prev) => {
      if (prev.includes('*')) {
        return [scope]
      }
      return Array.from(new Set([...prev, scope]))
    })
  }, [])

  const disableScope = useCallback((scope: string) => {
    setInternalActiveScopes((prev) => {
      return prev.filter((s) => s !== scope)
    })
  }, [])

  const toggleScope = useCallback((scope: string) => {
    setInternalActiveScopes((prev) => {
      if (prev.includes(scope)) {
        return prev.filter((s) => s !== scope)
      } else {
        if (prev.includes('*')) {
          return [scope]
        }
        return Array.from(new Set([...prev, scope]))
      }
    })
  }, [])

  const addBoundHotkey = useCallback((hotkey: Hotkey) => {
    setBoundHotkeys((prev) => [...prev, hotkey])
  }, [])

  const removeBoundHotkey = useCallback((hotkey: Hotkey) => {
    setBoundHotkeys((prev) => prev.filter((h) => !deepEqual(h, hotkey)))
  }, [])

  const hotkeysContextValue = useMemo<HotkeysContextType>(
    () => ({
      hotkeys: boundHotkeys,
      activeScopes: internalActiveScopes,
      enableScope,
      disableScope,
      toggleScope,
    }),
    [boundHotkeys, internalActiveScopes, enableScope, disableScope, toggleScope]
  )

  return (
    <HotkeysContext.Provider value={hotkeysContextValue}>
      <BoundHotkeysProxyProviderProvider addHotkey={addBoundHotkey} removeHotkey={removeBoundHotkey}>
        {children}
      </BoundHotkeysProxyProviderProvider>
    </HotkeysContext.Provider>
  )
}
