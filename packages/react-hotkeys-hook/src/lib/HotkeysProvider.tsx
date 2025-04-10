import { Hotkey } from './types'
import { createContext, ReactNode } from 'react'
import { useStore } from '@nanostores/react'
import { atom } from 'nanostores'

export type HotkeysContextType = {
  hotkeys: ReadonlyArray<Hotkey>
  activeScopes: string[]
  toggleScope: (scope: string) => void
  enableScope: (scope: string) => void
  disableScope: (scope: string) => void
}

export const $activeScopes = atom(['*'])
export const $hotkeys = atom<Hotkey[]>([])

function toggleScope(scope: string) {
  if ($activeScopes.value.includes(scope)) {
    $activeScopes.set($activeScopes.value.filter(s => s !== scope))
  } else {
    if ($activeScopes.value.includes('*')) {
      $activeScopes.set([scope])
    } else {
      $activeScopes.set(Array.from(new Set([...$activeScopes.value, scope])))
    }
  }
}

function enableScope(scope: string) {
  if ($activeScopes.value.includes('*')) {
    $activeScopes.set([scope])
  } else {
    $activeScopes.set(Array.from(new Set([...$activeScopes.value, scope])))
  }
}

function disableScope(scope: string) {
  $activeScopes.set($activeScopes.value.filter(s => s !== scope))
}

// The context is only needed for special features like global scoping, so we use a graceful default fallback
const HotkeysContext = createContext<HotkeysContextType>({
  hotkeys: [],
  activeScopes: ['*'],
  toggleScope,
  enableScope,
  disableScope,
})

export const useHotkeysContext = () => {
  const activeScopes = useStore($activeScopes)
  const hotkeys = useStore($hotkeys)

  return {
    activeScopes,
    hotkeys,
    toggleScope,
    enableScope,
    disableScope,
  }
}

interface Props {
  initiallyActiveScopes?: string[]
  children: ReactNode
}

/**
 * @deprecated Use the toggleScope, enableScope and disableScope functions instead.
 */
export const HotkeysProvider = ({ initiallyActiveScopes = ['*'], children }: Props) => {
  const activeScopes = useStore($activeScopes)
  const hotkeys = useStore($hotkeys)

  $activeScopes.set(initiallyActiveScopes)

  return (
    <HotkeysContext.Provider
      value={{ activeScopes, hotkeys, enableScope, disableScope, toggleScope }}
    >
      {children}
    </HotkeysContext.Provider>
  )
}
