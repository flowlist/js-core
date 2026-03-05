// types.ts

// ==========================================
// 基础工具类型
// ==========================================

/** 对象的唯一标识符类型 */
export type ObjectKey = string | number

/** 通用对象结构 */
export type KeyMap = Record<string, any>

/** API 响应基础结构 */
export interface BaseApiResponse<TData = any> {
  readonly result: TData
  readonly extra?: any
  readonly total?: number
  readonly no_more?: boolean
}

// ==========================================
// 状态管理类型
// ==========================================

/** 核心状态字段 */
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

/** 请求参数基础约束 */
export interface RequestParams {
  [key: string]: any
  __refresh__?: boolean
  __reload__?: boolean
  page?: number
  sinceId?: ObjectKey
}

/** 数据获取策略类型 */
export type FetchType = 'jump' | 'sinceId' | 'page' | 'seenIds' | 'auto'

/** API 契约 */
export interface ApiContract<TParams extends RequestParams, TResponse> {
  (params: TParams): Promise<BaseApiResponse<TResponse>>
  readonly id: string
  readonly type: FetchType
  readonly is_up: boolean
  readonly uniqueKey: string
  readonly paramsIgnore: string[]
}

// ==========================================
// 字段 getter/setter
// ==========================================

export type FieldGetter = (key: string) => DefaultField | undefined

export interface SetterFuncParams {
  readonly key: string
  readonly type: number
  readonly value: Partial<DefaultField> | DefaultField
  readonly callback?: (obj?: any) => void
}

export type FieldSetter = (obj: SetterFuncParams) => void

// ==========================================
// 请求参数生成
// ==========================================

export interface GenerateParamsResp extends RequestParams {
  seen_ids?: string
  since_id?: ObjectKey
  is_up?: 0 | 1
  page?: number
  extra?: any
}

export interface GenerateParamsType {
  readonly field: DefaultField
  readonly uniqueKey?: string
  readonly is_up?: boolean
  readonly query?: KeyMap
  readonly type: FetchType
}

// ==========================================
// Action 参数类型
// ==========================================

export type FetchResultCallback<TParams, TResponse> = (obj: {
  params: TParams
  data: BaseApiResponse<TResponse>
  refresh: boolean
}) => void

// ---- Setters ----

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

// ---- External Params (无 getter/setter) ----

export interface InitStateParams<
  P extends RequestParams = RequestParams,
  R = any
> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly opts?: Partial<DefaultField<R>>
}

export interface InitDataParams<
  P extends RequestParams = RequestParams,
  R = any
> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly callback?: FetchResultCallback<P, R>
}

export interface LoadMoreParams<
  P extends RequestParams = RequestParams,
  R = any
> {
  readonly func: ApiContract<P, R>
  readonly query?: P
  readonly errorRetry?: boolean
  readonly callback?: FetchResultCallback<P, R>
}

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

// ---- Internal Params (含 getter/setter) ----

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

// ==========================================
// Mutation handler 类型（策略模式）
// ==========================================

export interface MutationContext {
  resultArray: any[] | null
  newFieldData: DefaultField
  _id: ObjectKey | ObjectKey[] | undefined
  _uniqueKey: string
  _changeKey: string
  value: any
}

/** mutation handler 返回值：处理后的 modifyValue 或 undefined 表示已直接修改 newFieldData */
export type MutationHandler = (ctx: MutationContext) => {
  resolved?: unknown
  modifyValue?: unknown
} | void
