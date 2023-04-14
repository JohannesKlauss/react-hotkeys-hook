import { act, renderHook } from '@testing-library/react'
import useRecordHotkeys from '../src/useRecordHotkeys'
import userEvent from '@testing-library/user-event'

test('Should set record flag to true if recording is in progress', () => {
  const { result } = renderHook(useRecordHotkeys)

  expect(result.current[1].isRecording).toBe(false)

  act(() => {
    result.current[1].start()
  })

  expect(result.current[1].isRecording).toBe(true)

  act(() => {
    result.current[1].stop()
  })

  expect(result.current[1].isRecording).toBe(false)
})

test('Should record keys', async () => {
  const user = userEvent.setup()
  const { result } = renderHook(useRecordHotkeys)

  act(() => {
    result.current[1].start()
  })

  await act(async () => {
    await user.keyboard('a')
    await user.keyboard('b')
    await user.keyboard('c')
  })

  act(() => {
    result.current[1].stop()
  })

  expect(result.current[0]).toEqual(new Set(['a', 'b', 'c']))
})

test('Should record modifiers', async () => {
  const user = userEvent.setup()
  const { result } = renderHook(useRecordHotkeys)

  act(() => {
    result.current[1].start()
  })

  await act(async () => {
    await user.keyboard('{Shift}a')
  })

  act(() => {
    result.current[1].stop()
  })

  expect(result.current[0]).toEqual(new Set(['shift', 'a']))
})

test('Should record multiple keys only once', async () => {
  const user = userEvent.setup()
  const { result } = renderHook(useRecordHotkeys)

  act(() => {
    result.current[1].start()
  })

  await act(async () => {
    await user.keyboard('a')
    await user.keyboard('a')
  })

  act(() => {
    result.current[1].stop()
  })

  expect(result.current[0]).toEqual(new Set(['a']))
})

test('Should not record keys if recording is not in progress', async () => {
  const user = userEvent.setup()
  const { result } = renderHook(useRecordHotkeys)

  await act(async () => {
    await user.keyboard('a')
  })

  expect(result.current[0]).toEqual(new Set())
})

test('Should reset keys if recording is restarted', async () => {
  const user = userEvent.setup()
  const { result } = renderHook(useRecordHotkeys)

  act(() => {
    result.current[1].start()
  })

  await act(async () => {
    await user.keyboard('a')
  })

  act(() => {
    result.current[1].stop()
  })

  act(() => {
    result.current[1].start()
  })

  expect(result.current[0]).toEqual(new Set())
})

test('Should stop recording if recording is in progress and stop is called', async () => {
  const user = userEvent.setup()
  const { result } = renderHook(useRecordHotkeys)

  act(() => {
    result.current[1].start()
  })

  await act(async () => {
    await user.keyboard('a')
  })

  act(() => {
    result.current[1].stop()
  })

  await act(async () => {
    await user.keyboard('b')
  })

  expect(result.current[0]).toEqual(new Set(['a']))
})
