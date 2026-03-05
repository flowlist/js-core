/**
 * Jest 全局测试配置
 */
import 'jest-localstorage-mock'

// 每个测试文件前清理
beforeEach(() => {
  jest.clearAllMocks()
})
