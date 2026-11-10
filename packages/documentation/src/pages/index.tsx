import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import CodeBlock from '@theme/CodeBlock'
import '@fontsource-variable/manrope'
import InstallCommand from '../components/InstallCommand'
import ShortcutCue from '../components/ShortcutCue'
import TaskManagerDemo from '../components/TaskManagerDemo'
import styles from './index.module.css'

const featureLinks = [
  {
    title: 'Focus where it matters.',
    description:
      'Attach a shortcut to a focused element, or group shortcuts into scopes for the parts of your app that need them.',
    code: "const ref = useHotkeys('ctrl+b', toggleBold)",
    href: '/docs/documentation/useHotkeys/scoping-hotkeys',
    link: 'Explore focus and scopes',
  },
  {
    title: 'More than one key.',
    description: 'Listen for combinations and sequences, from modifier shortcuts to multi-step commands.',
    code: "useHotkeys('g>i>t', goToInbox)",
    href: '/docs/documentation/useHotkeys/basic-usage',
    link: 'See combinations and sequences',
  },
  {
    title: 'Make shortcuts their own.',
    description: 'Let users record their own shortcuts with the useRecordHotkeys hook.',
    code: 'const [keys, controls] = useRecordHotkeys()',
    href: '/docs/documentation/use-record-hotkeys',
    link: 'Learn about recording',
  },
] as const

const saveExample = `import { useHotkeys } from 'react-hotkeys-hook'

function Editor() {
  useHotkeys('mod+s', saveDocument, {
    preventDefault: true,
  })

  return <Document />
}`

function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.heroTitle}>
          <span>Keyboard shortcuts,</span>
          <span>right where you need them.</span>
        </h1>
        <p className={styles.heroDescription}>
          A React hook for turning key presses into actions, from a single key to combinations and sequences.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryAction} to="/docs/intro">
            Get started <ArrowIcon />
          </Link>
          <InstallCommand />
        </div>
        <ShortcutCue />
      </div>
    </header>
  )
}

function FeaturesSection() {
  return (
    <section className={styles.features} aria-labelledby="features-title">
      <div className={styles.container}>
        <div className={styles.featureIntro}>
          <h2 id="features-title">A little hook. A lot of possibilities.</h2>
          <p>Start with one shortcut, then make it work for the way your application actually works.</p>
        </div>
        <div className={styles.featureLayout}>
          <article className={styles.featureLead}>
            <h3>One hook, right in your component.</h3>
            <p>Declare a shortcut next to the action it belongs to. No provider or setup required to get started.</p>
            <div className={styles.featureCode}>
              <CodeBlock className="language-jsx">{saveExample}</CodeBlock>
            </div>
            <Link className={styles.textLink} to="/docs/documentation/useHotkeys/basic-usage">
              See how it works <ArrowIcon />
            </Link>
          </article>
          <div className={styles.featureList}>
            {featureLinks.map((feature) => (
              <article className={styles.featureItem} key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <code>{feature.code}</code>
                <Link className={styles.textLink} to={feature.href}>
                  {feature.link} <ArrowIcon />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ClosingSection() {
  return (
    <section className={styles.closing}>
      <div className={styles.container}>
        <div className={styles.closingContent}>
          <h2>Ready to make your first shortcut?</h2>
          <div className={styles.closingActions}>
            <Link className={styles.closingPrimary} to="/docs/intro">
              Get started <ArrowIcon />
            </Link>
            <Link className={styles.closingLink} to="/docs/api/use-hotkeys">
              Browse the API <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={siteConfig.title} description="A React hook for declarative keyboard shortcuts.">
      <main className={styles.homePage}>
        <HomepageHeader />
        <div className={styles.container}>
          <TaskManagerDemo />
        </div>
        <FeaturesSection />
        <ClosingSection />
      </main>
    </Layout>
  )
}
