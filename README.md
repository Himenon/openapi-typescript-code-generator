# @himenon/openapi-typescript-code-generator

[日本語](./docs/ja/README-ja.md)

This package generates TypeScript typedefs and API Client from the OpenAPI v3 series API specification.
It uses TypeScript AST to generate the code, and converts it exactly to TypeScript code.
It not only converts `allOf` and `oneOf` into `intersection` type and `union` type, but also converts the directory structure of the reference destination into `namespace` and generates the API Client.
The hierarchical structure of the directory is converted to the hierarchical structure of the type definition.

## Usage

## Installation

```bash
yarn add -D @himenon/openapi-typescript-code-generator
```

### デモ

- [DEMO](./example/README.md)

### Basic usage

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

### Create the original API Client template.

We have an entry point in `option.makeApiClient` to generate non-typed code.
The first argument can be TypeScript's `TransformationContext`, and the second argument contains the information of the type definition generated before this.
By using [ts-ast-viewer](https://ts-ast-viewer.com), code extension by AST can facilitate code extension.

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

### Restrictions

#### Directory Restrictions for Remote Reference

There is a limitation on the directory structure supported.
To simplify implementation when converting directory structures to TypeScript namespaces, Remote References using `$ref` should only be defined in the following directory structures.
If you want to extend it, please fork this repository and do it yourself.

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

#### HTTP communication restrictions for Remote Reference

`$ref: http://....` Currently not supported. We hope to support it in the future.

## Contributions

First of all, thank you for your interest.
When converting from the API specification to TypeScript code, resolving reference relationships can be particularly challenging, and there may not be enough test cases.
Adding test cases is a very powerful support for stabilizing the behavior, so please report any bugs you find that are behaving strangely.
Also, the basic design concepts of this repository can be found below. If you want to make changes that do not follow these concepts, please fork and extend them.
If your changes are in line with the design concept, please submit a pull request or issue!

### Design Concept

- Be typedef first.
- Typedefs should not contain any entities (file size should be 0 when typedefs are converted to `.js`)
- The directory structure should be mapped to the typedef structure.
- No dependency on any API client library.
- Can be extended by TypeScript AST.
- Conform to the OpenAPI specification.
- It should be a single file to maintain portability.

### Development

```bash
git clone https://github.com/Himenon/openapi-typescript-code-generator.git
cd openapi-typescript-code-generator
yarn
#### your change
yarn build && yarn test
```

### Useful development tools

TypeScript AST

- https://ts-ast-viewer.com

## LICENCE

[@himenon/openapi-typescript-code-generator](https://github.com/Himenon/typescript-codegen), MIT

### Reference implementation

Validation Design

- Copyright (c) 2018 Kogo Software LLC - [https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-schema-validator#readme](openapi-schema-validator)
