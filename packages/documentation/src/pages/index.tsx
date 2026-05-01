import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { useColorMode } from '@docusaurus/theme-common'
import styles from './index.module.css'
import CodeBlock from '@theme/CodeBlock'
import { themes } from 'prism-react-renderer'

// @ts-expect-error - theme-live-codeblock types not available
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
// @ts-expect-error - theme scope
import ReactLiveScope from '@theme/ReactLiveScope'

const heroCode = `import { useHotkeys } from 'react-hotkeys-hook'

function App() {
  useHotkeys('ctrl+k', () => openSearch())
  useHotkeys('ctrl+s', () => saveDocument(),
    { preventDefault: true })

  return <div>...</div>
}`

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero')}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroContent}>
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">
            Keyboard shortcuts for React. One hook, zero complexity. Handle modifier keys, sequences, scopes, and
            focus traps without leaving your component.
          </p>
          <div className={styles.heroInstall}>
            <code>npm install react-hotkeys-hook</code>
            <button
              className={styles.heroCopy}
              onClick={() => navigator.clipboard.writeText('npm install react-hotkeys-hook')}
              type="button"
              aria-label="Copy install command"
              title="Copy"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              Quick Start
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/documentation/installation">
              Documentation
            </Link>
          </div>
          <div className={styles.heroKeys}>
            <kbd>Ctrl</kbd>
            <span>+</span>
            <kbd>K</kbd>
            <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>to search docs</span>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCodeBlock}>
            <CodeBlock className="language-tsx">{heroCode}</CodeBlock>
          </div>
        </div>
      </div>
    </header>
  )
}

function StatsSection() {
  const stats = [
    { value: '~3KB', label: 'minified + gzipped' },
    { value: '0', label: 'dependencies' },
    { value: 'TypeScript', label: 'first-class types' },
  ]

  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
  const { colorMode } = useColorMode()
  const prismTheme = colorMode === 'dark' ? themes.dracula : themes.github

  return (
    <section className={styles.demoSection}>
      <div className="container">
        <div className={styles.demoIntro}>
          <h2>Try it live</h2>
          <p>
            Click the preview panel, then press <kbd>N</kbd> to add a task. This demo runs real react-hotkeys-hook
            code — edit it and see changes instantly.
          </p>
        </div>
        <div className={styles.demoContainer}>
          <LiveProvider code={taskManagerCode} scope={ReactLiveScope} noInline theme={prismTheme}>
            <div className={styles.demoCode}>
              <div>Editor</div>
              <LiveEditor />
            </div>
            <div className={styles.demoPreview}>
              <div>Preview</div>
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
  label,
  reversed = false,
}: {
  title: string
  description: string
  code: string
  label?: string
  reversed?: boolean
}) {
  return (
    <section className={styles.featureSection}>
      <div className="container">
        <div className={clsx(styles.featureGrid, reversed && styles.featureGridReversed)}>
          <div>
            {label && <div className={styles.featureLabel}>{label}</div>}
            <h2 className={styles.featureTitle}>{title}</h2>
            <p className={styles.featureDescription}>{description}</p>
          </div>
          <div className={styles.featureCode}>
            <CodeBlock className="language-jsx">{code}</CodeBlock>
          </div>
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
      <StatsSection />
      <main>
        <TaskManagerDemo />

        <FeatureSection
          label="API"
          title="Simple & Declarative"
          description="Define hotkeys with a single hook call. No complex setup, no providers to wrap, no context to manage. Just import and use."
          code={`useHotkeys('ctrl+s', () => {
  saveDocument()
})`}
        />

        <FeatureSection
          label="Focus"
          title="Scoped to Components"
          description="Bind hotkeys to specific DOM elements using refs. Shortcuts only trigger when the element has focus — perfect for editors, modals, and multi-pane layouts."
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
          label="Power"
          title="Sequences & Combinations"
          description="Handle modifier combinations, key sequences, and overlapping shortcuts. Build vim-style command palettes or complex multi-step workflows."
          code={`// Modifier combinations
useHotkeys('ctrl+shift+k', () => deleteLine())

// Sequential hotkeys (vim-style)
useHotkeys('g>i>t', () => goToInbox())`}
        />

        <FeatureSection
          label="Record"
          title="Record Custom Hotkeys"
          description="Let users define their own keyboard shortcuts with the useRecordHotkeys hook. Perfect for settings panels, customizable apps, and power-user features."
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
      </main>
    </Layout>
  )
}
