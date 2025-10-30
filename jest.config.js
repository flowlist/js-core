module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // 可选：解决 .js 导入 .ts 的问题
  },
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // 可选：排除入口文件
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'], // text 输出到终端，html 生成可视化报告
};