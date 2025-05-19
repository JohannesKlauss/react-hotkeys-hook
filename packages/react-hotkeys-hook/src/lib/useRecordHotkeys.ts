import { useCallback, useState } from 'react';
import { mapCode } from './parseHotkeys';

export default function useRecordHotkeys(useKey = false) {
  const [keys, setKeys] = useState(new Set<string>());
  const [isRecording, setIsRecording] = useState(false);

  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setKeys((prev) => {
        const newKeys = new Set(prev);

        newKeys.add(mapCode(useKey ? event.key : event.code));

        return newKeys;
      });
    },
    [useKey],
  );

  const stop = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', handler);

      setIsRecording(false);
    }
  }, [handler]);

  const start = useCallback(() => {
    setKeys(new Set<string>());

    if (typeof document !== 'undefined') {
      stop();

      document.addEventListener('keydown', handler);

      setIsRecording(true);
    }
  }, [handler, stop]);

  const resetKeys = useCallback(() => {
    setKeys(new Set<string>());
  }, []);

  return [keys, { start, stop, resetKeys, isRecording }] as const;
}
