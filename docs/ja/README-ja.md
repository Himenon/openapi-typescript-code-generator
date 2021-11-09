# @himenon/openapi-typescript-code-generator

このライブラリは OpenAPI v3.0.x 系に準拠した仕様書から TypeScript の型定義と抽出したパラメーターを提供します。
コードの生成には TypeScript AST を利用し、正確に TypeScript のコードへ変換します。
OpenAPI から抽出したパラメーターは自由に使うことができるため、API Client や Server Side 用のコード、ロードバランサーの設定ファイルなどの自動生成に役立てることができます。

## Playground

- [Playground](https://openapi-typescript-code-generator-playground.netlify.app)

## DEMO

- [Short DEMO](https://github.com/Himenon/openapi-typescript-code-generator-demo-project)
- [DEMO: github/rest-api-client code generate](https://github.com/Himenon/github-rest-api-client/tree/master/source)
  - https://github.com/github/rest-api-description

## インストール

```bash
yarn add -D @himenon/openapi-typescript-code-generator
```

## 使い方

ここで記されている例は[DEMO 用のリポジトリ](https://github.com/Himenon/openapi-typescript-code-generator-demo-project)をクローンして動作確認することができます。

### 型定義のみのコードを生成する

```ts
import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";

const main = () => {
  const codeGenerator = new CodeGenerator("your/openapi/spec.yml");
  const code = codeGenerator.generateTypeDefinition();
  fs.writeFileSync("client.ts", code, { encoding: "utf-8" });
};

main();
```

### API Client を含むコードを生成する

```ts
import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import * as Templates from "@himenon/openapi-typescript-code-generator/templates";
import type * as Types from "@himenon/openapi-typescript-code-generator/types";

const main = () => {
  const codeGenerator = new CodeGenerator("your/openapi/spec.yml");

  const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
    generator: Templates.ApiClient.generator,
    option: {},
  };

  const code = codeGenerator.generateTypeDefinition([
    codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
    apiClientGeneratorTemplate,
  ]);

  fs.writeFileSync("client.ts", code, { encoding: "utf-8" });
};

main();
```

### 型定義ファイルと API Client の実装を分割する

```ts
import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import * as Templates from "@himenon/openapi-typescript-code-generator/templates";
import type * as Types from "@himenon/openapi-typescript-code-generator/types";

const main = () => {
  const codeGenerator = new CodeGenerator("your/openapi/spec.yml");

  const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
    generator: Templates.ApiClient.generator,
    option: {},
  };

  const typeDefCode = codeGenerator.generateTypeDefinition();
  const apiClientCode = codeGenerator.generateCode([
    {
      generator: () => {
        return [`import { Schemas, Responses } from "./types";`];
      },
    },
    codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
    apiClientGeneratorTemplate,
  ]);

  fs.writeFileSync("types.ts", typeDefCode, { encoding: "utf-8" });
  fs.writeFileSync("apiClient.ts", apiClientCode, { encoding: "utf-8" });
};

main();
```

## Code Template を作成する

この節で示す例は以下に示す方法で利用できます

```ts
import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import type * as Types from "@himenon/openapi-typescript-code-generator/types";

/** ここにCode Templateの定義を記述してください  */
const customGenerator: Types.CodeGenerator.CustomGenerator<{}> = {
  /** .... */
}

const codeGenerator = new CodeGenerator("your/openapi/spec.yml");

const code = codeGenerator.generateCode([
  customGenerator,
]);

fs.writeFileSync("output/file/name", code, { encoding: "utf-8" });
```

### テキストベースのコードテンプレートを定義する

独自定義のコードジェネレーターは`string`の配列を返すことができます。

```ts
import * as Types from "@himenon/openapi-typescript-code-generator/types";

interface Option {
  showLog?: boolean;
}

const generator: Types.CodeGenerator.GenerateFunction<Option> = (payload: Types.CodeGenerator.Params[], option): string[] => {
  if (option && option.showLog) {
    console.log("show log message");
  }
  return ["Hello world"];
};

const customGenerator: Types.CodeGenerator.CustomGenerator<Option> = {
  generator: generator,
  option: {},
}
```

### OpenAPI Schema から抽出した情報を利用した定義をする

独自定義のコードジェネレーターは、OpenAPI Schema から抽出したパラメーターを受け取ることができます。
利用可能なパラメーターは型定義を参照してください。

```ts
import * as Types from "@himenon/openapi-typescript-code-generator/types";

interface Option {
}

const generator: Types.CodeGenerator.GenerateFunction<Option> = (payload: Types.CodeGenerator.Params[], option): string[] => {
  return payload.map((params) => {
    return `function ${params.operationId}() { console.log("${params.comment}") }`;
  })
};

const customGenerator: Types.CodeGenerator.CustomGenerator<Option> = {
  generator: generator,
  option: {},
}
```

### 任意の Data Types Format を定義する

以下のような`format`が指定された Data Type を任意の型定義に変換します。

```yaml
components:
  schemas:
    Binary:
      type: string
      format: binary
    IntOrString:
      type: string
      format: int-or-string
    AandB:
      type: string
      format: A-and-B
```

Data Type Formatを任意の型定義に変換するオプションは次のように定義します。

```ts
import { CodeGenerator, Option } from "@himenon/openapi-typescript-code-generator";
const option: Option = {
  convertOption: {
    formatConversions: [
      {
        selector: {
          format: "binary",
        },
        output: {
          type: ["Blob"],
        },
      },
      {
        selector: {
          format: "int-or-string",
        },
        output: {
          type: ["number", "string"],
        },
      },
      {
        selector: {
          format: "A-and-B",
        },
        output: {
          type: ["A", "B"],
          multiType: "allOf",
        },
      },
    ],
  },
};
const codeGenerator = new CodeGenerator(inputFilename, option);
```

これで生成される型定義は次のようになります。

```ts
export namespace Schemas {
    export type Binary = Blob;
    export type IntOrString = number | string;
    export type AandB = A & B;
}
```

### TypeScript AST によるコードテンプレートを定義する

TypeScript AST の API を利用したコードの拡張が可能です。
直接 TypeScript の AST の API を利用したり、本ライブラリが提供する TypeScript AST のラッパー API を利用できます。

```ts
import * as Types from "@himenon/openapi-typescript-code-generator/types";
import { TsGenerator } from "@himenon/openapi-typescript-code-generator/api";

interface Option {
}

const factory = TsGenerator.Factory.create();

const generator: Types.CodeGenerator.GenerateFunction<Option> = (payload: Types.CodeGenerator.Params[], option): Types.CodeGenerator.IntermediateCode[] => {
  return payload.map((params) => {
    return factory.InterfaceDeclaration.create({
      export: true,
      name: params.functionName,
      members: [],
    })
  })
};

const customGenerator: Types.CodeGenerator.CustomGenerator<Option> = {
  generator: generator,
  option: {},
}
```

## API

### CodeGenerator

```ts
import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
```

#### validateOpenApiSchema

入力された OpenAPI Schema のバリデーションを実行します。

#### generateTypeDefinition

OpenAPI Schema を TypeScript の型定義に変換したコードを生成します。

#### generateCode

独自のコードジェネレーターを複数指定することができ、ジェネレーターは OpenAPI Schema から抽出したパラメーターを利用できます。
内部で`string`または`ts.Statement`の配列を文字列として変換を行います。

たとえばファイルの分割の単位でジェネレーターを作成するとジェネレーターの再利用性が高まります。

#### getCodeGeneratorParamsArray

OpenAPI Schema から抽出したパラメーターを取得できます。

#### getAdditionalTypeDefinitionCustomCodeGenerator

`Templates.ApiClient`向けの型定義ファイルです。`generateTypeDefinition`に含めていない理由は、用途によってこの関数が生成する型定義を利用しない可能性があるためです。

※ 将来的に`Templates`の API に移動する予定です。

### TsGenerator

```ts
import { TsGenerator } from "@himenon/openapi-typescript-code-generator/api";
```

内部で利用している TypeScript AST のラッパー API です。
告知なく変更する可能性があります。

### OpenApiTools

```ts
import { OpenApiTools } from "@himenon/openapi-typescript-code-generator/api";
```

#### Parser

- `OpenApiTools.Parser`

OpenAPI Schema をパースするための API です。
告知なく変更する可能性があります。

## 制限

### Remote Reference のディレクトリ制限

サポートしているディレクトリ構造に制限があります。
ディレクトリ構造を TypeScript の Namespace へ変換するとき、実装を簡素化するために`$ref`を利用した Remote Reference は以下のディレクトリ構造にのみ定義してください。
もし拡張したい場合は本リポジトリを Fork して独自に行ってください。

```
spec.yml // entry file
components/
  headers/
  parameters/
  pathItems/
  requestBodies/
  responses/
  schemas/
  paths/
```

### Remote Reference の HTTP 通信制限

`$ref: http://....`は現在サポートしていません。将来的にサポートしたいと考えています。

## コントリビューション

はじめに、興味を持っていただきありがとうございます。
API 仕様書から TypeScript のコードへ変換するとき、参照関係を解決することは特に大変で、テストケースが十分でない可能性があります。
テストケースを追加することは、挙動を安定化させるために非常に強力な支えになるので、挙動がおかしな不具合を見つけたらぜひ報告してください。
また、本リポジトリの基本的な設計コンセプトは以下にあるとおりです。これらに沿わない変更を行いたい場合はフォークして拡張してください。
設計コンセプトに沿う変更内容でしたらぜひ Pull Request か Issue を投稿してください！

## 設計コンセプト

- 型定義ファーストであること
- 型定義に実体が含まれないこと（型定義部分を`.js`に変換したとき、ファイルサイズが 0 になること）
- ディレクトリ構造が型定義の構造に写像されること
- どの API クライアントライブラリにも依存しないこと
- TypeScript AST による拡張ができること
- OpenAPI の仕様に準拠すること
- 1 ファイル化することにより、ポータビリティを保つこと

## 開発方法

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

### 参考にした実装

Validation 設計

- Copyright (c) 2018 Kogo Software LLC - [https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-schema-validator#readme](openapi-schema-validator)
