export default function useRecordHotkeys(): readonly [Set<string>, {
    readonly start: () => void;
    readonly stop: () => void;
    readonly isRecording: boolean;
}];
