import { useCallback, useState } from 'react'
import { mapKey } from './parseHotkeys'

export default function useRecordHotkeys() {
  const [keys, setKeys] = useState(new Set<string>())
  const [isRecording, setIsRecording] = useState(false);

  const handler = useCallback((event: KeyboardEvent) => {
    if (event.key === undefined) {
      // Synthetic event (e.g., Chrome autofill).  Ignore.
      return
    }

    setKeys(prev => {
      const newKeys = new Set(prev)

      newKeys.add(mapKey(event.code))

      return newKeys
    })
  }, [])

  const start = useCallback(() => {
    setKeys(new Set<string>())

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handler)

      setIsRecording(true)
    }
  }, [handler])

  const stop = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', handler)

      setIsRecording(false)
    }
  }, [handler])

  return [keys, { start, stop, isRecording }] as const
}
