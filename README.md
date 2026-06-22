<hr>
<div align="center">
  <h1 align="center">
    useHotkeys(keys, callback)
  </h1>
</div>

<p align="center">
  <a href="https://bundlephobia.com/result?p=react-hotkeys-hook">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/react-hotkeys-hook?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/react-hotkeys-hook">
    <img alt="Types" src="https://img.shields.io/npm/types/react-hotkeys-hook?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/react-hotkeys-hook">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/react-hotkeys-hook?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/react-hotkeys-hook?style=for-the-badge&labelColor=24292e">
  </a>
</p>

<p align="center">
  <a aria-label="Sponsored by Spaceteams" href="https://spaceteams.de">
    <img alt="Sponsored by Spaceteams" src="https://raw.githubusercontent.com/spaceteams/badges/main/sponsored-by-spaceteams.svg">
  </a>
</p>

```
npm i react-hotkeys-hook
```

<p align="center">
A React hook for using keyboard shortcuts in components in a declarative way.
</p>

<hr>

## Quick Start

```jsx harmony
import { useHotkeys } from 'react-hotkeys-hook'

export const ExampleComponent = () => {
  const [count, setCount] = useState(0)
  useHotkeys('ctrl+k', () => setCount(prevCount => prevCount + 1))

  return (
    <p>
      Pressed {count} times.
    </p>
  )
}
```

### Scopes

Scopes allow you to group hotkeys together. You can use scopes to prevent hotkeys from colliding with each other.

```jsx harmony
const App = () => {
  return (
    <HotkeysProvider initiallyActiveScopes={['settings']}>
      <ExampleComponent />
    </HotkeysProvider>
  )
}

export const ExampleComponent = () => {
  const [count, setCount] = useState(0)
  useHotkeys('ctrl+k', () => setCount(prevCount => prevCount + 1), { scopes: ['settings'] })

  return (
    <p>
      Pressed {count} times.
    </p>
  )
}
```

#### Changing a scope's active state

You can change the active state of a scope using the `disableScope`, `enableScope` and `toggleScope` functions
returned by the `useHotkeysContext()` hook. Note that you have to have your app wrapped in a `<HotkeysProvider>` component.

```jsx harmony
const App = () => {
  return (
    <HotkeysProvider initiallyActiveScopes={['settings']}>
      <ExampleComponent />
    </HotkeysProvider>
  )
}

export const ExampleComponent = () => {
  const { toggleScope } = useHotkeysContext()

  return (
    <button onClick={() => toggleScope('settings')}>
      Change scope active state
    </button>
  )
}
```

### Focus trap

This will only trigger the hotkey if the component is focused.

```tsx harmony
export const ExampleComponent = () => {
  const [count, setCount] = useState(0)
  const ref = useHotkeys<HTMLParagraphElement>('ctrl+k', () => setCount(prevCount => prevCount + 1))

  return (
    <p tabIndex={-1} ref={ref}>
      Pressed {count} times.
    </p>
  )
}
```

## Documentation & Live Examples

