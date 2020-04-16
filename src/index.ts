import hotkeys, {KeyHandler} from "hotkeys-js";
import {useCallback, useEffect, useMemo} from "react";

type AvailableTags = 'INPUT' | 'TEXTAREA' | 'SELECT';

export type Options = {
  filter?: typeof hotkeys.filter;
  enableOnTags?: AvailableTags[];
  splitKey?: string;
  scope?: string;
  keyup?: boolean;
  keydown?: boolean;
};

export function useHotkeys(keys: string, callback: KeyHandler, options?: Options): void;
export function useHotkeys(keys: string, callback: KeyHandler, deps?: any[]): void;
export function useHotkeys(keys: string, callback: KeyHandler, options?: Options, deps?: any[]): void;
export function useHotkeys(keys: string, callback: KeyHandler, options?: any[] | Options, deps?: any[]): void {
  if (options instanceof Array) {
    deps = options;
    options = undefined;
  }

  const {enableOnTags, filter} = options || {};

  const memoisedCallback = useCallback(callback, deps || []);

  useEffect(() => {
    if (options && (options as Options).enableOnTags) {
      hotkeys.filter = ({target, srcElement}) => {
        // @ts-ignore
        const targetTagName = (target && target.tagName) || (srcElement && srcElement.tagName);

        return Boolean(targetTagName && enableOnTags && enableOnTags.includes(targetTagName as AvailableTags));
      };
    }

    if (filter) hotkeys.filter = filter;

    hotkeys(keys, (options as Options) || {}, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options]);
}
