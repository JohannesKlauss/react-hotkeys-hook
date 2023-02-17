import { useState } from 'react'
import { useHotkeys } from '../../src'
import { Keys, OptionsOrDependencyArray } from '../../src/types'

type Props = {
  keys: Keys
  options?: OptionsOrDependencyArray
  dependencies?: OptionsOrDependencyArray
}

function trigger(key: string | string[]) {
  cy.get('[data-cy=hotkeys]').realClick().realPress(key)
}

const IntegratedUseHotkeys = ({ keys, options, dependencies }: Props) => {
  const [count, setCount] = useState(0)

  useHotkeys(keys, () => setCount(count + 1), options, dependencies)

  return (
    <div>
      <div data-cy="hotkeys">{count}</div>
    </div>
  )
}

describe('Combinations', async () => {
  it('should integrate with cypress', () => {
    cy.mount(<IntegratedUseHotkeys keys={'a'}/>)

    trigger('a')

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to mod keys', () => {
    cy.mount(<IntegratedUseHotkeys keys={'meta, ctrl, shift, alt'}/>)

    trigger('Meta')
    trigger('ControlLeft')
    trigger('ControlRight')
    trigger('ShiftLeft')
    trigger('ShiftRight')
    trigger('AltLeft')
    trigger('AltRight')

    cy.get('[data-cy=hotkeys]').should('have.text', '7')
  })

  it('should listen to combinations with meta', () => {
    cy.mount(<IntegratedUseHotkeys keys={'meta+a'}/>)

    trigger(['Meta', 'a'])
    trigger(['Meta', 'b'])
    trigger(['Meta', 'a'])
    trigger(['Meta'])
    trigger(['a'])

    cy.get('[data-cy=hotkeys]').should('have.text', '2')
  })

  it('should listen to combinations with shift', () => {
    cy.mount(<IntegratedUseHotkeys keys={'shift+a'}/>)

    trigger(['ShiftLeft', 'a'])
    trigger(['ShiftLeft', 'b'])
    trigger(['ShiftLeft', 'a'])
    trigger(['ShiftLeft'])
    trigger(['a'])

    cy.get('[data-cy=hotkeys]').should('have.text', '2')
  })

  it('should listen to combinations with alt', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+a'}/>)

    trigger(['AltLeft', 'a'])
    trigger(['AltLeft', 'b'])
    trigger(['AltLeft', 'a'])
    trigger(['AltLeft'])
    trigger(['a'])

    cy.get('[data-cy=hotkeys]').should('have.text', '2')
  })

  it('should listen to combinations with backtick', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+`'}/>)

    trigger(['AltLeft', '`'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to combinations with escape', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+esc'}/>)

    trigger(['AltLeft', 'Escape'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to combinations with return/enter', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+enter, enter'}/>)

    trigger(['AltLeft', 'Enter'])
    trigger(['Enter'])

    cy.get('[data-cy=hotkeys]').should('have.text', '2')
  })

  it('should listen to combinations with period', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+.'}/>)

    trigger(['AltLeft', '.'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to combinations with comma', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+,'} options={{splitKey: '-'}}/>)

    trigger(['AltLeft', ','])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to combinations with slash', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+-'}/>)

    trigger(['AltLeft', '-'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to combinations with space', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+ , space'}/>)

    trigger(['AltLeft', ' '])
    trigger([' '])

    cy.get('[data-cy=hotkeys]').should('have.text', '2')
  })

  it('should listen to combinations with hashtag', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt+#'}/>)

    trigger(['AltLeft', '#'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to combinations with +', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt-+'} options={{combinationKey: '-'}}/>)

    trigger(['AltLeft', '+'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to combinations with +', () => {
    cy.mount(<IntegratedUseHotkeys keys={'alt-+'} options={{combinationKey: '-'}}/>)

    trigger(['AltLeft', '+'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to !', () => {
    cy.mount(<IntegratedUseHotkeys keys={'!'}/>)

    trigger(['!'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to Shift+1', () => {
    cy.mount(<IntegratedUseHotkeys keys={'Shift+1'}/>)

    trigger(['Shift', '1'])

    cy.get('[data-cy=hotkeys]').should('have.text', '1')
  })

  it('should listen to both Shift+1 and !', () => {
    cy.mount(<IntegratedUseHotkeys keys={'Shift+1, !'}/>)

    trigger(['Shift', '1'])
    trigger(['!'])

    cy.get('[data-cy=hotkeys]').should('have.text', '2')
  })
})
