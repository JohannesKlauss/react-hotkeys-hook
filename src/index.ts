import useHotkeys from './useHotkeys'
import type { Options, Keys, HotkeyCallback } from './types'
import { HotkeysProvider, useHotkeysContext } from './HotkeysProvider'
import { isHotkeyPressed } from './isHotkeyPressed'
import useRecordHotkeys from './useRecordHotkeys'

export {
  useHotkeys,
  useRecordHotkeys,
  useHotkeysContext,
  isHotkeyPressed,
  HotkeysProvider,
  Options,
  Keys,
  HotkeyCallback,
}
