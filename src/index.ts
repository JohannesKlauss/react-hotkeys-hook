import hotkeys, {HotkeysEvent, KeyHandler} from "hotkeys-js";
import React, {useCallback, useEffect, useRef} from "react";
import ReactDOM from 'react-dom';

type AvailableTags = 'INPUT' | 'TEXTAREA' | 'SELECT';

export type Options = {
  filter?: typeof hotkeys.filter;
  enableOnTags?: AvailableTags[];
  splitKey?: string;
  scope?: string;
  keyup?: boolean;
  keydown?: boolean;
};

export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, options?: Options): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, deps?: any[]): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, options?: Options, deps?: any[]): React.MutableRefObject<T | null>;
export function useHotkeys<T extends Element>(keys: string, callback: KeyHandler, options?: any[] | Options, deps?: any[]): React.MutableRefObject<T | null> {
  if (options instanceof Array) {
    deps = options;
    options = undefined;
  }
  const {enableOnTags, filter} = options || {};

  const ref = useRef<T | null>(null);

  const memoisedCallback = useCallback((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
    if (ref.current === null || document.activeElement === ReactDOM.findDOMNode(ref.current)) {
      callback(keyboardEvent, hotkeysEvent);
      return true;
    }

    return false;
  }, deps ? [ref, ...deps] : [ref]);

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
  }, [memoisedCallback, options, enableOnTags, filter, keys]);

  return ref;
}