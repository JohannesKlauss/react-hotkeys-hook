import React, { useCallback, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import styles from './ShortcutCue.module.css'

export default function ShortcutCue() {
  const [count, setCount] = useState(0)
  const [shortcutEnabled, setShortcutEnabled] = useState(true)
  const resultMessage = count === 0 ? 'Your shortcut is ready.' : 'The callback ran in React.'
  const activate = useCallback(() => setCount((current) => current + 1), [])
  useHotkeys('k', activate, { useKey: true, enabled: shortcutEnabled })

  return (
    <section className={styles.sheet} aria-label="Try a keyboard shortcut">
      <div className={styles.grid}>
        <div className={styles.cell}>
          <span className={styles.label}>Your key</span>
          <div className={styles.keyRow}>
            <button
              className={styles.key}
              type="button"
              onClick={activate}
              aria-label="Try K shortcut"
              aria-describedby="shortcut-cue-help"
              aria-keyshortcuts={shortcutEnabled ? 'K' : undefined}
            >
              K
            </button>
            <div>
              <p id="shortcut-cue-help" className={styles.hint}>
                {shortcutEnabled ? 'Press K anywhere, or tap the key.' : 'Shortcut off. Tap the key to try it.'}
              </p>
              <button
                className={styles.shortcutToggle}
                type="button"
                role="switch"
                aria-label="Keyboard shortcut"
                aria-checked={shortcutEnabled}
                onClick={() => setShortcutEnabled((enabled) => !enabled)}
              >
                <span className={styles.toggleTrack} aria-hidden="true">
                  <span className={styles.toggleThumb} />
                </span>
                Shortcut: {shortcutEnabled ? 'on' : 'off'}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.cell}>
          <span className={styles.label}>The hook</span>
          <pre className={styles.code} aria-label="Shortcut hook example">
            <code>
              <span className={styles.function}>useHotkeys</span>(<span className={styles.string}>'k'</span>, activate,{' '}
              {'{'}
              {'\n  '}useKey: <span className={styles.keyword}>true</span>,{'\n  '}enabled: shortcutEnabled,{'\n})'}
            </code>
          </pre>
          <p className={styles.hint}>One hook connects the key to your action.</p>
        </div>
        <div className={styles.cell}>
          <span className={styles.label}>The result</span>
          <div className={styles.result} role="status" aria-live="polite">
            {count} {count === 1 ? 'press' : 'presses'}
          </div>
          <p className={styles.hint}>{shortcutEnabled ? resultMessage : 'The shortcut is off.'}</p>
        </div>
      </div>
    </section>
  )
}
