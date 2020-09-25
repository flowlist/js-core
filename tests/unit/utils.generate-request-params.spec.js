import {
  generateRequestParams,
  generateDefaultField,
} from '@/utils'

describe('generate request params', () => {
  it('初次请求，page 是 1', () => {
    let field = generateDefaultField()
    let query = {
      a: 'asd',
      b: 'asddd'
    }
    let result = generateRequestParams({
      field,
      query
    })
    expect(result.page).toEqual(1)
  })

  it('初次请求，type 为 jump，page 优先使用 query 的值', () => {
    let field = generateDefaultField()
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'jump'
    })
    expect(result.page).toEqual(20)

    field = generateDefaultField({
      page: 10
    })
    query = {
      a: 'asd',
      b: 'asddd'
    }
    result = generateRequestParams({
      field,
      query,
      type: 'jump'
    })
    expect(result.page).toEqual(10)
  })

  it('初次请求，type 为 seenIds，seen_ids 为空字符串', () => {
    let field = generateDefaultField()
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'seenIds'
    })
    expect(result.seen_ids).toEqual('')
  })

  it('初次请求，type 为 sinceId，since_id 为 0，is_up 为 0', () => {
    let field = generateDefaultField()
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'sinceId'
    })
    expect(result.is_up).toEqual(0)
  })

  it('初次请求，type 为 sinceId，is_up 为 true，since_id 为 999999999，is_up 为 1', () => {
    let field = generateDefaultField()
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20,
      is_up: true
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'sinceId'
    })
    expect(result.is_up).toEqual(1)
  })

  it('二次请求，type 为 page，page 自动 + 1', () => {
    let field = generateDefaultField({
      fetched: true,
      page: 3
    })
    let query = {
      a: 'asd',
      b: 'asddd'
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'page'
    })
    expect(result.page).toEqual(4)
  })

  it('二次请求，type 为 jump，page 使用 query 的值', () => {
    let field = generateDefaultField({
      fetched: true
    })
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'jump'
    })
    expect(result.page).toEqual(20)
  })

  it('二次请求，type 为 seenIds，seen_ids 为 result 的 id 用逗号分割', () => {
    let field = generateDefaultField({
      fetched: true,
      result: [
        { id: 5 },
        { id: 7 }
      ]
    })
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'seenIds'
    })
    expect(result.seen_ids).toEqual('5,7')
  })

  it('二次请求，type 为 sinceId，since_id 为 result 的最后一个值的 id', () => {
    let field = generateDefaultField({
      fetched: true,
      result: [
        { id: 5 },
        { id: 6 },
        { id: 7 }
      ]
    })
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'sinceId'
    })
    expect(result.since_id).toEqual(7)
  })

  it('二次请求，type 为 sinceId，is_up 为 true，since_id 为 result 的第一个值的 id', () => {
    let field = generateDefaultField({
      fetched: true,
      result: [
        { id: 5 },
        { id: 6 },
        { id: 7 }
      ]
    })
    let query = {
      a: 'asd',
      b: 'asddd',
      page: 20,
      is_up: true
    }
    let result = generateRequestParams({
      field,
      query,
      type: 'sinceId'
    })
    expect(result.since_id).toEqual(5)
  })
})
