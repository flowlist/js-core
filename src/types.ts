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

/**
 * initData 参数
 */
export interface InitDataType<TParams extends RequestParams, TResponse>
  extends ActionParams<TParams, TResponse> {
  callback?: FetchResultCallback<TParams, TResponse>
}

/**
 * initState 参数
 */
export interface InitStateType<TParams extends RequestParams, TResponse>
  extends ActionParams<TParams, TResponse> {
  opts?: Partial<DefaultField<TResponse>>
}

/**
 * loadMore 参数
 */
export interface LoadMoreType<TParams extends RequestParams, TResponse>
  extends ActionParams<TParams, TResponse> {
  errorRetry?: boolean
  callback?: FetchResultCallback<TParams, TResponse>
}

/**
 * updateState 参数
 * 这里的 TValue 尝试对更新的值进行约束
 */
export interface UpdateStateType<TParams extends RequestParams, TResponse> {
  getter: FieldGetter
  setter: FieldSetter
  func: ApiContract<TParams, TResponse>
  query?: TParams
  method: string
  value: any // updateState 逻辑过于动态，保持 any 以兼容原逻辑，但业务层应尽量传入正确类型
  id?: ObjectKey | ObjectKey[]
  changeKey?: string
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
