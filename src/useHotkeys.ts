import hotkeys, { HotkeysEvent, KeyHandler } from 'hotkeys-js';
import React, { useCallback, useEffect, useRef } from 'react';

type AvailableTags = 'INPUT' | 'TEXTAREA' | 'SELECT';

// We implement our own custom filter system.
hotkeys.filter = () => true;

const tagFilter = ({ target, srcElement }: KeyboardEvent, enableOnTags?: AvailableTags[]) => {
  // @ts-ignore
  const targetTagName = (target && target.tagName) || (srcElement && srcElement.tagName);

  return Boolean(targetTagName && enableOnTags && enableOnTags.includes(targetTagName as AvailableTags));
};

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

  const { enableOnTags, filter, keyup, keydown } = options || {};
  const ref = useRef<T | null>(null);

  const memoisedCallback = useCallback((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
    if (filter && !filter(keyboardEvent)) {
      return false;
    }

    if (options && (options as Options).enableOnTags && !tagFilter(keyboardEvent, (options as Options).enableOnTags)) {
      return false;
    }

    if (ref.current === null || document.activeElement === ref.current) {
      callback(keyboardEvent, hotkeysEvent);
      return true;
    }

    return false;
  }, deps ? [ref, ...deps] : [ref]);

  useEffect(() => {
    if (keyup && keydown !== true) {
      (options as Options).keydown = false;
    }

    hotkeys(keys, (options as Options) || {}, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options, enableOnTags, filter, keys]);

  return ref;
}