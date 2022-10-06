/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */

const header = [
  'error',
  'block',
  [
    '',
    {
      pattern: ' \\* Copyright \\(C\\) (\\d{4}|(\\d{4}-\\d{4})) Savoir-faire Linux Inc\\.',
      template: ` * Copyright (C) ${new Date().getFullYear()} Savoir-faire Linux Inc.`,
    },
    ' *',
    ' * This program is free software; you can redistribute it and/or modify',
    ' * it under the terms of the GNU Affero General Public License as',
    ' * published by the Free Software Foundation; either version 3 of the',
    ' * License, or (at your option) any later version.',
    ' *',
    ' * This program is distributed in the hope that it will be useful,',
    ' * but WITHOUT ANY WARRANTY; without even the implied warranty of',
    ' * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
    ' * GNU Affero General Public License for more details.',
    ' *',
    ' * You should have received a copy of the GNU Affero General Public',
    ' * License along with this program.  If not, see',
    ' * <https://www.gnu.org/licenses/>.',
    ' ',
  ],
];

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    /* TODO: Enable these configs once the project is fully converted to typescript */
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
    // "plugin:@typescript-eslint/strict",
    'prettier',
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'daemon/', 'test/'],
  overrides: [
    {
      files: ['**/*.test.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'header', 'simple-import-sort', 'unused-imports'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    eqeqeq: ['warn', 'smart'],
    'header/header': header,
    'no-constant-condition': ['error', { checkLoops: false }],
    'simple-import-sort/exports': 'warn',
    'simple-import-sort/imports': 'warn',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
  },
};
