# @himenon/typescript-codegen

```bash
AST --> TypeScript
```

## Design

### Components

`$ref: "./components/{Directory1}/{Directory2}/{File}"`

| TypeScript  | Match Pattern  |
| :---------- | :------------- |
| `namespace` | Directory Name |
| `interface` | File Name      |

Components Object

| TypeScript  | Match Pattern |
| :---------- | :------------ |
| `namespace` | Field Name    |
| `interface` | Type Name     |


## References

TypeScript

- https://ts-ast-viewer.com
- http://akito0107.hatenablog.com/entry/2018/12/23/020323

JavaScript

- https://astexplorer.net/

Flow

- https://talks.leko.jp/transform-flow-to-typescript-using-ast/#0

Babel

- https://blog.ikeryo1182.com/typescript-transpiler/

## Usage

## Development

| scripts                   | description                                 |
| :------------------------ | :------------------------------------------ |
| `build`                   | typescript build and create proxy directory |
| `clean`                   | clean up                                    |
| `format:code`             | prettier                                    |
| `format:yarn:lock`        | yarn.lock deduplicate                       |
| `lerna:version:up`        | lerna version up                            |
| `test`                    | execute test:depcruise, test:jest           |
| `test:depcruise`          | dependency-cruiser's test                   |
| `test:jest`               | jest test                                   |
| `ts`                      | execute ts-node                             |
| `release:github:registry` | publish github registry                     |
| `release:npm:registry`    | publish npm registry                        |

## Features

- [Proxy Directory](https://himenon.github.io/docs/javascript/proxy-directory-design-pattern/)

## Release

- Automatic version updates are performed when merged into the `main` branch.

## LICENCE

[@himenon-typescript-codegen](https://github.com/Himenon/typescript-codegen)・MIT
