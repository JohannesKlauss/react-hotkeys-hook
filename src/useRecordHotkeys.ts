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

    event.preventDefault()
    event.stopPropagation()

    setKeys(prev => {
      const newKeys = new Set(prev)

      newKeys.add(mapKey(event.code))

      return newKeys
    })
  }, [])

  const stop = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', handler)

      setIsRecording(false)
    }
  }, [handler])

  const start = useCallback(() => {
    setKeys(new Set<string>())

    if (typeof document !== 'undefined') {
      stop()

      document.addEventListener('keydown', handler)

      setIsRecording(true)
    }
  }, [handler, stop])

  return [keys, { start, stop, isRecording }] as const
}
