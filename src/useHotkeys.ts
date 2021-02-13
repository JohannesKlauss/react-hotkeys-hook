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

const isKeyboardEventTriggeredByInput = (ev: KeyboardEvent) => {
  return tagFilter(ev, ['INPUT', 'TEXTAREA', 'SELECT']);
};

export type Options = {
  filter?: typeof hotkeys.filter;
  filterPreventDefault?: boolean;
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

  const { enableOnTags, filter, keyup, keydown, filterPreventDefault = true } = options || {};
  const ref = useRef<T | null>(null);

  const memoisedCallback = useCallback((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
    if (filter && !filter(keyboardEvent)) {
      return !filterPreventDefault;
    }

    if (isKeyboardEventTriggeredByInput(keyboardEvent) && !tagFilter(keyboardEvent, enableOnTags)) {
      return true;
    }

    if (ref.current === null || document.activeElement === ref.current) {
      callback(keyboardEvent, hotkeysEvent);
      return true;
    }

    return false;
  }, deps ? [ref, enableOnTags, filter, ...deps] : [ref, enableOnTags, filter]);

  useEffect(() => {
    if (keyup && keydown !== true) {
      (options as Options).keydown = false;
    }

    hotkeys(keys, (options as Options) || {}, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options, keys]);

  return ref;
}