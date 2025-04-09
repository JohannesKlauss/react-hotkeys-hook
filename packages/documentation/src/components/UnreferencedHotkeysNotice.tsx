import { useHotkeys } from 'react-hotkeys-hook';
import { useState } from 'react';
import React from 'react';

export interface UnreferencedHotkeysNoticeProps {
  hotkeyCombination: string;
}

const UnreferencedHotkeysNotice = ({ hotkeyCombination }: UnreferencedHotkeysNoticeProps) => {
  const [didPressCombination, setDidPressCombination] = useState(false);
  useHotkeys(hotkeyCombination, () => setDidPressCombination(true));

  if (!didPressCombination) {
    return null;
  }

  return (
    <div className='admonition admonition-note alert alert--info'>
      <div className='admonition-heading'>
        <h5>
          <span className='admonition-icon'>
            <svg xmlns='http://www.w3.org/2000/svg' width='14' height='16' viewBox='0 0 14 16'>
              <path fill-rule='evenodd' d='M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z'></path></svg>
          </span>
          Noticed something?
        </h5>
      </div>
      <div className='admonition-content'>
        <p>
          We used the <code>ctrl+shift+a+c</code> and <code>shift+c</code> combination two times for two components on this page.
          Since we pressed down one hotkey already the example above started at the count of one. Hotkeys are attached
          globally if we don't use its return value.
        </p>
      </div>
    </div>
  );
};

export default UnreferencedHotkeysNotice;
