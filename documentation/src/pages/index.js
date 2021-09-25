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
            className='button button--caution button--lg margin-horiz--md'
            to='/docs/intro'>
            Quick Start
          </Link>

          <Link
            className='button button--secondary button--lg margin-horiz--md margin-right--lg'
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
              <CodeBlock live={true} className={'language-jsx'}>
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
              <CodeBlock live={true} className={'language-jsx'}>
                {`function MyComponent() {
  const [count, setCount] = useState(0);

  const ref = useHotkeys('b', () => setCount(prevCount =>
    prevCount + 1
  ));

  return (
    <div>
      <span>Focusing this element will disable the hotkey {count}.</span>
      <br/>
      <span ref={ref} tabIndex='-1'>Focusing this element will enable the hotkey {count}.</span>
    </div>
  );
}`}
              </CodeBlock>

            </div>
            <div className={'col col-6'}>
              <h1>Dead simple component scoping</h1>
              <p>With the usage of a returned ref you can easily scope your callback to your component, sub component or subtree.</p>
            </div>
          </div>
        </div>

        <div className={'row margin-vert--xl'}>
          <div className={'col col-6'}>
            <h1 className={styles.rightAlign}>Modifier support and combinations</h1>
            <p className={styles.rightAlign}>Use all major modifiers. You can also combine multiple hotkey combinations to trigger the same callback. Supports ctrl, cmd, option, alt, pagedown, etc.</p>
          </div>
          <div className={'col col-6'}>
            <CodeBlock live={true} className={'language-jsx'}>
              {`function MyComponent() {
  const [count, setCount] = useState(0);

  useHotkeys('ctrl+a, shift+ctrl+x', () => setCount(prevCount =>
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
            <CodeBlock live={true} className={'language-jsx'}>
              {`function MyComponent() {
  const [enabled, setEnabled] = useState(false)
  const [count, setCount] = useState(0)
  useHotkeys('shift+c', () => setCount(prevCount => prevCount + 1), {
    enabled,
  })

  return (
    <div>
      <button onClick={() => setEnabled(prevValue => !prevValue)}>Toggle Hotkey</button>
      <p>Hotkey is {!enabled && 'not'} enabled.</p>
      <p>Pressed the 'shift+c' keystroke {count} times.</p>
    </div>
  )
}`}
            </CodeBlock>

          </div>
          <div className={'col col-6'}>
            <h1>Dynamically enable or disable hotkeys</h1>
            <p>You can enable and disable hotkeys during runtime as well as prevent the defaults browser behavior.</p>
          </div>
        </div>

        <div className={'container'}>
          <div className={styles.buttons}>
            <Link
              className='button button--secondary button--lg margin-horiz--md'
              to='/docs/intro'>
              Quick Start
            </Link>

            <Link
              className='button button--primary button--lg margin-horiz--md margin-right--lg'
              to='/docs/documentation/installation'>
              Documentation
            </Link>

            <iframe className="indexCtasGitHubButton_5nVI"
                    src="https://ghbtns.com/github-btn.html?user=JohannesKlauss&amp;repo=react-hotkeys-hook&amp;type=star&amp;count=true&amp;size=large"
                    width="160" height="30" title="GitHub Stars"></iframe>
          </div>
        </div>
      </main>
    </Layout>
  );
}
