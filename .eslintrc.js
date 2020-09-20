module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'standard',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  globals: {
    google: true
  },
  rules: {
    indent: ['error', 2, {
      SwitchCase: 1
    }],
    'eol-last': ['error', 'always'],
    semi: 'error',
    'comma-dangle': 'error',
    'max-len': ['error', {
      code: 100
    }]
  }
}
