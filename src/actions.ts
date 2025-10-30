// actions.ts
import {
  generateDefaultField,
  generateFieldName,
  generateRequestParams,
  computeMatchedItemIndex,
  combineArrayData,
  updateObjectDeepValue,
  getObjectDeepValue,
  computeResultLength,
  searchValueByKey,
  isArray
} from './utils'
import { SET_DATA, SET_ERROR } from './setters'
import ENUM from './enum'
import type {
  ObjectKey,
  InitStateType,
  InitDataType,
  LoadMoreType,
  UpdateStateType,
  DefaultField,
  KeyMap,
  ResultArrayType,
  ResultObjectType
} from './types'

// --- initState: func is now just a string ---
export const initState = ({
  getter,
  setter,
  func, // string only
  type,
  query,
  opts
}: InitStateType): Promise<void> => {
  return new Promise((resolve) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    if (fieldData) {
      resolve()
      return
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField(opts),
      callback: () => {
        resolve()
      }
    })
  })
}

export const initData = ({
  getter,
  setter,
  func, // string | function
  type,
  query,
  api,
  uniqueKey,
  callback
}: InitDataType): Promise<void> =>
  new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    const doRefresh = !!query?.__refresh__
    const needReset = !!query?.__reload__

    if (fieldData && fieldData.error && !doRefresh) {
      resolve()
      return
    }
    if (fieldData && fieldData.loading) {
      resolve()
      return
    }
    const dontFetch = fieldData && fieldData.fetched && !doRefresh
    if (dontFetch) {
      resolve()
      return
    }

    const params = generateRequestParams({
      field: {
        ...(fieldData || generateDefaultField()),
        fetched: false
      },
      uniqueKey,
      query,
      type
    })

    const getData = () => {
      const loadData = () =>
        new Promise<unknown>((res, rej) => {
          const getDataFromAPI = () => {
            const funcCaller =
              typeof func === 'string'
                ? (api[func] as (p: unknown) => Promise<unknown>)
                : func

            funcCaller(params)
              .then(res)
              .catch((error: Error) => {
                SET_ERROR({ setter, fieldName, error })
                rej(error)
              })
          }

          getDataFromAPI()
        })

      loadData()
        .then((data) => {
          // <-- 'data' is now properly in scope
          const setData = () => {
            SET_DATA({
              getter,
              setter,
              data,
              fieldName,
              type,
              page: params.page || 0,
              insertBefore: false
            }).then(() => {
              if (callback) {
                callback({
                  params,
                  data, // <-- 'data' is now properly in scope
                  refresh: doRefresh
                })
              }
              resolve()
            })
          }

          if (needReset) {
            setter({
              key: fieldName,
              type: ENUM.SETTER_TYPE.RESET,
              value: generateDefaultField(),
              callback: setData
            })
          } else {
            setData()
          }
        })
        .catch(reject)
    }

    if (!dontFetch && !needReset) {
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: {
          ...generateDefaultField(),
          loading: true,
          error: null
        },
        callback: getData
      })
    } else {
      getData()
    }
  })

export const loadMore = ({
  getter,
  setter,
  query,
  type,
  func, // string | function
  api,
  uniqueKey,
  errorRetry,
  callback
}: LoadMoreType): Promise<void> =>
  new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)

    if (!fieldData) {
      resolve()
      return
    }

    if (fieldData.loading) {
      resolve()
      return
    }
    if (fieldData.nothing) {
      resolve()
      return
    }
    if (fieldData.noMore && !errorRetry) {
      resolve()
      return
    }
    if (
      type === ENUM.FETCH_TYPE.PAGINATION &&
      query &&
      query.page != null &&
      +query.page === fieldData.page
    ) {
      resolve()
      return
    }

    let loadingState: Partial<DefaultField>
    if (type === ENUM.FETCH_TYPE.PAGINATION) {
      loadingState = {
        loading: true,
        error: null,
        [ENUM.FIELD_DATA.RESULT_KEY]: [],
        [ENUM.FIELD_DATA.EXTRA_KEY]: null
      }
    } else {
      loadingState = {
        loading: true,
        error: null
      }
    }

    const params = generateRequestParams({
      field: fieldData,
      uniqueKey,
      query,
      type
    })

    if ('extra' in fieldData) {
      ;(params as KeyMap)[ENUM.FIELD_DATA.EXTRA_KEY] = fieldData.extra
    }

    const getData = () => {
      const funcCaller =
        typeof func === 'string'
          ? (api[func] as (p: unknown) => Promise<unknown>)
          : func

      funcCaller(params)
        .then((data: unknown) => {
          SET_DATA({
            getter,
            setter,
            data,
            fieldName,
            type,
            page: params.page || 0,
            insertBefore: !!query?.is_up
          }).then(() => {
            if (callback) {
              callback({
                params,
                data,
                refresh: false
              })
            }
            resolve()
          })
        })
        .catch((error: Error) => {
          SET_ERROR({ setter, fieldName, error })
          reject(error)
        })
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.MERGE,
      value: loadingState,
      callback: getData
    })
  })

