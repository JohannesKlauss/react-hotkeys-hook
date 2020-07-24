import hotkeys from "hotkeys-js";

export function useIsHotkeyPressed() {
  return hotkeys.isPressed;
}