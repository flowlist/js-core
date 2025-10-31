// types.ts

/**
 * 对象的唯一标识符类型
 */
export type ObjectKey = string | number

/**
 * 通用键值对映射（注意：尽管 ObjectKey 包含 number，
 * 但在实际对象中，number 键会被转为 string。
 * 此处使用 string 以符合 Record 的实际行为 [[3]]）
 */
export type KeyMap = Record<string, unknown>

/**
 * 形态数组
 */
export type ResultType = KeyMap | unknown[]

/**
 * 数据源类型：可以是 API 路径字符串，或返回 Promise 的函数
 */
type DataSource = string | ((params: unknown) => Promise<unknown>)

/**
 * 字段获取器：根据字段名获取状态对象
 */
export type FieldGetter = (key: string) => DefaultField | undefined

/**
 * 状态设置器函数类型
 */
export type FieldSetter = (obj: SetterFuncParams) => void

/**
 * 获取数据后的回调函数
 */
type FetchResultCallback = (obj: {
  params: GenerateParamsResp
  data: ApiResponse
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

// =============
// 【内部抽象】将重复的公共参数提取出来
// =============
interface CommonParams {
  func: DataSource
  type: FetchType
  query?: KeyMap
  uniqueKey?: string
  callback?: FetchResultCallback
}

/**
 * 生成请求参数的输入
 */
export interface GenerateParamsType {
  field: DefaultField
  uniqueKey?: string
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
  type: number
  value: unknown
  callback?: (obj?: KeyMap) => void
}

/**
 * 默认字段数据结构，使用泛型 T 和 E 分别代表 result 和 extra 的类型
 */
export interface DefaultField {
  result: ResultType
  noMore: boolean
  nothing: boolean
  loading: boolean
  error: null | Error
  extra: unknown
  fetched: boolean
  page: number
  total: number
}

/**
 * API 响应结构，使用泛型 T 和 E
 */
export interface ApiResponse {
  result: ResultType
  extra?: unknown
  total?: number
  no_more?: boolean
}

// --- 公共配置基类 ---
// 【内部使用】注意：这个基类不对外导出，仅用于内部组合
interface BaseFetchConfig extends CommonParams {
  getter: FieldGetter
  setter: FieldSetter
  api?: KeyMap
}

/**
 * 初始化状态的参数
 */
export interface InitStateType extends BaseFetchConfig {
  opts?: Partial<DefaultField>
}

/**
 * 初始化数据的参数
 */
export type InitDataType = BaseFetchConfig

/**
 * 加载更多的参数
 */
export interface LoadMoreType extends BaseFetchConfig {
  errorRetry?: boolean
}

/**
 * 更新状态的参数
 */
export interface UpdateStateType {
  getter: FieldGetter
  setter: FieldSetter
  func: DataSource
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
export interface SetDataType {
  getter: FieldGetter
  setter: FieldSetter
  data: ApiResponse
  fieldName: string
  type: FetchType
  page: number
  insertBefore: boolean
}

/**
 * 设置错误的参数
 */
export interface SetErrorType {
  setter: FieldSetter
  fieldName: string
  error: null | Error
}

export type ResultArrayType = KeyMap[]

export type ResultObjectType = Record<ObjectKey, KeyMap[]>

export type InitDataParams = CommonParams

export interface LoadMoreParams extends CommonParams {
  errorRetry?: boolean
}
