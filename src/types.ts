export type objectKey = string | number

export type keyMap = Record<objectKey, any>

export type morphArray = any[]

export type fieldResult = morphArray | keyMap

export type defaultField = {
  result: fieldResult
  noMore: boolean
  nothing: boolean
  loading: boolean
  error: null | Error
  extra: null | any
  fetched: boolean
  page: number
  total: number
}

export type fetchTypes = 'jump' | 'sinceId' | 'page' | 'seenIds' | 'auto'

export type fieldKeys =
  | 'result'
  | 'noMore'
  | 'nothing'
  | 'loading'
  | 'error'
  | 'extra'
  | 'page'
  | 'total'

export type generateFieldProps = {
  func: string | (() => {})
  type: fetchTypes
  query?: keyMap
}

export type generateParamsType = {
  field: defaultField
  uniqueKey: string
  query?: keyMap
  type: fetchTypes
}

export type generateParamsResp = {
  seen_ids?: string
  since_id?: objectKey
  is_up?: 0 | 1
  page?: number
}

export type setterFuncParams = {
  key: string
  type: number
  value: any
  callback?: (obj?: keyMap) => void
}

export type initStateType = {
  getter: (str: string) => defaultField
  setter: (obj: setterFuncParams) => void
  func: string | (() => {})
  type: fetchTypes
  query?: keyMap
  opts?: keyMap
}

export type initDataType = {
  getter: (str: string) => defaultField
  setter: (obj: setterFuncParams) => void
  func: string | (() => {})
  type: fetchTypes
  query?: keyMap
  api: keyMap
  cacheTimeout: number
  uniqueKey: string
  callback: (obj?: keyMap) => void
}

export type loadMoreType = {
  getter: (str: string) => defaultField
  setter: (obj: setterFuncParams) => void
  func: string | (() => {})
  type: fetchTypes
  query?: keyMap
  api: keyMap
  cacheTimeout: number
  uniqueKey: string
  errorRetry: boolean
  callback: (obj?: keyMap) => void
}

export type updateStateType = {
  getter: (str: string) => defaultField
  setter: (obj: setterFuncParams) => void
  func: string | (() => {})
  type: fetchTypes
  query?: keyMap
  method: string
  value: any
  id: string | number | objectKey[]
  changeKey: string
  cacheTimeout: number
  uniqueKey: string
}

export type setDataType = {
  getter: (str: string) => defaultField
  setter: (obj: setterFuncParams) => void
  data: any
  fieldName: string
  type: fetchTypes
  page: number
  insertBefore: boolean
}

export type setErrorType = {
  setter: (obj: setterFuncParams) => void
  fieldName: string
  error: null | Error
}
