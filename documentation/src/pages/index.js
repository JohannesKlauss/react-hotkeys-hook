import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import CodeBlock from '@docusaurus/theme-live-codeblock/src/theme/CodeBlock';

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
            className='button button--info button--lg margin-horiz--md margin-right--lg'
            to='/docs/documentation/installation'>
            Documentation
          </Link>

          <iframe className="indexCtasGitHubButton_5nVI"
                  src="https://ghbtns.com/github-btn.html?user=JohannesKlauss&amp;repo=react-hotkeys-hook&amp;type=star&amp;count=true&amp;size=large"
                  width="160" height="30" title="GitHub Stars"></iframe>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description='Description will go into a meta tag in <head />'>
      <HomepageHeader />
      <main className={clsx('padding-horiz--xl margin-vert--lg', styles.fullWidth)}>
        <div className={'container'}>
          <div className={'row margin-vert--xl'}>
            <div className={'col col-6'}>
              <h1 className={styles.rightAlign}>Easy to use</h1>
              <p className={styles.rightAlign}>Use just one hook to bind your hotkeys to a component.</p>
            </div>
            <div className={'col col-6'}>
              <CodeBlock className={'language-jsx'}>
                {`function MyComponent() {
  const [count, setCount] = useState(0);

  useHotkeys('a', () => setCount(prevCount =>
    prevCount + 1
  ));

  return (
    <span>{count}</span>
  );
}`}
              </CodeBlock>
            </div>
          </div>

          <div className={'row margin-vert--xl'}>
            <div className={'col col-6'}>
              <CodeBlock className={'language-jsx'}>
                {`function MyComponent() {
  const [count, setCount] = useState(0);

  const ref = useHotkeys('a', () => setCount(prevCount =>
    prevCount + 1
  ));

  return (
    <span ref={ref}>{count}</span>
  );
}`}
              </CodeBlock>

            </div>
            <div className={'col col-6'}>
              <h1>Dead simple component scoping</h1>
              <p>With the usage of a returned ref you can easily scope your hotkey callback to your component.</p>
            </div>
          </div>
        </div>

        <div className={'row margin-vert--xl'}>
          <div className={'col col-6'}>
            <h1 className={styles.rightAlign}>Modifier support and combinations</h1>
            <p className={styles.rightAlign}>Use any modifier you want. You can also combine multiple hotkey combinations to trigger the same callback</p>
          </div>
          <div className={'col col-6'}>
            <CodeBlock className={'language-jsx'}>
              {`function MyComponent() {
  const [count, setCount] = useState(0);

  useHotkeys('ctrl+a, shift+x', () => setCount(prevCount =>
    prevCount + 1
  ));

  return (
    <span>{count}</span>
  );
}`}
            </CodeBlock>
          </div>
        </div>

      </main>
    </Layout>
  );
}
