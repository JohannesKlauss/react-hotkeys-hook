import React from 'react';
import { useHotkeys, useRecordHotkeys } from 'react-hotkeys-hook'
// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  useHotkeys,
  useRecordHotkeys,
};
export default ReactLiveScope;
