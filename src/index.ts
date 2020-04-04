import hotkeys, {KeyHandler} from "hotkeys-js";
import {useCallback, useEffect} from "react";

type AvailableTags = 'INPUT' | 'TEXTAREA' | 'SELECT';

type Options = {
  filter?: typeof hotkeys.filter;
  enableOnTags?: AvailableTags[];
  splitKey?: string;
  scope?: string;
  keyup?: boolean;
  keydown?: boolean;
};

export function useHotkeys(
  keys: string,
  callback: KeyHandler,
  options: Options = {},
  deps: any[] = [],
) {
  const memoisedCallback = useCallback(callback, deps);

  useEffect(() => {
    hotkeys.filter = ({target, srcElement}) => {
      if (options.enableOnTags) {
        // @ts-ignore
        const targetTagName = (target && target.tagName) || (srcElement && srcElement.tagName);

        return Boolean(targetTagName && options.enableOnTags.includes(targetTagName as AvailableTags));
      }

      return false;
    };

    if (options.filter) hotkeys.filter = options.filter;

    hotkeys(keys, options, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options]);
}
