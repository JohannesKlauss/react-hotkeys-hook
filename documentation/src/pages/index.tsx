import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Quick Start
          </Link>

          <Link
            className="button button--primary button--lg"
            to="/docs/documentation/installation">
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

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A react library to use hotkeys in a declarative way">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
