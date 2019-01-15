import React from 'react';
import useHotKeys from "../src";

export const SecondScope: React.FunctionComponent<{}> = () => {
  useHotKeys('ctrl+l', () => console.log('pressed ctrl+l'));

  return (
    <h1>
      I am the ctrl+l scope
    </h1>
  );
};