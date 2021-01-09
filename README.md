# @himenon/openapi-typescript-code-generator

## 設計コンセプト

- TypeScript AST を利用して正確にコードを生成する
- リファレンス先のディレクトリ名とファイル名の写像によって決定される構造的型定義
- Dependency Injection を利用することにより生成されたコードが他のライブラリに依存しない
- ユーザーの拡張性を損なわないこと
- ポータビリティを高めるための生成コードの 1 ファイル化
- 型定義は実態を定義しないこと、すなわち、JavaScript へ変換したときに API Client のみが実態として残ること
- OpenAPI の名前空間設計に沿った型定義構造を持つ

## 使い方

### Install

```bash
yarn add -D @himenon/openapi-typescript-code-generator
```

### Script

```ts
import * as fs from "fs";

import * as CodeGenerator from "@himenon/openapi-typescript-code-generator";

const main = () => {
  const params: CodeGenerator.Params = {
    version: "v3",
    entryPoint: "test/api.test.domain/index.yml",
  };
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync("test/code/api.test.domain.ts", code, { encoding: "utf-8" });
};

main();
```

## How to contribute

TypeScript

- https://ts-ast-viewer.com
- http://akito0107.hatenablog.com/entry/2018/12/23/020323

JavaScript

- https://astexplorer.net/

Flow

- https://talks.leko.jp/transform-flow-to-typescript-using-ast/#0

Babel

- https://blog.ikeryo1182.com/typescript-transpiler/

## Features

- [Proxy Directory](https://himenon.github.io/docs/javascript/proxy-directory-design-pattern/)

## Release

- Automatic version updates are performed when merged into the `main` branch.

## LICENCE

[@himenon-typescript-codegen](https://github.com/Himenon/typescript-codegen)・MIT
