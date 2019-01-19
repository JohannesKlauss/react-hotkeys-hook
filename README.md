# react-hotkeys-hook
React hook for using keyboard shortcuts in components.
This is a hook version for the [hotkeys] package.

### Installation

```shell
npm install react-hotkeys-hook
```

or

```shell
yarn add react-hotkeys-hook
```

Make sure that you have `react@next` and `react-dom@next` installed, or otherwise hooks won't work for you.

### Usage
With TypeScript
```typescript jsx
export const ExampleComponent: React.FunctionComponent<{}> = () => {
  const [count, setCount] = useState(0);
  useHotKeys('ctrl+k', () => setCount(count + 1));

  return (
    <p>
      Pressed {count} times.
    </p>
  );
};
```

Or plain JS:
```js
export const ExampleComponent = () => {
  const [count, setCount] = useState(0);
  useHotKeys('ctrl+k', () => setCount(count + 1));
    
  return (
    <p>
      Pressed {count} times.
    </p>
  );
};
```

The hook takes care of all the binding and unbinding for you.
As soon as the component mounts into the DOM, the key stroke will be
listened to. When the component unmounts it will stop listening.

### Call Signature

```typescript
useHotkeys(keys: string, callback: (event: KeyboardEvent, handler: HotkeysEvent) => void)
```

The `useHotkeys` hook follows the [hotkeys] call signature.
The callback function takes the exact parameters as the callback function in the hotkeys package.
See [hotkeys] documentation for more info or look into the typings file.

### Found an issue or have a feature request?

Open up an issue or pull request and participate.

### Authors

* Johannes Klauss

---

MIT License.

---

[hotkeys]: https://github.com/jaywcjlove/hotkeys