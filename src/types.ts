// types.ts
import { ENUM } from '.'

/**
 * 对象的唯一标识符类型
 */
export type ObjectKey = string | number

/**
 * 通用键值对映射 - 使用 Record 以保持灵活性和性能
 * 通过索引签名支持动态属性访问
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
 * 请求参数的基础约束
 */
export interface RequestParams {
  [key: string]: unknown
  __refresh__?: boolean
  __reload__?: boolean
  is_up?: 0 | 1 | boolean
  page?: number
  sinceId?: ObjectKey
}

/**
 * 生成请求参数的输出
 * 继承自 RequestParams 以确保与 ApiContract 参数兼容
 */
export interface GenerateParamsResp extends RequestParams {
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
export interface ApiResponse<R = ResultType> {
  readonly result: R // 具体的列表数据
  readonly extra?: KeyMap // 翻页游标或其他元数据
  readonly total?: number // 总条数
  readonly no_more?: boolean // 是否加载完毕
}

/**
 * 获取数据后的回调函数
 */
export type FetchResultCallback<P, R> = (_obj: {
  params: P
  data: ApiResponse<R>
  refresh: boolean
}) => void

// =============
// 【内部抽象】将重复的公共参数提取出来
// =============
interface CommonParams<P = RequestParams, R = ResultType> {
  readonly func: ApiContract<P, R> // 契约对象
  readonly type?: FetchType // 抓取类型
  readonly query?: P // 参数类型必须与契约 P 一致
  readonly uniqueKey?: string // 覆盖契约中的 uniqueKey (可选)
  readonly callback?: FetchResultCallback<P, R> // 强类型回调
}

// --- 公共配置基类 ---
// 【内部使用】注意：这个基类不对外导出，仅用于内部组合
interface BaseFetchConfig<
  P = RequestParams,
  R = ResultType
> extends CommonParams<P, R> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
}

/**
 * 初始化状态的参数对外接口
 */
export interface InitStateParams<P = RequestParams, R = ResultType> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly opts?: Partial<DefaultField>
}

/**
 * 初始化状态的参数（内部）
 */
export interface InitStateType<
  P = RequestParams,
  R = ResultType
> extends InitStateParams<P, R> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
}

/**
 * 初始化数据的参数对外接口
 */
export type InitDataParams<P = RequestParams, R = ResultType> = CommonParams<
  P,
  R
>

/**
 * 初始化数据的参数（内部）
 */
export type InitDataType<P = RequestParams, R = ResultType> = BaseFetchConfig<
  P,
  R
>

/**
 * 加载更多的参数对外接口
 */
export interface LoadMoreParams<
  P = RequestParams,
  R = ResultType
> extends CommonParams<P, R> {
  readonly errorRetry?: boolean
}

/**
 * 加载更多的参数（内部）
 */
export interface LoadMoreType<
  P = RequestParams,
  R = ResultType
> extends BaseFetchConfig<P, R> {
  readonly errorRetry?: boolean
}

/**
 * 更新状态的参数（内部使用）
 */
export interface UpdateStateType<
  P = RequestParams,
  R = ResultType,
  T = KeyMap
> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly method: string
  readonly value: T | T[] | KeyMap | KeyMap[] // 更新的具体值
  readonly id?: ObjectKey | ObjectKey[]
  readonly changeKey?: string // 指定修改 result 内部的哪个 key
}
/**
 * 更新状态的参数（对外接口）
 */
export interface UpdateStateParams<
  P = RequestParams,
  R = ResultType,
  T = KeyMap
> {
  readonly func: ApiContract<P, R>
  readonly type: FetchType
  readonly query?: P
  readonly method: string
  readonly value: T | T[] | KeyMap | KeyMap[]
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

export interface ApiContract<P = RequestParams, R = ResultType> {
  (params: P): Promise<ApiResponse<R>>
  readonly id: string // 稳定标识
  readonly type: FetchType // AI 请求类型
  readonly uniqueKey: string // 数据项的唯一标识字段 (如 'id', 'msg_id')
  readonly paramsIgnore: string[] // 生成 fieldName 时忽略的参数（如 page）
}

/**
 * 可分配属性的 API 契约类型（用于 createApi 内部）
 */
interface MutableApiContract<P, R> {
  (params: P): Promise<ApiResponse<R>>
  id: string
  type: FetchType
  uniqueKey: string
  paramsIgnore: string[]
}

export function createApi<P = RequestParams, R = ResultType>(options: {
  id: string
  type?: FetchType
  uniqueKey?: string // 默认为 'id'
  paramsIgnore?: string[] // 默认忽略翻页相关字段
  fetcher: (params: P) => Promise<ApiResponse<R>>
}): ApiContract<P, R> {
  const fn: MutableApiContract<P, R> = Object.assign(
    (params: P) => options.fetcher(params),
    {
      id: options.id,
      type: options.type || ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      uniqueKey: options.uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME,
      paramsIgnore: [
        'page',
        'is_up',
        'since_id',
        'seen_ids',
        '__refresh__',
        '__reload__',
        ...(options.paramsIgnore || [])
      ]
    }
  )
  return Object.freeze(fn)
}
