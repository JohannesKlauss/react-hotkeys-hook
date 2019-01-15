import { HotkeysEvent } from 'hotkeys-js';
export default function useHotKeys(keys: string, callback: (event: KeyboardEvent, handler: HotkeysEvent) => void): void;
