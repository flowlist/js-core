// types.ts

// ==========================================
// 基础工具类型
// ==========================================

/**
 * 对象的唯一标识符类型
 */
export type ObjectKey = string | number

/**
 * 通用对象结构 (仅用于内部弱类型处理，对外尽量使用泛型)
 */
export type KeyMap = Record<string, any>

/**
 * 所有的 API 响应都应该遵循这个基础结构
 */
export interface BaseApiResponse<TData = any> {
  readonly result: TData
  readonly extra?: any
  readonly total?: number
  readonly no_more?: boolean
}

// ==========================================
// 状态管理类型 (State)
// ==========================================

/**
 * 核心状态字段
 * @template TData 具体的 result 数据类型 (e.g. User[] or Record<string, User[]>)
 * @template TExtra extra 字段的类型
 */
export interface DefaultField<TData = any, TExtra = any> {
  result: TData
  noMore: boolean
  nothing: boolean
  loading: boolean
  error: Error | null
  extra: TExtra | null
  fetched: boolean
  page: number
  total: number
}

export type FieldKeys = keyof DefaultField

// ==========================================
// API 契约与请求类型
// ==========================================

/**
 * 请求参数的基础约束
 */
export interface RequestParams {
  [key: string]: any
  __refresh__?: boolean
  __reload__?: boolean
  is_up?: 0 | 1 | boolean
  page?: number
  sinceId?: ObjectKey
}

/**
 * API 契约：核心类型
 * @template TParams 请求参数类型
 * @template TResponse 响应的 result 数据类型
 */
export interface ApiContract<TParams extends RequestParams, TResponse> {
  /**
   * 调用函数
   */
  (params: TParams): Promise<BaseApiResponse<TResponse>>

  /**
   * 静态属性
   */
  readonly id: string
  readonly type: FetchType
  readonly uniqueKey: string
  readonly paramsIgnore: string[]
}

/**
 * 数据获取策略类型
 */
export type FetchType = 'jump' | 'sinceId' | 'page' | 'seenIds' | 'auto'

// ==========================================
// 内部/外部 交互参数类型
// ==========================================

/**
 * 字段获取器
 */
export type FieldGetter = (key: string) => DefaultField | undefined

/**
 * 字段设置器参数
 */
export interface SetterFuncParams {
  readonly key: string
  readonly type: number
  readonly value: Partial<DefaultField> | DefaultField
  readonly callback?: (obj?: any) => void
}

export type FieldSetter = (obj: SetterFuncParams) => void

/**
 * 生成请求参数的返回值
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

// ==========================================
// Action 参数类型 (强类型推断)
// ==========================================

/**
 * 回调函数类型
 */
export type FetchResultCallback<TParams, TResponse> = (obj: {
  params: TParams
  data: BaseApiResponse<TResponse>
  refresh: boolean
}) => void

/**
 * 通用 Action 参数约束
 */
interface ActionParams<TParams extends RequestParams, TResponse> {
  getter: FieldGetter
  setter: FieldSetter
  func: ApiContract<TParams, TResponse>
  query?: TParams // 这里的 query 被强约束为 TParams
}

// ==========================================
// Setters 参数
// ==========================================

export interface SetDataType {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
  readonly data: BaseApiResponse
  readonly fieldName: string
  readonly type: FetchType
  readonly page: number
  readonly insertBefore: boolean
}

export interface SetErrorType {
  readonly setter: FieldSetter
  readonly fieldName: string
  readonly error: Error | null
}

/**
 * 初始化状态的外部参数
 */
export interface InitStateParams<
  P extends RequestParams = RequestParams,
  R = any
> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly opts?: Partial<DefaultField<R>>
}

/**
 * 初始化数据的外部参数
 */
export interface InitDataParams<
  P extends RequestParams = RequestParams,
  R = any
> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly callback?: FetchResultCallback<P, R>
}

/**
 * 加载更多的外部参数
 */
export interface LoadMoreParams<
  P extends RequestParams = RequestParams,
  R = any
> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly errorRetry?: boolean
  readonly callback?: FetchResultCallback<P, R>
}

/**
 * 更新状态的外部参数
 */
export interface UpdateStateParams<
  P extends RequestParams = RequestParams,
  R = any
> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly method: string
  readonly value: any
  readonly id?: ObjectKey | ObjectKey[]
  readonly changeKey?: string
  readonly uniqueKey?: string
}

export interface InitStateType<P extends RequestParams, R>
  extends InitStateParams<P, R> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
}

export interface InitDataType<P extends RequestParams, R>
  extends InitDataParams<P, R> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
}

export interface LoadMoreType<P extends RequestParams, R>
  extends LoadMoreParams<P, R> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
}

export interface UpdateStateType<P extends RequestParams, R>
  extends UpdateStateParams<P, R> {
  readonly getter: FieldGetter
  readonly setter: FieldSetter
}
