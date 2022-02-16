import type { DependencyList } from 'react'

export type FormTags = 'INPUT' | 'TEXTAREA' | 'SELECT'
export type Keys = string | string[]
export type Scopes = string | string[]

export type RefType<T> = T | null

export type KeyboardModifiers = {
  alt?: boolean
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  mod?: boolean
}

export type Hotkey = KeyboardModifiers & {
  key?: string
  scopes?: Scopes
}

export type HotkeysEvent = Hotkey & {}

export type HotkeyCallback = (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => void

export type Trigger = boolean | ((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean)

export type Options = {
  enabled?: Trigger // Main setting that determines if the hotkey is enabled or not. (Default: true)
  enableOnTags?: FormTags[] // Enable hotkeys on a list of tags. (Default: [])
  enableOnContentEditable?: boolean // Enable hotkeys on tags with contentEditable props. (Default: false)
  combinationKey?: string // Character to split keys in hotkeys combinations. (Default: +)
  splitKey?: string // Character to separate different hotkeys. (Default: ,)
  scopes?: Scopes // Scope
  keyup?: boolean // Trigger on keyup event? (Default: undefined)
  keydown?: boolean // Trigger on keydown event? (Default: true)
  preventDefault?: Trigger // Prevent default browser behavior? (Default: true)
  description?: string // Use this option to describe what the hotkey does. (Default: undefined)
}

export type OptionsOrDependencyArray = Options | DependencyList
