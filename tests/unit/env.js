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
