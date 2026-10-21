import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: ['**/dist/**', '**/node_modules/**'],
    },
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
        rules: {
            // Documenting defaults as [name=value] is valid JSDoc and useful for consumers
            'jsdoc/no-defaults': 'off',
        },
    },
    {
        files: ['**/vite.config.js', '*.config.mjs'],
        languageOptions: {
            globals: globals.node,
        },
    },
    // Must stay last: disables rules that conflict with Prettier
    prettier,
];
