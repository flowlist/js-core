// @ts-nocheck
import { combineArrayData } from '../../src/utils'

describe('combine-array-data', () => {
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
