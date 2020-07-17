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

export const cache = {
  set({ key, value, timeout }) {
    try {
      localStorage.setItem(`vue-mixin-store-${key}`, JSON.stringify(value))
      localStorage.setItem(`vue-mixin-store-${key}-expired-at`, Date.now() + timeout * 1000)
    } catch (e) {
      // do nothing
    }
  },

  get({ key }) {
    try {
      const expiredAt = localStorage.getItem(`vue-mixin-store-${key}-expired-at`)
      const cacheStr = localStorage.getItem(`vue-mixin-store-${key}`)
      if (!expiredAt || !cacheStr || Date.now() - expiredAt > 0) {
        this.del(key)
        return null
      }
      return JSON.parse(cacheStr)
    } catch (e) {
      this.del(key)
      return null
    }
  },

  del({ key }) {
    localStorage.removeItem(`vue-mixin-store-${key}`)
    localStorage.removeItem(`vue-mixin-store-${key}-expired-at`)
  }
}
