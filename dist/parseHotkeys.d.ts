import { Hotkey, Keys } from './types';
export declare function mapKey(key: string): string;
export declare function isHotkeyModifier(key: string): boolean;
export declare function parseKeysHookInput(keys: Keys, splitKey?: string): string[];
export declare function parseHotkey(hotkey: string, combinationKey?: string): Hotkey;
