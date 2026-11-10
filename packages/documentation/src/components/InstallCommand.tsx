import React, { useId, useState } from 'react'
import styles from './InstallCommand.module.css'

const PACKAGE_MANAGERS = [
  { name: 'pnpm', command: 'pnpm add react-hotkeys-hook' },
  { name: 'bun', command: 'bun add react-hotkeys-hook' },
  { name: 'npm', command: 'npm install react-hotkeys-hook' },
  { name: 'yarn', command: 'yarn add react-hotkeys-hook' },
] as const
const COPY_FAILED = 'Copy failed. Select the command to copy it.'

type PackageManager = (typeof PACKAGE_MANAGERS)[number]
type Feedback = { command: string; message: string }

export default function InstallCommand() {
  const groupName = useId()
  const [manager, setManager] = useState<PackageManager>(PACKAGE_MANAGERS[0])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const message = feedback?.command === manager.command ? feedback.message : ''

  async function copyCommand(): Promise<void> {
    const command = manager.command

    if (!navigator.clipboard) {
      setFeedback({ command, message: COPY_FAILED })
      return
    }

    try {
      await navigator.clipboard.writeText(command)
      setFeedback({ command, message: 'Copied' })
    } catch {
      setFeedback({ command, message: COPY_FAILED })
    }
  }

  return (
    <div className={styles.install}>
      <fieldset className={styles.managers}>
        <legend className={styles.visuallyHidden}>Package manager</legend>
        {PACKAGE_MANAGERS.map((option) => (
          <label className={styles.manager} key={option.name}>
            <input
              type="radio"
              name={groupName}
              value={option.name}
              checked={manager.name === option.name}
              onChange={() => {
                setManager(option)
                setFeedback(null)
              }}
            />
            <span>{option.name}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.command}>
        <code>{manager.command}</code>
        <button className={styles.copy} type="button" aria-label="Copy install command" onClick={copyCommand}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        </button>
      </div>
      <span className={styles.feedback} role="status" aria-live="polite">
        {message}
      </span>
    </div>
  )
}
