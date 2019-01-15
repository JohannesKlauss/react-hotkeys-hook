import hotkeys, {HotkeysEvent} from 'hotkeys-js';
import {useEffect} from "react";

export default function useHotKeys(keys: string, callback: (event: KeyboardEvent, handler: HotkeysEvent) => void) {
  useEffect(() => {
    hotkeys(keys, (event, handler) => callback(event, handler));

    return function cleanUp() {
      hotkeys.unbind(keys);
    }
  });
}
}