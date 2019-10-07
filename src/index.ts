import hotkeys, { HotkeysEvent } from 'hotkeys-js';
import { useCallback, useEffect } from 'react';

type CallbackFn = (event: KeyboardEvent, handler: HotkeysEvent) => void;
type TagNames = 'INPUT' | 'TEXTAREA' | 'SELECT';

export function useHotkeys(
  keys: string,
  callback: CallbackFn,
  deps: any[] = [],
  tagNames?: TagNames[],
) {
  const memoisedCallback = useCallback(callback, deps);

  useEffect(() => {
    // Enable hotkeys for INPUT/SELECT/TEXTAREA elements
    // https://github.com/jaywcjlove/hotkeys#filter
    hotkeys.filter = ({ target, srcElement }) => {
      if (tagNames) {
        const targetTagName = (target && target.tagName) || (srcElement && srcElement.tagName);
        return Boolean(targetTagName && tagNames.includes(targetTagName as TagNames));
      }
      return false;
    };
    hotkeys(keys, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback]);
}
