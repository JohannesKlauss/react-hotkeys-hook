import { KeyHandler } from 'hotkeys-js';
import React, { useContext, useEffect } from 'react';
import { Options, useHotkeys } from './useHotkeys';

type KeyMap = {
    keys: string,
    group?: string,
    desc?: string,
}
const KeyMapsContext = React.createContext<KeyMap[]>([]);
export function useRegisteredHotkeys<T extends Element>(
    keyMap: KeyMap,
    callback: KeyHandler,
    options?: Options,
    deps?: any[]): React.MutableRefObject<T | null> {
    const keyMaps = useContext(KeyMapsContext);

    useEffect(() => {
        function register(keyMap: KeyMap) {
            if (keyMaps.map(keyMap => keyMap.keys).includes(keyMap.keys)) {
                throw new Error('Duplicate Hot Key detected: ' + keyMap.keys + ':' + keyMap.desc);
            }
            keyMaps.push(keyMap);
        }
        register(keyMap);
        return () => { };
    }, []);

    return useHotkeys(keyMap.keys, callback, options, deps);
}