// --- updateState: func is now just a string ---
export const updateState = ({
  getter,
  setter,
  func, // string only
  type,
  query,
  method,
  value,
  id,
  uniqueKey,
  changeKey
}: UpdateStateType): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject(new Error(`Field ${fieldName} not found.`))
      return
    }

    if (fieldData.page === -1) {
      resolve(null)
      return
    }

    const _id = id
    const _uniqueKey = uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME
    const _changeKey = changeKey || ENUM.FIELD_DATA.RESULT_KEY
    const beforeLength = computeResultLength(
      fieldData[ENUM.FIELD_DATA.RESULT_KEY]
    )

    const newFieldData: DefaultField = { ...fieldData }

    if (method === ENUM.CHANGE_TYPE.SEARCH_FIELD) {
      if (_id == null) {
        reject(new Error('ID is required for SEARCH_FIELD.'))
        return
      }
      // --- 修正: 安全断言 ---
      const result = searchValueByKey(
        newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as
          | ResultArrayType
          | ResultObjectType,
        _id as ObjectKey,
        _uniqueKey
      )
      resolve(result)
    } else if (method === ENUM.CHANGE_TYPE.RESULT_UPDATE_KV) {
      if (_id == null) {
        reject(new Error('ID is required for RESULT_UPDATE_KV.'))
        return
      }
      const matchedIndex = computeMatchedItemIndex(
        _id as ObjectKey,
        newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as ResultArrayType,
        _uniqueKey
      )
      if (matchedIndex >= 0) {
        updateObjectDeepValue(
          (
            newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as Record<
              string,
              unknown
            >[]
          )[matchedIndex],
          _changeKey,
          value
        )
      }
      resolve(null)
    } else if (method === ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE) {
      if (_id == null) {
        reject(new Error('ID is required for RESULT_ITEM_MERGE.'))
        return
      }
      const matchedIndex = computeMatchedItemIndex(
        _id as ObjectKey,
        newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as ResultArrayType,
        _uniqueKey
      )
      if (matchedIndex >= 0) {
        const currentItem = (
          newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as Record<string, unknown>[]
        )[matchedIndex]
        ;(
          newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as Record<string, unknown>[]
        )[matchedIndex] = {
          ...currentItem,
          ...(value as Record<string, unknown>)
        }
      }
      resolve(null)
    } else if (method === ENUM.CHANGE_TYPE.RESET_FIELD) {
      // Safe double assertion
      updateObjectDeepValue(
        newFieldData as unknown as Record<string, unknown>,
        _changeKey,
        value
      )
      resolve(null)
    } else {
      let modifyValue = getObjectDeepValue(
        newFieldData as unknown as Record<string, unknown>,
        _changeKey
      )
      if (modifyValue == null) {
        modifyValue = []
      }

      const matchedIndex =
        _id != null
          ? computeMatchedItemIndex(
              _id as ObjectKey,
              modifyValue as ResultArrayType,
              _uniqueKey
            )
          : -1

      switch (method) {
        case ENUM.CHANGE_TYPE.RESULT_ADD_AFTER:
          if (isArray(modifyValue)) {
            modifyValue = isArray(value)
              ? [...modifyValue, ...value]
              : [...modifyValue, value]
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE:
          if (isArray(modifyValue)) {
            modifyValue = isArray(value)
              ? [...value, ...modifyValue]
              : [value, ...modifyValue]
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID:
          if (isArray(modifyValue)) {
            if (matchedIndex >= 0) {
              modifyValue.splice(matchedIndex, 1)
            } else if (isArray(_id)) {
              const idSet = new Set(_id as ObjectKey[])
              modifyValue = (modifyValue as Record<string, unknown>[]).filter(
                (item) =>
                  !idSet.has(
                    getObjectDeepValue(
                      item as Record<string, unknown>,
                      _uniqueKey
                    ) as ObjectKey
                  )
              )
            }
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE:
          if (isArray(modifyValue) && matchedIndex >= 0) {
            modifyValue.splice(matchedIndex, 0, value)
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER:
          if (isArray(modifyValue) && matchedIndex >= 0) {
            modifyValue.splice(matchedIndex + 1, 0, value)
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_LIST_MERGE:
          if (isArray(modifyValue)) {
            combineArrayData(modifyValue as ResultArrayType, value, _uniqueKey)
          }
          break
        default:
          resolve(null)
          return
      }
      ;(newFieldData as unknown as Record<string, unknown>)[_changeKey] =
        modifyValue
      resolve(null)
    }

    const afterLength = computeResultLength(
      newFieldData[ENUM.FIELD_DATA.RESULT_KEY]
    )
    newFieldData.total = newFieldData.total + afterLength - beforeLength
    newFieldData.nothing = afterLength === 0

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: newFieldData,
      callback: () => {
        resolve(null)
      }
    })
  })
}
