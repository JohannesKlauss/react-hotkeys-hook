import { useHotkeys, Options } from './useHotkeys';
import hotkeys from 'hotkeys-js';

const isHotkeyPressed = hotkeys.isPressed;

export { useHotkeys, isHotkeyPressed, Options };
