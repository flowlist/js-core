import { initState, updateState } from '@/actions'
import { generateFieldName } from '@/utils'
import { setter, getter, cache } from './env'
import * as api from './api'

describe('update state', () => {
  it('如果 field 未初始化，则 return', (done) => {
    const func = 'update-state-not-init'
    const type = 'type'
    const query = {
      test_order: 0
    }

    updateState({
      cache,
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

  it('调用 update 方法修改 result 的值', (done) => {
    const func = 'update-state-call-update'
    const type = 'type'
    const query = {
      test_order: 1
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'update',
      id: 2,
      changeKey: 'obj.key',
      value: 'changed'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const condition = [...api.testArrData().result]
        condition[1].obj.key = 'changed'

        expect(state.result).toEqual(condition)
        done()
      })
  })

  it('调用 reset 方法修改 field 的值', (done) => {
    const func = 'update-state-call-reset'
    const type = 'type'
    const query = {
      test_order: 2
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'reset',
      id: 2,
      changeKey: 'extra',
      value: 'changed'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        expect(state.extra).toEqual('changed')
        done()
      })
  })

  it('调用 push 方法修改 field 的值', (done) => {
    const func = 'update-state-call-push'
    const type = 'type'
    const query = {
      test_order: 3
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    const newValObj = {
      id: 4,
      txt: '嘎嘎嘎'
    }

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'push',
      value: newValObj
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual([
          ...api.testArrData().result,
          newValObj
        ])

        const newValArr = [
          {
            id: 5,
            txt: '哈哈哈'
          },
          {
            id: 6,
            txt: '嘿嘿嘿'
          }
        ]

        updateState({
          cache,
          getter,
          setter,
          func,
          type,
          query,
          method: 'push',
          value: newValArr
        })
          .then(() => {
            const state = getter(generateFieldName({
              func,
              type,
              query
            }))
            expect(state.result).toEqual([
              ...api.testArrData().result,
              newValObj,
              ...newValArr
            ])
            done()
          })
      })
  })

  it('调用 unshift 方法修改 field 的值', (done) => {
    const func = 'update-state-call-unshift'
    const type = 'type'
    const query = {
      test_order: 4
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    const newValObj = {
      id: 4,
      txt: '嘎嘎嘎'
    }

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'unshift',
      value: newValObj
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual([
          newValObj,
          ...api.testArrData().result
        ])

        const newValArr = [
          {
            id: 5,
            txt: '哈哈哈'
          },
          {
            id: 6,
            txt: '嘿嘿嘿'
          }
        ]

        updateState({
          cache,
          getter,
          setter,
          func,
          type,
          query,
          method: 'unshift',
          value: newValArr
        })
          .then(() => {
            const state = getter(generateFieldName({
              func,
              type,
              query
            }))
            expect(state.result).toEqual([
              ...newValArr,
              newValObj,
              ...api.testArrData().result
            ])
            done()
          })
      })
  })

  it('调用 delete 方法修改 field 的值', (done) => {
    const func = 'update-state-call-delete'
    const type = 'type'
    const query = {
      test_order: 5
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      id: api.testArrData().result[1].id,
      method: 'delete'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual([
          api.testArrData().result[0],
          api.testArrData().result[2]
        ])

        done()
      })
  })

  it('调用 insert-before 方法修改 field 的值', (done) => {
    const func = 'update-state-call-insert-before'
    const type = 'type'
    const query = {
      test_order: 6
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    const newValObj = {
      id: 4,
      txt: '嘎嘎嘎'
    }

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      id: api.testArrData().result[1].id,
      method: 'insert-before',
      value: newValObj
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual([
          api.testArrData().result[0],
          newValObj,
          api.testArrData().result[1],
          api.testArrData().result[2]
        ])

        done()
      })
  })

  it('调用 insert-after 方法修改 field 的值', (done) => {
    const func = 'update-state-call-insert-after'
    const type = 'type'
    const query = {
      test_order: 7
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    const newValObj = {
      id: 4,
      txt: '嘎嘎嘎'
    }

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      id: api.testArrData().result[1].id,
      method: 'insert-after',
      value: newValObj
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual([
          api.testArrData().result[0],
          api.testArrData().result[1],
          newValObj,
          api.testArrData().result[2]
        ])

        done()
      })
  })

  it('调用 patch 方法修改 field 的值', (done) => {
    const func = 'update-state-call-patch'
    const type = 'type'
    const query = {
      test_order: 7
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    const newValArr = [
      {
        id: 1,
        slug: 'e'
      },
      {
        id: 2,
        slug: 'f'
      },
      {
        id: 3,
        slug: 'g'
      }
    ]

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'patch',
      value: newValArr
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const newVal = api.testArrData().result
        newVal[0].slug = 'e'
        newVal[1].slug = 'f'
        newVal[2].slug = 'g'

        expect(state.result).toEqual(newVal)

        done()
      })
  })

  it('记录 cache', (done) => {
    const func = 'update-state-set-cache'
    const type = 'type'
    const query = {
      test_order: 8
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    const newValArr = [
      {
        id: 1,
        slug: 'e'
      },
      {
        id: 2,
        slug: 'f'
      },
      {
        id: 3,
        slug: 'g'
      }
    ]

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      cacheTimeout: 100,
      method: 'patch',
      value: newValArr
    })
      .then(() => {
        cache.get({
          key: generateFieldName({
            func,
            type,
            query
          })
        })
          .then(state => {
            const newVal = api.testArrData().result
            newVal[0].slug = 'e'
            newVal[1].slug = 'f'
            newVal[2].slug = 'g'

            expect(state.result).toEqual(newVal)

            done()
          })
      })
  })

  it('当 id 传值不存在，delete，insert-before，insert-after 无效', (done) => {
    const func = 'update-state-call-bad-index'
    const type = 'type'
    const query = {
      test_order: 9
    }

    const result = api.testArrData().result

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: { result }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      id: 9,
      method: 'delete'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual(result)

        updateState({
          cache,
          getter,
          setter,
          func,
          type,
          query,
          id: 9,
          method: 'insert-before',
          value: 999
        })
          .then(() => {
            const state = getter(generateFieldName({
              func,
              type,
              query
            }))
            expect(state.result).toEqual(result)

            updateState({
              cache,
              getter,
              setter,
              func,
              type,
              query,
              id: 9,
              method: 'insert-after',
              value: 233
            })
              .then(() => {
                const state = getter(generateFieldName({
                  func,
                  type,
                  query
                }))
                expect(state.result).toEqual(result)

                done()
              })
          })
      })
  })

  it('如果删除后列表为空，nothing 为 true', (done) => {
    const func = 'update-state-change-nothing'
    const type = 'type'
    const query = {
      test_order: 9
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: [api.testArrData().result[0]]
      }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      id: api.testArrData().result[0].id,
      method: 'delete'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual([])
        expect(state.nothing).toBe(true)

        done()
      })
  })

  it('空列表里追加，nothing 为 false', (done) => {
    const func = 'update-state-change-nothing'
    const type = 'type'
    const query = {
      test_order: 10
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        nothing: true
      }
    })

    const newValObj = {
      id: 4,
      txt: '嘎嘎嘎'
    }

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'push',
      value: newValObj
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.nothing).toBe(false)

        done()
      })
  })

  it('如果删除，total 减少', (done) => {
    const func = 'update-state-change-total'
    const type = 'type'
    const query = {
      test_order: 11
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: [api.testArrData().result[0]]
      }
    })

    const state = getter(generateFieldName({
      func,
      type,
      query
    }))
    const beforeTotal = state.total

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      id: api.testArrData().result[0].id,
      method: 'delete'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.total).toBe(beforeTotal - 1)

        done()
      })
  })

  it('列表追加，total 增加', (done) => {
    const func = 'update-state-change-total'
    const type = 'type'
    const query = {
      test_order: 12
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        nothing: true
      }
    })

    const state = getter(generateFieldName({
      func,
      type,
      query
    }))
    const beforeTotal = state.total

    const newValObj = {
      id: 4,
      txt: '嘎嘎嘎'
    }

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'push',
      value: newValObj
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.total).toBe(beforeTotal + 1)

        done()
      })
  })

  it('调用 patch 方法修改 field 的值', (done) => {
    const func = 'update-state-call-search'
    const type = 'type'
    const query = {
      test_order: 13
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'search',
      id: 'value_2',
      uniqueKey: 'obj.key'
    })
      .then((res) => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        expect(res).toEqual(state.result[1])

        done()
      })
  })

  it('调用 delete 方法修改 field 的值', (done) => {
    const func = 'update-state-call-delete-array'
    const type = 'type'
    const query = {
      test_order: 14
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      id: [api.testArrData().result[1].id, api.testArrData().result[2].id],
      method: 'delete'
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))
        expect(state.result).toEqual([
          api.testArrData().result[0]
        ])

        done()
      })
  })

  it('调用 merge 方法修改 result 的值', (done) => {
    const func = 'merge-state-call-update'
    const type = 'type'
    const query = {
      test_order: 15
    }

    initState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        result: api.testArrData().result
      }
    })

    updateState({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      method: 'merge',
      id: 2,
      changeKey: 'obj',
      value: {
        ddd: '2333',
        key: 'value_2_changed'
      }
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const condition = [...api.testArrData().result]
        condition[1].obj = {
          ddd: '2333',
          key: 'value_2_changed'
        }

        expect(state.result).toEqual(condition)
        done()
      })
  })
})
