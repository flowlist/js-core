const globalData = {}

export const getter = (fieldName) => {
  const result = globalData[fieldName]
  return result ? { ...result } : null
}

export const setter = ({ key, type, value, callback }) => {
  if (type === 0) {
    globalData[key] = value
  } else if (type === 1) {
    globalData[key] = {
      ...(globalData[key] || {}),
      ...value
    }
  }
  callback && callback()
}

const testArrData = {
  result: [1, 2, 3],
  no_more: true,
  total: 3
}

export const api = {
  testArrData,
  testArrFunc: () => {
    return new Promise((resolve, reject) => {
      resolve(testArrData)
    })
  },
  testError: () => {
    return new Promise((resolve, reject) => {
      reject({
        message: 'error'
      })
    })
  }
}
