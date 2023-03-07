export default function deepEqual(x: any, y: any): boolean {
  //@ts-ignore
  return x && y && typeof x === 'object' && typeof y === 'object'
    ? Object.keys(x).length === Object.keys(y).length &&
        //@ts-ignore
        Object.keys(x).reduce((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true)
    : x === y
}
