export default function deepEqual(x?: unknown, y?: unknown): boolean {
  if (x === y) return true
  return !!(
    x &&
    y &&
    typeof x === 'object' &&
    typeof y === 'object' &&
    Object.keys(x).length === Object.keys(y).length &&
    // @ts-expect-error TS7053
    Object.keys(x).reduce((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true)
  )
}
