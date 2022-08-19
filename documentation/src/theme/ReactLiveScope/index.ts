import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook'
// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  useHotkeys,
};
export default ReactLiveScope;
