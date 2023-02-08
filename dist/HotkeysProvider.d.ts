import { Hotkey } from './types';
import { ReactNode } from 'react';
export declare type HotkeysContextType = {
    hotkeys: ReadonlyArray<Hotkey>;
    enabledScopes: string[];
    toggleScope: (scope: string) => void;
    enableScope: (scope: string) => void;
    disableScope: (scope: string) => void;
};
export declare const useHotkeysContext: () => HotkeysContextType;
interface Props {
    initiallyActiveScopes?: string[];
    children: ReactNode;
}
export declare const HotkeysProvider: ({ initiallyActiveScopes, children }: Props) => JSX.Element;
export {};
