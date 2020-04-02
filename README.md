# SCE 2020 Project Management project

## How to run

1. Build the project by running `npm run build`
2. Start the project by running `npm start`
3. Open browser & navigate to `http://localhost:3000/front/#/`

In addition you can:

* Automatically rebuild when a file is changed by running `npm run watch`
* Run tests by running `npm test`
* Run linter by running `npm run lint`

## Directory Structure

`dist/` - Build artifacts as result of running the build script(s)
`node_modules/` - Project dependencies from NPM
`script/` - Build scripts (via webpack)
`src/` - Source code of the project
`src/api` - Source code of the back-end API
`src/front` - Source code of the front-end website
`test/` - Source code of automated tests
`test/feature` - Source code of automated feature/integration tests
`test/unit` - Source code of automated unit tests

## Naming Conventions & Style Guide

### Files & Directories:

* Singular, [lowerCaseCamelCase](https://en.wikipedia.org/wiki/Camel_case)

### REST API:

* Route names are [lower-kebab-case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles) using singular form

### Names of things in code

* Methods, Procedures, Variables, Constants are [lowerCaseCamelCase](https://en.wikipedia.org/wiki/Camel_case)
* Classes are [UpperCaseCamelCase](https://en.wikipedia.org/wiki/Camel_case)
