import React, {useState} from 'react';
import useHotKeys from "../src";

export const Wrapper: React.FunctionComponent<{}> = (props) => {
  const [numOfPressedKey, setNumOfPressedKey] = useState(0);
  useHotKeys('d', () => {
    console.log('Pressed d!');

    setNumOfPressedKey(numOfPressedKey + 1);
  });

  return (
    <div>
      <h1>
        I am the 'd' scope. I was pressed {numOfPressedKey} times. If pressed more than twice, the children will disappear.
      </h1>
      {numOfPressedKey < 3 && props.children}
    </div>
  );
};