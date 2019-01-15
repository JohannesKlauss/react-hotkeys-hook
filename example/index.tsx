import React from 'react'
import ReactDOM from 'react-dom'
import {Wrapper} from "./Wrapper";
import {FirstScope} from "./FirstScope";
import {SecondScope} from "./SecondScope";

ReactDOM.render(
  <Wrapper>
    <FirstScope/>
    <SecondScope/>
  </Wrapper>,
  document.getElementById('root'),
);