# @himenon/openapi-typescript-code-generator

このパッケージは OpenAPI v3 系に準拠した API 仕様書から TypeScript の型定義と API Client を生成します。
コードの生成には TypeScript AST を利用し、正確に TypeScript のコードへ変換します。
`allOf`、`oneOf`を`intersection` type、`union` type に変換することはもちろん、Reference 先のディレクトリ構造を`namespace`へ変換し、
ディレクトリの階層構造をそのまま型定義の階層構造へ変換します。

## 使い方

### インストール

```bash
yarn add -D @himenon/openapi-typescript-code-generator
```

### 基本的な使い方

```ts
import * as fs from "fs";

import * as CodeGenerator from "@himenon/openapi-typescript-code-generator";

const main = () => {
  const params: CodeGenerator.Params = {
    version: "v3",
    entryPoint: "your/openapi/spec.yml", // support .yml, .yaml, .json
  };
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync("client.ts", code, { encoding: "utf-8" });
};

main();
```

### オリジナルの API Client テンプレートを作成する

`option.makeApiClient`に型定義以外のコードを生成するためのエントリーポイントを用意しています。
第 1 引数は TypeScript の`TransformationContext`が利用でき、第 2 引数はこれ以前に生成した型定義の情報が含まれます。
[ts-ast-viewer](https://ts-ast-viewer.com)を利用することにより AST によるコード拡張がコード拡張を円滑にでます。

```ts
import * as fs from "fs";

import ts from "typescript";

import * as CodeGenerator from "../lib";

const main = () => {
  const params: CodeGenerator.Params = {
    version: "v3",
    entryPoint: "your/openapi/spec.yml", // support .yml, .yaml, .json
    option: {
      makeApiClient: (context: ts.TransformationContext, codeGeneratorParamsList: CodeGenerator.Converter.v3.CodeGeneratorParams[]): ts.Statement[] => {
        const factory = context.factory; // https://ts-ast-viewer.com/ is very very very useful !
        return []; // generate no api client
      },
    },
  };
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync("client.ts", code, { encoding: "utf-8" });
};

main();
```

## コントリビューション

はじめに、興味を持っていただきありがとうございます。
API 仕様書から TypeScript のコードへ変換するとき、参照関係を解決することは特に大変で、テストケースが十分でない可能性があります。
テストケースを追加することは、挙動を安定化させるために非常に強力な支えになるので、挙動がおかしな不具合を見つけたらぜひ報告してください。
また、本リポジトリの基本的な設計コンセプトは以下にあるとおりです。これらに沿わない変更を行いたい場合はフォークして拡張してください。
設計コンセプトに沿う変更内容でしたらぜひ Pull Request か Issue を投稿してください！

### 設計コンセプト

- 型定義ファーストであること
- 型定義に実体が含まれないこと（型定義部分を`.js`に変換したとき、ファイルサイズが 0 になること）
- ディレクトリ構造が型定義の構造に写像されること
- どの API クライアントライブラリにも依存しないこと
- TypeScript AST による拡張ができること
- OpenAPI の仕様に準拠すること
- 1 ファイル化することにより、ポータビリティを保つこと

### 開発方法

```bash
git clone https://github.com/Himenon/openapi-typescript-code-generator.git
cd openapi-typescript-code-generator
yarn
# your change
yarn build && yarn test
```

### 便利な開発ツール

TypeScript AST

- https://ts-ast-viewer.com

## LICENCE

[@himenon/openapi-typescript-code-generator](https://github.com/Himenon/typescript-codegen)・MIT
