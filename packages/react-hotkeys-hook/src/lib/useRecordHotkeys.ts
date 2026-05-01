import { useCallback, useMemo, useState, useEffect } from 'react'
import { mapCode } from './parseHotkeys'

export default function useRecordHotkeys(useKey = false, blacklist: string[] = []) {
  const [keys, setKeys] = useState(new Set<string>())
  const [isRecording, setIsRecording] = useState(false)

  const blacklistSet = useMemo(() => {
    return new Set(blacklist.map((k) => k.toLowerCase()))
  }, [blacklist])

  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === undefined) {
        // Synthetic event (e.g., Chrome autofill). Ignore.
        return
      }

      const mappedKey = mapCode(useKey ? event.key : event.code).toLowerCase()

      // Do not interfere with keys present in the blacklist – allow them to work normally.
      if (blacklistSet.has(mappedKey)) {
        return
      }

      // Prevent the default behaviour for recorded keys so they don't interfere with the UI.
      event.preventDefault()
      event.stopPropagation()

      setKeys((prev) => {
        const newKeys = new Set(prev)

        newKeys.add(mappedKey)

        return newKeys
      })
    },
    [useKey, blacklistSet],
  )

  const stop = useCallback(() => {
    setIsRecording(false)
  }, [])

  const start = useCallback(() => {
    setKeys(new Set<string>())
    setIsRecording(true)
  }, [])

  const resetKeys = useCallback(() => {
    setKeys(new Set<string>())
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined' && isRecording) {
      document.addEventListener('keydown', handler)

      return () => {
        document.removeEventListener('keydown', handler)
      }
    }
  }, [isRecording, handler])

  return [keys, { start, stop, resetKeys, isRecording }] as const
}
