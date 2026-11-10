import React from 'react'
import { usePrismTheme } from '@docusaurus/theme-common'
import styles from './TaskManagerDemo.module.css'

import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
// @ts-expect-error - theme scope
import ReactLiveScope from '@theme/ReactLiveScope'

const taskManagerCode = `function TaskManager() {
  const [tasks, setTasks] = useState([
    'Learn useHotkeys', 'Build app', 'Ship it'
  ])

  const addTask = () => setTasks(current => [...current, 'New task'])
  const ref = useHotkeys('n', addTask, { useKey: true })

  return (
    <div ref={ref} tabIndex={0} className="task-preview"
      role="region" aria-label="Task preview: press N to add a task">
      <ul aria-live="polite" aria-relevant="additions">
        {tasks.map((task, i) => <li key={i}>{task}</li>)}
      </ul>
      <button type="button" onClick={addTask}>Add task</button>
    </div>
  )
}

render(<TaskManager />)`

function labelEditor(element: HTMLDivElement | null): void {
  const editor = element?.querySelector('pre')
  editor?.setAttribute('role', 'textbox')
  editor?.setAttribute('aria-label', 'Edit the task manager example')
  editor?.setAttribute('aria-multiline', 'true')
}

export default function TaskManagerDemo() {
  const prismTheme = usePrismTheme()

  return (
    <section className={styles.section} id="playground" aria-labelledby="playground-title">
      <div className={styles.intro}>
        <h2 id="playground-title">Try a shortcut.</h2>
        <p>
          Focus the preview and press <kbd>N</kbd> to add a task, or use the button. Edit the code to see what happens
          next.
        </p>
      </div>
      <div className={styles.playground}>
        <LiveProvider code={taskManagerCode} scope={ReactLiveScope} noInline theme={prismTheme}>
          <div className={styles.editor}>
            <div className={styles.panelHeading}>
              <span>TaskManager.jsx</span>
              <span>Editable example</span>
            </div>
            <div ref={labelEditor}>
              <LiveEditor tabMode="focus" />
            </div>
          </div>
          <div className={styles.preview}>
            <div className={styles.panelHeading}>
              <span>Preview</span>
              <span>Press N</span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.error} role="alert">
                <LiveError />
              </div>
              <LivePreview />
            </div>
          </div>
        </LiveProvider>
      </div>
    </section>
  )
}
