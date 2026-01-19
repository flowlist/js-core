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
  ApiResponse
} from './types'

export const initState = ({
  getter,
  setter,
  func,
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
  func,
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
      const apiCaller = () =>
        new Promise<ApiResponse>((res, rej) => {
          const getDataFromAPI = () => {
            const funcCaller =
              typeof func === 'string' && api ? api[func] : func

            if (typeof funcCaller === 'function') {
              funcCaller(params)
                .then(res)
                .catch((error: Error) => {
                  SET_ERROR({ setter, fieldName, error })
                  rej(error)
                })
            }
          }

          getDataFromAPI()
        })

      apiCaller()
        .then((data) => {
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
                  data,
                  refresh: doRefresh
                })
              }
              resolve()
            })
          }

          if (doRefresh && !needReset) {
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

    if (doRefresh && !needReset) {
      getData()
    } else {
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: {
          ...generateDefaultField(),
          loading: true,
          error: null,
          extra: null
        },
        callback: getData
      })
    }
  })

export const loadMore = ({
  getter,
  setter,
  query,
  type,
  func,
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
      const funcCaller = typeof func === 'string' && api ? api[func] : func

      if (typeof funcCaller === 'function') {
        funcCaller(params)
          .then((data: ApiResponse) => {
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
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.MERGE,
      value: loadingState,
      callback: getData
    })
  })

export const updateState = <T = KeyMap>({
  getter,
  setter,
  func,
  type,
  query,
  method,
  value,
  id,
  uniqueKey,
  changeKey
}: UpdateStateType<T>): Promise<unknown> => {
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
      const result = searchValueByKey(
        newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as
          | ResultArrayType
          | Record<string, KeyMap[]>,
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
          (newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as KeyMap[])[matchedIndex],
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
          newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as KeyMap[]
        )[matchedIndex]
        ;(newFieldData[ENUM.FIELD_DATA.RESULT_KEY] as KeyMap[])[matchedIndex] =
          {
            ...currentItem,
            ...(value as KeyMap)
          }
      }
      resolve(null)
    } else if (method === ENUM.CHANGE_TYPE.RESET_FIELD) {
      updateObjectDeepValue(
        newFieldData as unknown as KeyMap,
        _changeKey,
        value
      )
      resolve(null)
    } else {
      let modifyValue = getObjectDeepValue(
        newFieldData as unknown as KeyMap,
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
              modifyValue = (modifyValue as KeyMap[]).filter(
                (item) =>
                  !idSet.has(
                    getObjectDeepValue(item as KeyMap, _uniqueKey) as ObjectKey
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
            combineArrayData(
              modifyValue as ResultArrayType,
              value as ResultArrayType | Record<ObjectKey, KeyMap>,
              _uniqueKey
            )
          }
          break
        default:
          resolve(null)
          return
      }
      ;(newFieldData as unknown as KeyMap)[_changeKey] = modifyValue
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
