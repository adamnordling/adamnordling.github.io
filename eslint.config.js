import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.js', 'main.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        },
        rules: {
            // Error Prevention & Code Cleanliness
            'no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
            'no-undef': 'error',
            'no-constant-condition': 'error',
            'no-duplicate-imports': 'error',
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'warn',

            // Modern Best Practices
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'warn',
            'prefer-arrow-callback': 'warn',
            'eqeqeq': ['error', 'always', {null: 'ignore'}],

            // Strict Async & Security
            'no-async-promise-executor': 'error',
            'no-promise-executor-return': 'error',
            'require-atomic-updates': 'error'
        }
    }
];