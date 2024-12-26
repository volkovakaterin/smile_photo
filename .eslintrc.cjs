module.exports = {
  extends: 'next',
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    'react/display-name': 'off',
  },
  root: true,
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
}
