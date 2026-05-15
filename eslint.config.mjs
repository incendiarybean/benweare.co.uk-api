import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig(
    [
        {
            files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
            plugins: {
                js,
                '@stylistic': stylistic
            },
            extends: ['js/recommended'],
            languageOptions: { globals: globals.browser }
        },
        tseslint.configs.recommended,
        {
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'error',
                '@stylistic/indent': 'error',
                '@stylistic/indent-binary-ops': 'error',
                '@stylistic/quotes': [
                    'error',
                    'single'
                ],
                '@stylistic/semi': 'error',
                '@stylistic/array-bracket-newline': [
                    'error',
                    {
                        multiline: true,
                        minItems: 3
                    }
                ],
                '@stylistic/array-bracket-spacing': 'error',
                '@stylistic/array-element-newline': [
                    'error',
                    { minItems: 2 }
                ],
                '@stylistic/arrow-parens': 'error',
                '@stylistic/arrow-spacing': 'error',
                '@stylistic/brace-style': [
                    'error',
                    'stroustrup'
                ],
                '@stylistic/comma-dangle': 'error',
                '@stylistic/comma-spacing': [
                    'error',
                    {
                        'before': false,
                        'after': true
                    }
                ],
                '@stylistic/comma-style': [
                    'error',
                    'last'
                ],
                '@stylistic/computed-property-spacing': [
                    'error',
                    'never'
                ],
                '@stylistic/curly-newline': [
                    'error',
                    'always'
                ],
                '@stylistic/dot-location': [
                    'error',
                    'object'
                ],
                '@stylistic/eol-last': [
                    'error',
                    'always'
                ],
                '@stylistic/function-call-argument-newline': [
                    'error',
                    'consistent'
                ],
                '@stylistic/function-call-spacing': [
                    'error',
                    'never'
                ],
                '@stylistic/function-paren-newline': [
                    'error',
                    { minItems: 1 }
                ],
                '@stylistic/generator-star-spacing': [
                    'error',
                    {
                        'before': true,
                        'after': false
                    }
                ],
                '@stylistic/implicit-arrow-linebreak': [
                    'error',
                    'beside'
                ],
                '@stylistic/key-spacing': [
                    'error',
                    { 'beforeColon': false }
                ],
                '@stylistic/keyword-spacing': [
                    'error',
                    { 'before': true }
                ],
                '@stylistic/line-comment-position': [
                    'error',
                    { 'position': 'above' }
                ],
                '@stylistic/linebreak-style': [
                    'error',
                    'unix'
                ],
                '@stylistic/lines-around-comment': [
                    'error',
                    {
                        'beforeBlockComment': true,
                        beforeLineComment: true,
                        allowObjectStart: true,
                        allowObjectEnd: true,
                        allowBlockStart: true,
                        allowBlockEnd: true,
                        allowArrayStart: true,
                        allowClassStart: true,
                        allowClassEnd: true
                    }
                ],
                '@stylistic/lines-between-class-members': [
                    'error',
                    'always'
                ],
                '@stylistic/max-statements-per-line': [
                    'error',
                    { 'max': 1 }
                ],
                '@stylistic/member-delimiter-style': [
                    'error',
                    {
                        'multiline': {
                            'delimiter': 'comma',
                            'requireLast': true
                        },
                        'singleline': {
                            'delimiter': 'comma',
                            'requireLast': true
                        },
                        'overrides': {
                            'interface': {
                                'multiline': {
                                    'delimiter': 'semi',
                                    'requireLast': true
                                }
                            }
                        }
                    }
                ],
                '@stylistic/multiline-ternary': [
                    'error',
                    'always-multiline'
                ],
                '@stylistic/new-parens': [
                    'error',
                    'never'
                ],
                '@stylistic/newline-per-chained-call': [
                    'error',
                    { 'ignoreChainWithDepth': 2 }
                ],
                '@stylistic/no-confusing-arrow': 'error',
                '@stylistic/no-extra-parens': 'error',
                '@stylistic/no-extra-semi': 'error',
                '@stylistic/no-floating-decimal': 'error',
                '@stylistic/no-mixed-spaces-and-tabs': 'error',
                '@stylistic/no-multi-spaces': 'error',
                '@stylistic/no-multiple-empty-lines': 'error',
                '@stylistic/no-trailing-spaces': 'error',
                '@stylistic/no-whitespace-before-property': 'error',
                'curly': 'error',
                '@stylistic/object-curly-newline': [
                    'error',
                    {
                        'minProperties': 2,
                        multiline: true
                    }
                ],
                '@stylistic/object-curly-spacing': [
                    'error',
                    'always'
                ],
                '@stylistic/object-property-newline': 'error',
                '@stylistic/one-var-declaration-per-line': [
                    'error',
                    'always'
                ],
                '@stylistic/operator-linebreak': [
                    'error',
                    'before'
                ],
                '@stylistic/padding-line-between-statements': [
                    'error',
                    {
                        blankLine: 'always',
                        prev: '*',
                        next: 'return'
                    },
                    {
                        blankLine: 'always',
                        prev: [
                            'const',
                            'let',
                            'var'
                        ],
                        next: '*'
                    },
                    {
                        blankLine: 'any',
                        prev: [
                            'const',
                            'let',
                            'var'
                        ],
                        next: [
                            'const',
                            'let',
                            'var'
                        ]
                    }
                ],
                '@stylistic/rest-spread-spacing': [
                    'error',
                    'never'
                ],
                '@stylistic/semi-spacing': [
                    'error',
                    {
                        'before': false,
                        'after': false
                    }
                ],
                '@stylistic/template-curly-spacing': 'error',
                '@stylistic/template-tag-spacing': 'error'
            }
        }
    ]
);
