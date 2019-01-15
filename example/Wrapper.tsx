import React, {useState} from 'react';
import useHotKeys from "../src";

export const Wrapper: React.FunctionComponent<{}> = (props) => {
  const [count, setCount] = useState(0);
  useHotKeys('d', () => {
    console.log('Pressed d!');

    setCount(count + 1);
  });

  return (
    <div>
      <h1>
        I am the 'd' scope. I was pressed {count} times. If pressed more than twice, the children will disappear.
      </h1>
      {(count < 3 || count > 6) && props.children}
    </div>
  );
};