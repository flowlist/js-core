import { initState, updateState } from '@/actions'
import { generateFieldName, generateDefaultField } from '@/utils'
import { setter, getter } from './env'
import * as api from './api'

describe('update state', () => {
  it('如果 field 未初始化，则 return', (done) => {
    const func = 'update-state-not-init'
    const type = 'type'
    const query = {
      test_order: 0
    }

    updateState({
      getter,
      setter,
      func,
      type,
      query
    })
      .then()
      .catch(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        expect(state).toEqual(null)
        done()
      })
  })

  it('调用 update 方法修改 result 的值，result 是 array', (done) => {
    const func = 'update-state-not-init'
    const type = 'type'
    const query = {
      test_order: 1
    }

    initState({
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData.result
      }
    })

    updateState({
      getter,
      setter,
      func,
      type,
      query,
      method: 'update',
      id: 2,
      changeKey: 'slug',
      value: 'changed'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const condition = [...api.testArrData.result]
        condition[1].slug = 'changed'

        expect(state.result).toEqual(condition)
        done()
      })
  })
})
