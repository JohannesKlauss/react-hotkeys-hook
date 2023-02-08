import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Declarative',
    Svg: require('@site/static/img/react.svg').default,
    description: (
      <>
        Define your hotkeys declaratively once, and let React Hotkeys take care of all the nitty gritty details of
        binding and unbinding them.
      </>
    ),
  },
  {
    title: 'Batteries included',
    Svg: require('@site/static/img/battery-full-solid.svg').default,
    description: (
      <>
        Memoisation, enable on form fields, check for currently pressed keys. React Hotkeys has you covered.
      </>
    ),
  },
  {
    title: 'Powered by TypeScript',
    Svg: require('@site/static/img/typescript.svg').default,
    description: (
      <>
        React Hotkeys Hook is written with TypeScript, so all typings come with it.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
