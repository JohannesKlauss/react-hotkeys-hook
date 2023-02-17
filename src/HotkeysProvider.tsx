import { Hotkey } from './types'
import { createContext, ReactNode, useState, useContext, useCallback } from 'react'
import BoundHotkeysProxyProviderProvider from './BoundHotkeysProxyProvider'
import deepEqual from './deepEqual'

export type HotkeysContextType = {
  hotkeys: ReadonlyArray<Hotkey>
  enabledScopes: string[]
  toggleScope: (scope: string) => void
  enableScope: (scope: string) => void
  disableScope: (scope: string) => void
}

// The context is only needed for special features like global scoping, so we use a graceful default fallback
const HotkeysContext = createContext<HotkeysContextType>({
  hotkeys: [],
  enabledScopes: [], // This array has to be empty instead of containing '*' as default, to check if the provider is set or not
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
  const [internalActiveScopes, setInternalActiveScopes] = useState(
    initiallyActiveScopes?.length > 0 ? initiallyActiveScopes : ['*']
  )
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
      if (prev.filter((s) => s !== scope).length === 0) {
        return ['*']
      } else {
        return prev.filter((s) => s !== scope)
      }
    })
  }, [])

  const toggleScope = useCallback((scope: string) => {
    setInternalActiveScopes((prev) => {
      if (prev.includes(scope)) {
        if (prev.filter((s) => s !== scope).length === 0) {
          return ['*']
        } else {
          return prev.filter((s) => s !== scope)
        }
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

  return (
    <HotkeysContext.Provider
      value={{ enabledScopes: internalActiveScopes, hotkeys: boundHotkeys, enableScope, disableScope, toggleScope }}
    >
      <BoundHotkeysProxyProviderProvider addHotkey={addBoundHotkey} removeHotkey={removeBoundHotkey}>
        {children}
      </BoundHotkeysProxyProviderProvider>
    </HotkeysContext.Provider>
  )
}
