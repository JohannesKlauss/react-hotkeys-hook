export default function deepEqual(x: any, y: any): boolean {
  //@ts-ignore
  return (x && y && typeof x === 'object' && typeof y === 'object')
    //@ts-ignore
    ? (Object.keys(x).length === Object.keys(y).length) && Object.keys(x).reduce(function(isEqual, key) {
      return isEqual && deepEqual(x[key], y[key])
    }, true)
    : (x === y)
}
