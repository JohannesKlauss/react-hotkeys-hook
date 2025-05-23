import type { Hotkey, KeyboardModifiers } from "./types";

const reservedModifierKeywords = [
    "shift",
    "alt",
    "meta",
    "mod",
    "ctrl",
    "control",
    "capslock",
];

const mappedKeys: Record<string, string> = {
    esc: "escape",
    return: "enter",
    ctl: "ctrl",
    control: "ctrl",
    caps: "capslock",
    left: "arrowleft",
    right: "arrowright",
    up: "arrowup",
    down: "arrowdown",
    ShiftLeft: "shift",
    ShiftRight: "shift",
    AltLeft: "alt",
    AltRight: "alt",
    MetaLeft: "meta",
    MetaRight: "meta",
    OSLeft: "meta",
    OSRight: "meta",
    ControlLeft: "ctrl",
    ControlRight: "ctrl",
};

export function mapCode(key: string): string {
    return (mappedKeys[key.trim()] || key.trim())
        .toLowerCase()
        .replace(/key|digit|numpad/, "");
}

export function isHotkeyModifier(key: string) {
    return reservedModifierKeywords.includes(key);
}

export function parseKeysHookInput(keys: string, delimiter = ","): string[] {
    return keys.toLowerCase().split(delimiter);
}

export function parseHotkey(
  hotkey: string,
  splitKey = '+',
  sequenceSplitKey = '>',
  useKey = false,
  description?: string,
  metadata?: Record<string, unknown>,
): Hotkey {
  let keys: string[] = []
  let isSequence = false

  // hotkey might contain a leading space from eg. `ctrl+a, shift+a`
  // biome-ignore lint/style/noParameterAssign: Sanitation of args variable
  hotkey = hotkey.trim()

    if (hotkey.includes(sequenceSplitKey)) {
        isSequence = true;
        splitKey = sequenceSplitKey;
    }

    keys = hotkey
        .toLocaleLowerCase()
        .split(splitKey)
        .map((k) => mapCode(k));

    const modifiers: KeyboardModifiers = {
        alt: keys.includes("alt"),
        ctrl: keys.includes("ctrl") || keys.includes("control"),
        shift: keys.includes("shift"),
        meta: keys.includes("meta"),
        mod: keys.includes("mod"),
        useKey,
    };

    const singleCharKeys = !isSequence
        ? keys.filter((k) => !reservedModifierKeywords.includes(k))
        : keys;

  return {
    ...modifiers,
    keys: singleCharKeys,
    description,
    isSequence,
    hotkey,
    metadata,
  }
}
