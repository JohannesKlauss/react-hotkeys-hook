import hotkeys, {HotkeysEvent} from 'hotkeys-js';
import {useEffect} from "react";

export function useHotkeys(keys: string, callback: (event: KeyboardEvent, handler: HotkeysEvent) => void) {
  useEffect(() => {
    console.log('calling bind');
    hotkeys(keys, (event, handler) => {
      console.log('callback gets called');
      callback(event, handler);
    });

    return function () {
      console.log('calling unbind');
      hotkeys.unbind(keys);
    }
  }, []);
}