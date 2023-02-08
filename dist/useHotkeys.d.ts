/// <reference types="react" />
import { HotkeyCallback, Keys, OptionsOrDependencyArray, RefType } from './types';
export default function useHotkeys<T extends HTMLElement>(keys: Keys, callback: HotkeyCallback, options?: OptionsOrDependencyArray, dependencies?: OptionsOrDependencyArray): import("react").MutableRefObject<RefType<T>>;
