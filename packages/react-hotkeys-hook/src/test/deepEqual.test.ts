import { test, expect } from 'vitest'
import deepEqual from '../lib/deepEqual'

test('Should handle circular references in objects that are ref-equal', () => {
  type Obj = { a: number; obj?: Obj }

  const obj1: Obj = { a: 1 }
  const obj2: Obj = { a: 1 }
  obj1.obj = obj1
  obj2.obj = obj1

  expect(deepEqual(obj1, obj2)).toBe(true)
})
