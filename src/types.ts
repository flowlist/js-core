// types.ts
/**
 * 对象的唯一标识符类型
 */
export type ObjectKey = string | number

/**
 * 通用键值对映射
 */
export type KeyMap = Record<ObjectKey, unknown>

/**
 * 形态数组
 */
export type MorphArray = unknown[]

type FuncType = string | ((params: unknown) => Promise<unknown>)

type GetterType = <T = unknown, E = unknown>(
  str: string
) => DefaultField<T, E> | undefined

type SetterType = (obj: SetterFuncParams) => void

type FetchResultCallback = (obj: {
  params: GenerateParamsResp
  data: unknown
  refresh: boolean
}) => void

/**
 * 数据获取类型枚举
 */
export type FetchType = 'jump' | 'sinceId' | 'page' | 'seenIds' | 'auto'

/**
 * 字段数据的关键字
 */
export type FieldKeys =
  | 'result'
  | 'noMore'
  | 'nothing'
  | 'loading'
  | 'error'
  | 'extra'
  | 'fetched'
  | 'page'
  | 'total'

/**
 * 生成字段名称的参数
 */
export interface GenerateFieldProps {
  func: FuncType
  type: FetchType
  query?: KeyMap
}

/**
 * 生成请求参数的输入
 */
export interface GenerateParamsType {
  field: DefaultField<unknown, unknown>
  uniqueKey: string
  query?: KeyMap
  type: FetchType
}

/**
 * 生成请求参数的输出
 */
export interface GenerateParamsResp {
  seen_ids?: string
  since_id?: ObjectKey
  is_up?: 0 | 1
  page?: number
}

/**
 * Setter 函数的参数
 */
export interface SetterFuncParams {
  key: string
  type: number // 未来可考虑用枚举
  value: unknown
  callback?: (obj?: KeyMap) => void
}

/**
 * 默认字段数据结构，使用泛型 T 和 E 分别代表 result 和 extra 的类型
 */
export interface DefaultField<T = unknown, E = unknown> {
  result: T
  noMore: boolean
  nothing: boolean
  loading: boolean
  error: null | Error
  extra: E
  fetched: boolean
  page: number
  total: number
}

/**
 * API 响应结构，使用泛型 T 和 E
 */
export interface ApiResponse<T = unknown, E = unknown> {
  result: T
  extra?: E
  total?: number
  no_more?: boolean
}

/**
 * 初始化状态的参数
 */
export interface InitStateType {
  getter: GetterType
  setter: SetterType
  func: FuncType
  type: FetchType
  query?: KeyMap
  opts?: Partial<DefaultField<unknown, unknown>>
}

/**
 * 初始化数据的参数
 */
export interface InitDataType {
  getter: GetterType
  setter: SetterType
  func: FuncType
  type: FetchType
  query?: KeyMap
  api: KeyMap
  uniqueKey: string
  callback?: FetchResultCallback
}

/**
 * 加载更多的参数
 */
export interface LoadMoreType {
  getter: GetterType
  setter: SetterType
  func: FuncType
  type: FetchType
  query?: KeyMap
  api: KeyMap
  uniqueKey: string
  errorRetry: boolean
  callback?: FetchResultCallback
}

/**
 * 更新状态的参数
 */
export interface UpdateStateType<T = unknown, E = unknown> {
  getter: (str: string) => DefaultField<T, E> | undefined
  setter: SetterType
  func: FuncType
  type: FetchType
  query?: KeyMap
  method: string
  value: ResultArrayType | Record<ObjectKey, KeyMap>
  id?: string | number | ObjectKey[]
  changeKey?: string
  uniqueKey?: string
}

/**
 * 设置数据的参数
 */
export interface SetDataType<T = unknown, E = unknown> {
  getter: (str: string) => DefaultField<T, E> | undefined
  setter: SetterType
  data: T | ApiResponse<T, E>
  fieldName: string
  type: FetchType
  page: number
  insertBefore: boolean
}

/**
 * 设置错误的参数
 */
export interface SetErrorType {
  setter: SetterType
  fieldName: string
  error: Error
}

export type ResultArrayType = KeyMap[]

export type ResultObjectType = Record<ObjectKey, KeyMap[]>
