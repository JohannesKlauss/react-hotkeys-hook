import '../src/test'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const renderStub = () => render(<div />)

test('should return true if hotkey is currently pressed down', () => {
  renderStub()

  userEvent.keyboard.press('a')
})

test.skip('should return false if hotkey is not pressed down', () => {

})

test.skip('should take modifiers into account', () => {

})

test.skip('should support multiple hotkeys', () => {

})

test.skip('should support multiple hotkeys with modifiers', () => {

})

test.skip('should only trigger once if multiple hotkeys are pressed', () => {

})

test.skip('should use , as splitKey as default', () => {

})

test.skip('should respect the splitKey option', () => {

})
