module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1'
  },
  setupFiles: ['jest-localstorage-mock'],
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  collectCoverageFrom: ['src/*'],
  coverageDirectory: './coverage/',
  collectCoverage: true
}
