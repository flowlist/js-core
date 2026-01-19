// types.ts

/**
 * 对象的唯一标识符类型
 */
export type ObjectKey = string | number

/**
 * 通用键值对映射 - 使用 Record 以保持灵活性和性能
 */
export type KeyMap = Record<string, unknown>

/**
 * 数组元素类型
 */
export type ResultArrayType = KeyMap[]

/**
 * 对象结果类型：键为字符串，值为 KeyMap 数组
 */
export type ResultObjectType = Record<string, KeyMap[]>

/**
 * 结果类型：可以是数组或对象
 */
export type ResultType = ResultArrayType | ResultObjectType

/**
 * API 函数类型
 */
export type ApiFunction = (_params: KeyMap) => Promise<ApiResponse>

/**
 * 数据源类型：可以是 API 路径字符串，或返回 Promise 的函数
 */
export type DataSource = string | ApiFunction

export interface DefaultField {
  result: ResultType
  noMore: boolean
  nothing: boolean
  loading: boolean
  error: Error | null
  extra: KeyMap | null
  fetched: boolean
  page: number
  total: number
}

export type FieldKeys = keyof DefaultField

/**
 * 字段获取器：根据字段名获取状态对象
 */
export type FieldGetter = (_key: string) => DefaultField | undefined

/**
 * Setter 函数的参数
 */
export interface SetterFuncParams {
  readonly key: string
  readonly type: number
  readonly value: Partial<DefaultField> | DefaultField
  readonly callback?: (_obj?: KeyMap) => void
}

/**
 * 状态设置器函数类型
 */
export type FieldSetter = (_obj: SetterFuncParams) => void

/**
 * 数据获取类型枚举
 */
export type FetchType = 'jump' | 'sinceId' | 'page' | 'seenIds' | 'auto'

/**
 * 生成请求参数的输出
 */
export interface GenerateParamsResp extends KeyMap {
  seen_ids?: string
  since_id?: ObjectKey
  is_up?: 0 | 1
  page?: number
}

/**
 * 生成请求参数的输入
 */
export interface GenerateParamsType {
  readonly field: DefaultField
  readonly uniqueKey?: string
  readonly query?: KeyMap
  readonly type: FetchType
}

/**
 * API 响应结构
 */
export interface ApiResponse {
  readonly result: ResultType
  readonly extra?: KeyMap
  readonly total?: number
  readonly no_more?: boolean
}

/**
 * 获取数据后的回调函数
 */
export type FetchResultCallback = (_obj: {
  params: KeyMap
  data: ApiResponse
  refresh: boolean
}) => void

// =============
// 【内部抽象】将重复的公共参数提取出来
// =============
interface CommonParams {
  readonly func: DataSource
  readonly type: FetchType
  readonly query?: KeyMap
  readonly uniqueKey?: string
  readonly callback?: FetchResultCallback
}

// --- 公共配置基类 ---
// 【内部使用】注意：这个基类不对外导出，仅用于内部组合
interface BaseFetchConfig extends CommonParams {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
  readonly api?: Record<string, ApiFunction>
}

/**
 * 初始化状态的参数对外接口
 */
export interface InitStateParams {
  readonly func: DataSource
  readonly type: FetchType
  readonly query?: KeyMap
  readonly opts?: Partial<DefaultField>
}

/**
 * 初始化状态的参数（内部）
 */
export interface InitStateType extends InitStateParams {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
}

/**
 * 初始化数据的参数对外接口
 */
export type InitDataParams = CommonParams

/**
 * 初始化数据的参数（内部）
 */
export type InitDataType = BaseFetchConfig

/**
 * 加载更多的参数对外接口
 */
export interface LoadMoreParams extends CommonParams {
  readonly errorRetry?: boolean
}

/**
 * 加载更多的参数（内部）
 */
export interface LoadMoreType extends BaseFetchConfig {
  readonly errorRetry?: boolean
}

/**
 * 更新状态的参数（内部使用）
 */
export interface UpdateStateType<T = KeyMap> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
  readonly func: DataSource
  readonly type: FetchType
  readonly query?: KeyMap
  readonly method: string
  readonly value: T | ResultArrayType | ResultObjectType | KeyMap
  readonly id?: ObjectKey | ObjectKey[]
  readonly changeKey?: string
  readonly uniqueKey?: string
}

/**
 * 更新状态的参数（对外接口）
 */
export interface UpdateStateParams<T = KeyMap> {
  readonly func: DataSource
  readonly type: FetchType
  readonly query?: KeyMap
  readonly method: string
  readonly value: T | ResultArrayType | ResultObjectType | KeyMap
  readonly id?: ObjectKey | ObjectKey[]
  readonly changeKey?: string
  readonly uniqueKey?: string
}

/**
 * 设置数据的参数
 */
export interface SetDataType {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
  readonly data: ApiResponse
  readonly fieldName: string
  readonly type: FetchType
  readonly page: number
  readonly insertBefore: boolean
}

/**
 * 设置错误的参数
 */
export interface SetErrorType {
  readonly setter: FieldSetter
  readonly fieldName: string
  readonly error: Error | null
}
