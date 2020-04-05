import hotkeys, {KeyHandler} from "hotkeys-js";
import {useCallback, useEffect, useMemo} from "react";

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
    if (options.enableOnTags) {
      hotkeys.filter = ({target, srcElement}) => {
        // @ts-ignore
        const targetTagName = (target && target.tagName) || (srcElement && srcElement.tagName);

        return Boolean(targetTagName && options.enableOnTags && options.enableOnTags.includes(targetTagName as AvailableTags));
      };
    }

    if (options.filter) hotkeys.filter = options.filter;

    hotkeys(keys, options, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options]);
}
