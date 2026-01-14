import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './index.module.css'
import CodeBlock from '@theme/CodeBlock'

// @ts-expect-error - theme-live-codeblock types not available
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
// @ts-expect-error - theme scope
import ReactLiveScope from '@theme/ReactLiveScope'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero', 'hero--primary')}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Quick Start
          </Link>
          <Link className="button button--primary button--lg" to="/docs/documentation/installation">
            Documentation
          </Link>
        </div>
      </div>
    </header>
  )
}

const taskManagerCode = `function TaskManager() {
  const [tasks, setTasks] = useState(['Learn useHotkeys', 'Build app', 'Ship it'])

  useHotkeys('n', () => setTasks([...tasks, 'New task']))

  return (
    <ul>
      {tasks.map((task, i) => <li key={i}>{task}</li>)}
    </ul>
  )
}

render(<TaskManager />)`

function TaskManagerDemo() {
  return (
    <section className={styles.demoSection}>
      <div className="container">
        <div className={styles.demoIntro}>
          <h2>Keyboard shortcuts made simple</h2>
          <p>
            Build keyboard-driven interfaces with just a few lines of code. Try the demo below - click on the preview
            and use the keyboard shortcuts to interact with the task manager.
          </p>
        </div>
        <div className={styles.demoContainer}>
          <LiveProvider code={taskManagerCode} scope={ReactLiveScope} noInline>
            <div className={styles.demoCode}>
              <LiveEditor />
            </div>
            <div className={styles.demoPreview}>
              <LiveError />
              <LivePreview />
            </div>
          </LiveProvider>
        </div>
      </div>
    </section>
  )
}

function FeatureSection({
  title,
  description,
  code,
  reversed = false,
}: {
  title: string
  description: string
  code: string
  reversed?: boolean
}) {
  return (
    <section className={styles.featureSection}>
      <div className="container">
        <div className={clsx(styles.featureGrid, reversed && styles.featureGridReversed)}>
          <div>
            <h2 className={styles.featureTitle}>{title}</h2>
            <p className={styles.featureDescription}>{description}</p>
          </div>
          <div>
            <CodeBlock className="language-jsx">{code}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickStart() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <h2>Quick Start</h2>
        <div className={styles.quickStartCode}>
          <CodeBlock className="language-shell">{`npm install react-hotkeys-hook`}</CodeBlock>
          <CodeBlock className="language-jsx">{`import { useHotkeys } from 'react-hotkeys-hook'

function App() {
  useHotkeys('ctrl+k', () => openSearch())
  
  return <div>...</div>
}`}</CodeBlock>
        </div>
        <div className={styles.quickStartCta}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Read full documentation
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={siteConfig.title} description="A react library to use hotkeys in a declarative way">
      <HomepageHeader />
      <main>
        <TaskManagerDemo />

        <FeatureSection
          title="Simple & Declarative"
          description="Define hotkeys with a single hook call. No complex setup, just import and use."
          code={`useHotkeys('ctrl+s', () => {
  saveDocument()
})`}
        />

        <FeatureSection
          title="Scoped to Components"
          description="Scope hotkeys to specific components using refs. Hotkeys only trigger when the element is focused."
          code={`function Editor() {
  const ref = useHotkeys('ctrl+b', () => toggleBold())
  
  return (
    <div ref={ref} tabIndex={-1}>
      Click here to focus, then press ctrl+b
    </div>
  )
}`}
          reversed
        />

        <FeatureSection
          title="Sequences & Combinations"
          description="Support for modifier keys and sequential hotkeys. Create vim-style commands or complex shortcuts."
          code={`// Modifier combinations
useHotkeys('ctrl+shift+k', () => deleteLine())

// Sequential hotkeys (vim-style)
useHotkeys('g>i>t', () => goToInbox())`}
        />

        <FeatureSection
          title="Record Custom Hotkeys"
          description="Let users define their own keyboard shortcuts. Perfect for customizable applications."
          code={`function HotkeyRecorder() {
  const [keys, { start, stop, isRecording }] = useRecordHotkeys()

  return (
    <div>
      <p>Recorded: {Array.from(keys).join(' + ')}</p>
      <button onClick={isRecording ? stop : start}>
        {isRecording ? 'Stop' : 'Record'}
      </button>
    </div>
  )
}`}
          reversed
        />

        <QuickStart />
      </main>
    </Layout>
  )
}
