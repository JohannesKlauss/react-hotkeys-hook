import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import CodeBlock from '@docusaurus/theme-live-codeblock/src/theme/CodeBlock';
import GitHubButton from 'react-github-btn';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <h1 className='hero__title'>{siteConfig.title}</h1>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className='button button--secondary button--lg margin-horiz--md'
            to='/docs/intro'>
            Quick Start
          </Link>

          <Link
            className='button button--primary button--lg margin-horiz--md'
            to='/docs/documentation/installation'>
            Documentation
          </Link>

          <GitHubButton
            href='https://github.com/johannesklauss/react-hotkeys-hook'
            data-color-scheme='no-preference: light; light: light; dark: dark;' data-size='large'
            data-show-count='true'
            aria-label='Star johannesklauss/react-hotkeys-hook on GitHub'
          >
            Star
          </GitHubButton>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description='Description will go into a meta tag in <head />'>
      <HomepageHeader />
      <main className={'padding-horiz--xl margin-horiz--xl'}>
        <CodeBlock className={'language-jsx'}>
          {`function MyComponent() {
  const [count, setCount] = useState(0);

  useHotkeys('a', () => setCount(prevCount => prevCount + 1));

  return (
    <span>{count}</span>
  );
}`}
        </CodeBlock>
      </main>
    </Layout>
  );
}
