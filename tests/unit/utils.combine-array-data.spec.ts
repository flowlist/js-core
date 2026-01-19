// @ts-nocheck
import { combineArrayData } from '../../src/utils'

describe('combine-array-data', () => {
  it('fieldArray 中存在非对象项时跳过', () => {
    const field = [
      {
        id: 1,
        txt: '2333'
      },
      null,
      'string',
      {
        id: 2,
        txt: '666'
      }
    ]

    combineArrayData(
      field,
      [
        {
          id: 1,
          txt: 'change1'
        },
        {
          id: 2,
          txt: 'change2'
        }
      ],
      'id'
    )

    expect(field[0].txt).toBe('change1')
    expect(field[1]).toBe(null)
    expect(field[2]).toBe('string')
    expect(field[3].txt).toBe('change2')
  })

  it('value 数组中存在非对象项时跳过', () => {
    const field = [
      {
        id: 1,
        txt: '2333'
      },
      {
        id: 2,
        txt: '666'
      }
    ]

    combineArrayData(
      field,
      [
        {
          id: 1,
          txt: 'change1'
        },
        null,
        'string'
      ],
      'id'
    )

    expect(field[0].txt).toBe('change1')
    expect(field[1].txt).toBe('666')
  })

  it('value 对象中存在非对象值时跳过', () => {
    const field = [
      {
        id: 1,
        txt: '2333'
      },
      {
        id: 2,
        txt: '666'
      }
    ]

    combineArrayData(
      field,
      {
        1: {
          txt: 'change1'
        },
        2: null,
        3: 'string'
      },
      'id'
    )

    expect(field[0].txt).toBe('change1')
    expect(field[1].txt).toBe('666')
  })

  it('value 是数组', () => {
    const field = [
      {
        id: 1,
        txt: '2333',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: '666',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ]

    combineArrayData(
      field,
      [
        {
          id: 1,
          txt: 'change1'
        },
        {
          id: 2,
          txt: 'change2'
        }
      ],
      'id'
    )

    expect(field).toEqual([
      {
        id: 1,
        txt: 'change1',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: 'change2',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ])
  })

  it('value 是数组，id 在深层', () => {
    const field = [
      {
        id: 1,
        txt: '2333',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: '666',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ]

    combineArrayData(
      field,
      [
        {
          obj: {
            slug: 'a'
          },
          txt: 'change1'
        },
        {
          obj: {
            slug: 'b'
          },
          txt: 'change2'
        }
      ],
      'obj.slug'
    )

    expect(field).toEqual([
      {
        id: 1,
        txt: 'change1',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: 'change2',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ])
  })

  it('value 是对象', () => {
    const field = [
      {
        id: 1,
        txt: '2333',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: '666',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ]

    combineArrayData(
      field,
      {
        1: {
          txt: 'change1'
        },
        2: {
          txt: 'change2'
        }
      },
      'id'
    )

    expect(field).toEqual([
      {
        id: 1,
        txt: 'change1',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: 'change2',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ])
  })

  it('value 是对象，id 在深层', () => {
    const field = [
      {
        id: 1,
        txt: '2333',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: '666',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ]

    combineArrayData(
      field,
      {
        a: {
          txt: 'change1'
        },
        b: {
          txt: 'change2'
        }
      },
      'obj.slug'
    )

    expect(field).toEqual([
      {
        id: 1,
        txt: 'change1',
        obj: {
          slug: 'a'
        }
      },
      {
        id: 2,
        txt: 'change2',
        obj: {
          slug: 'b'
        }
      },
      {
        id: 3,
        txt: '888',
        obj: {
          slug: 'c'
        }
      }
    ])
  })
})