* [Quick Start](https://react-hotkeys-hook.vercel.app/docs/intro)
* [Documentation](https://react-hotkeys-hook.vercel.app/docs/documentation/installation)
* [API](https://react-hotkeys-hook.vercel.app/docs/api/use-hotkeys)

## API

### useHotkeys(keys, callback)

```typescript
useHotkeys(keys: string | string[], callback: (event: KeyboardEvent, handler: HotkeysEvent) => void, options: Options = {}, deps: DependencyList = [])
```

| Parameter     | Type                                                    | Required? | Default value | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|---------------|---------------------------------------------------------|-----------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `keys`        | `string` or `string[]`                                  | required  | -             | set the hotkeys you want the hook to listen to. You can use single or multiple keys, modifier combinations, etc. This will either be a string or an array of strings. To separate multiple keys, use a comma. This split key value can be overridden with the `splitKey` option.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `callback`    | `(event: KeyboardEvent, handler: HotkeysEvent) => void` | required  | -             | This is the callback function that will be called when the hotkey is pressed. The callback will receive the browsers native `KeyboardEvent` and the libraries `HotkeysEvent`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `options`     | `Options`                                               | optional  | `{}`          | Object to modify the behavior of the hook. Default options are given below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `dependencies` | `DependencyList`                                         | optional  | `[]`           | The given callback will always be memoised inside the hook. So if you reference any outside variables, you need to set them here for the callback to get updated (Much like `useCallback` works in React). |

### Options

All options are optional and have a default value which you can override to change the behavior of the hook.

| Option                   | Type                                                                                 | Default value | Description                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------|--------------------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`                | `boolean` or `(keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean` | `true`        | This option determines whether the hotkey is active or not. It can take a boolean (for example a flag from a state outside) or a function which gets executed once the hotkey is pressed. If the function returns `false` the hotkey won't get executed and all browser events are prevented.                                                                                           |
| `enableOnFormTags`       | `boolean` or `FormTags[]`                                                            | `false`       | By default, hotkeys are disabled when a form element is focused. This prevents accidental triggering while the user is typing. Set to `true` to enable on all form tags, or pass an array of specific tags (e.g. `['input', 'textarea', 'select']`) |
| `enableOnContentEditable` | `boolean`                                                                            | `false`       | Enable hotkeys on elements with the `contentEditable` attribute set to `true` |
| `splitKey`               | `string`                                                                             | `+`           | Character that joins keys within a combination (e.g. `shift+a`). Change this if you need to listen for the `+` key itself |
| `delimiter`              | `string`                                                                             | `,`           | Character that separates different hotkey combinations mapped to the same callback (e.g. `ctrl+a, shift+b`) |
| `scopes`                 | `string` or `string[]`                                                               | `*`           | With scopes you can group hotkeys together. The default scope is the wildcard `*` which matches all hotkeys. Use the `<HotkeysProvider>` component to change active scopes.                                                                                                                                                                                                             |
| `keyup`                  | `boolean`                                                                            | `false`       | Trigger the callback on the browser's `keyup` event |
| `keydown`                | `boolean`                                                                            | `true`        | Trigger the callback on the browser's `keydown` event. Set both `keyup` and `keydown` to `true` to trigger on both events |
| `preventDefault`         | `boolean` or `(keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean` | `false`       | Prevent the browser's default behavior for the matched keystroke. Useful for overriding shortcuts like `meta+s`. Note: some browser shortcuts (e.g. `meta+w`) cannot be overridden |
| `description`            | `string`                                                                              | `undefined`   | Human-readable description of what the hotkey does. Useful for building help panels |
| `useKey`                 | `boolean`                                                                             | `false`       | Listen to the produced character instead of the physical key code |
| `ignoreModifiers`        | `boolean`                                                                             | `false`       | Ignore modifier keys when matching hotkeys |
| `sequenceTimeoutMs`      | `number`                                                                               | `1000`        | Time window in milliseconds for sequential hotkeys |


#### Overloads

The hooks call signature is very flexible. For example if you don't need to set any special options you can use the dependency
array as your third parameter:

`useHotkeys('ctrl+k', () => console.log(counter + 1), [counter])`

### `isHotkeyPressed(keys: string | string[], splitKey?: string = ',')`

This function allows us to check if the user is currently pressing down a key.

```ts
import { isHotkeyPressed } from 'react-hotkeys-hook'

isHotkeyPressed('esc') // Returns true if Escape key is pressed down.
```

You can also check for multiple keys at the same time:

```ts
isHotkeyPressed(['esc', 'ctrl+s']) // Returns true if Escape or Ctrl+S are pressed down.
```

## Support

* Ask your question in [GitHub Discussions](https://github.com/JohannesKlauss/react-hotkeys-hook/discussions)
* Ask your question on [StackOverflow](https://stackoverflow.com/search?page=1&tab=Relevance&q=react-hotkeys-hook)

## Found an issue or have a feature request?

Open up an [issue](https://github.com/JohannesKlauss/react-hotkeys-hook/issues/new)
or [pull request](https://github.com/JohannesKlauss/react-hotkeys-hook/compare) and participate.

## Local Development

Checkout this repo, run `yarn` or `npm i` and then run the `test` script to test the behavior of the hook.

## Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Johannes Klauss - [@JohannesKlauss](https://github.com/JohannesKlauss) - klauss.johannes@gmail.com

Project Link: [https://github.com/JohannesKlauss/react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook)

## Contributors

<a href="https://github.com/johannesklauss/react-hotkeys-hook/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=johannesklauss/react-hotkeys-hook" />
</a>
