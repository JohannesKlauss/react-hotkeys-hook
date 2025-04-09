import type { DependencyList } from 'react'

export type FormTags = 'input' | 'textarea' | 'select' | 'INPUT' | 'TEXTAREA' | 'SELECT'
export type Keys = string | readonly string[]
export type Scopes = string | readonly string[]

export type RefType<T> = T | null

export type EventListenerOptions =
  | {
      capture?: boolean
      once?: boolean
      passive?: boolean
      signal?: AbortSignal
    }
  | boolean // useCapture

export type KeyboardModifiers = {
  alt?: boolean
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  mod?: boolean
}

export type Hotkey = KeyboardModifiers & {
  keys?: readonly string[]
  scopes?: Scopes
  description?: string
  hotkey: string
}

export type HotkeysEvent = Hotkey

export type HotkeyCallback = (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => void

export type Trigger = boolean | ((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean)

export type Options = {
  enabled?: Trigger // Main setting that determines if the hotkey is enabled or not. (Default: true)
  enableOnFormTags?: readonly FormTags[] | boolean // Enable hotkeys on a list of tags. (Default: false)
  enableOnContentEditable?: boolean // Enable hotkeys on tags with contentEditable props. (Default: false)
  ignoreEventWhen?: (e: KeyboardEvent) => boolean // Ignore evenets based on a condition (Default: undefined)
  combinationKey?: string // Character to split keys in hotkeys combinations. (Default: +)
  splitKey?: string // Character to separate different hotkeys. (Default: ,)
  scopes?: Scopes // Scope
  keyup?: boolean // Trigger on keyup event? (Default: undefined)
  keydown?: boolean // Trigger on keydown event? (Default: true)
  preventDefault?: Trigger // Prevent default browser behavior? (Default: false)
  description?: string // Use this option to describe what the hotkey does. (Default: undefined)
  document?: Document // Listen to events on the document instead of the window. (Default: false)
  ignoreModifiers?: boolean // Ignore modifiers when matching hotkeys. (Default: false)
  eventListenerOptions?: EventListenerOptions // Passthrough event listener options. (Default: false)
}

export type OptionsOrDependencyArray = Options | DependencyList
