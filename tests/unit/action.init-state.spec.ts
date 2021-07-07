// @ts-nocheck
import { initState } from '../../src/actions'
import { generateFieldName, generateDefaultField } from '../../src/utils'
import { setter, getter } from './env'

describe('init state', () => {
  it('state 可以被正常初始化', (done) => {
    const func = 'func-init-state-resolve'
    const type = 'type'
    const query = {
      a: 1,
      b: 2
    }

    initState({
      getter,
      setter,
      func,
      type,
      query
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const field = generateDefaultField()

        expect(state).toEqual(field)

        done()
      })
  })

  it('state 已初始化过了，不再重复初始化', (done) => {
    const func = 'func-init-state-reject'
    const type = 'type'
    const query = {
      a: 1,
      b: 2
    }

    initState({
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        total: 10
      }
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const field = generateDefaultField({
          total: 10
        })

        expect(state).toEqual(field)

        initState({
          getter,
          setter,
          func,
          type,
          query
        })
          .then(() => {
            const state = getter(generateFieldName({
              func,
              type,
              query
            }))

            const field = generateDefaultField({
              total: 10
            })

            expect(state).toEqual(field)

            done()
          })
      })
  })
})
