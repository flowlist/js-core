// @ts-nocheck
import ItemFactory from './item-factory'

export const testArrData = () => ({
  result: [
    {
      id: 1,
      slug: 'a',
      obj: {
        key: 'value_1'
      },
      arr: [
        {
          id: 7,
          text: 'aaa'
        }
      ]
    },
    {
      id: 2,
      slug: 'b',
      obj: {
        key: 'value_2'
      },
      arr: [
        {
          id: 7,
          text: 'bbb'
        }
      ]
    },
    {
      id: 3,
      slug: 'c',
      obj: {
        key: 'value_3'
      },
      arr: [
        {
          id: 7,
          text: 'ccc'
        }
      ]
    }
  ],
  no_more: true,
  total: 3
})

export const testCommentData = () => ({
  result: [
    {
      parent_id: 1,
      content: '主评论1',
      children: [
        {
          sub_id: 2,
          content: '子评论1'
        },
        {
          sub_id: 3,
          content: '子评论2'
        }
      ]
    },
    {
      parent_id: 2,
      content: '主评论2',
      children: [
        {
          sub_id: 4,
          content: '子评论3'
        },
        {
          sub_id: 5,
          content: '子评论4'
        }
      ]
    }
  ]
})

export const testArrFunc = () => {
  return new Promise((resolve, reject) => {
    resolve(testArrData())
  })
}

export const testError = () => {
  return new Promise((resolve, reject) => {
    reject({
      message: 'error'
    })
  })
}

export const getListByPage = ({ page, count }) => {
  return new Promise((resolve) => {
    const total = 999
    const hasFetch = (page - 1) * count
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      const result = ItemFactory.get(getLength)
      resolve({
        result,
        no_more,
        total,
        extra: result
      })
    }, 50)
  })
}

export const getObjectByPage = ({ page, count }) => {
  return new Promise((resolve) => {
    const total = 87
    const hasFetch = (page - 1) * count
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      const result = {
        all: [],
        bangumi: [],
        pgc: [
          { a: 1, val: 'ddd' },
          { a: 2, val: 'xxx' }
        ]
      }
      resolve({
        result,
        no_more,
        total
      })
    }, 50)
  })
}

let SINCE_HAS_FETCHED = 0
export const getListBySinceId = ({ since_id, is_up, count }) => {
  return new Promise((resolve) => {
    const total = 87
    const hasFetch = SINCE_HAS_FETCHED
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      SINCE_HAS_FETCHED += count
      const result = ItemFactory.get(getLength)
      if (getLength < count) {
        SINCE_HAS_FETCHED = 0
      }
      resolve({
        result,
        no_more,
        total
      })
    }, 50)
  })
}

export const getListByJump = ({ page, count }) => {
  return new Promise((resolve) => {
    const total = 999
    const hasFetch = (page - 1) * count
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    setTimeout(() => {
      const result = ItemFactory.get(getLength)
      resolve({
        result,
        total
      })
    }, 50)
  })
}

export const getListWithError = ({ page, count }) => {
  return new Promise((resolve, reject) => {
    const total = 87
    const hasFetch = (page - 1) * count
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      if (Date.now() % 2) {
        const result = ItemFactory.get(getLength)
        resolve({
          result,
          no_more,
          total
        })
      } else {
        reject({
          code: 500,
          message: 'error'
        })
      }
    }, 150)
  })
}

export const getListByFirstLoading = ({ page, count }) => {
  return new Promise((resolve) => {
    const total = 87
    const hasFetch = (page - 1) * count
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    const timeout = hasFetch ? 500 : 3000
    setTimeout(() => {
      const result = ItemFactory.get(getLength)
      resolve({
        result,
        no_more,
        total
      })
    }, timeout)
  })
}

let ERROR_COUNT = 0
export const getListByFirstError = ({ page, count }) => {
  return new Promise((resolve, reject) => {
    const total = 87
    const hasFetch = (page - 1) * count
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      if (ERROR_COUNT < 3) {
        ERROR_COUNT++
        return reject({
          code: 500,
          message: 'error'
        })
      }
      const result = ItemFactory.get(getLength)
      resolve({
        result,
        no_more,
        total
      })
    }, 50)
  })
}

let LAST_FETCHED_COUNT = 0
export const getListByLastId = ({ last_id, count }) => {
  if (!last_id) {
    LAST_FETCHED_COUNT = 0
  }
  return new Promise((resolve) => {
    const beginId = 0
    const total = 87
    const hasFetch = LAST_FETCHED_COUNT - beginId
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      const result = ItemFactory.get(getLength)
      LAST_FETCHED_COUNT += getLength
      resolve({
        result,
        no_more,
        total
      })
    }, 50)
  })
}

export const getListBySeenIds = ({ seen_ids, count }) => {
  return new Promise((resolve) => {
    const total = 87
    const hasFetch = seen_ids.split(',').length
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      const result = ItemFactory.get(getLength)
      LAST_FETCHED_COUNT += getLength
      resolve({
        result,
        no_more,
        total
      })
    }, 50)
  })
}

export const getListByNothing = ({ page, count }) => {
  return new Promise((resolve) => {
    const total = 0
    const hasFetch = (page - 1) * count
    const getLength = total - hasFetch >= count ? count : total - hasFetch
    const no_more = getLength + hasFetch >= total
    setTimeout(() => {
      const result = ItemFactory.get(getLength)
      resolve({
        result,
        no_more,
        total
      })
    }, 50)
  })
}
