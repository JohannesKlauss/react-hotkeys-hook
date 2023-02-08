import type { DependencyList } from 'react';
export declare type FormTags = 'input' | 'textarea' | 'select' | 'INPUT' | 'TEXTAREA' | 'SELECT';
export declare type Keys = string | string[];
export declare type Scopes = string | string[];
export declare type RefType<T> = T | null;
export declare type KeyboardModifiers = {
    alt?: boolean;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    mod?: boolean;
};
export declare type Hotkey = KeyboardModifiers & {
    keys?: string[];
    scopes?: Scopes;
};
export declare type HotkeysEvent = Hotkey & {};
export declare type HotkeyCallback = (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => void;
export declare type Trigger = boolean | ((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean);
export declare type Options = {
    enabled?: Trigger;
    enableOnFormTags?: FormTags[] | boolean;
    enableOnContentEditable?: boolean;
    combinationKey?: string;
    splitKey?: string;
    scopes?: Scopes;
    keyup?: boolean;
    keydown?: boolean;
    preventDefault?: Trigger;
    description?: string;
    document?: Document;
    ignoreModifiers?: boolean;
};
export declare type OptionsOrDependencyArray = Options | DependencyList;
