import React from 'react';
import useHotKeys from "../src";

export const FirstScope: React.FunctionComponent<{}> = () => {
  useHotKeys('ctrl+k', () => console.log('pressed ctrl+k'));

  return (
    <h1>
      I am the ctrl+k scope
    </h1>
  );
};