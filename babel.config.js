module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: false,
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ]
}
