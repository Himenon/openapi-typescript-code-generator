# @himenon/openapi-typescript-code-generator

[日本語](./docs/ja/README-ja.md)

This library provides TypeScript type definitions and extracted parameters from OpenAPI v3.0.x compliant specifications.
TypeScript AST is used to generate the code, which is accurately converted to TypeScript code.
Since the parameters extracted from OpenAPI can be used freely, it can be used for automatic generation of API Client and Server Side code, load balancer configuration files, etc.

## Playground

- [Playground](https://openapi-typescript-code-generator-playground.netlify.app)

## Installation

```bash
yarn add -D @himenon/openapi-typescript-code-generator
```

## DEMO

- [Short DEMO](https://github.com/Himenon/openapi-typescript-code-generator-demo-project)
- [DEMO: github/rest-api-client code generate](https://github.com/Himenon/github-rest-api-client/tree/master/source)
  - https://github.com/github/rest-api-description

## Usage

The example shown here can be cloned from the [DEMO repository](https://github.com/Himenon/openapi-typescript-code-generator-demo-project) to see how it works.

### Generate typedef-only code

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

### Generate code containing the API Client

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

### Split the type definition file and the API Client implementation

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

## Create a Code Template

The examples in this section can be used in the following ways

```ts
import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import type * as Types from "@himenon/openapi-typescript-code-generator/types";

/** Write the definition of the Code Template here. */
const customGenerator: Types.CodeGenerator.CustomGenerator<{}> = {
  /** .... */
}

const codeGenerator = new CodeGenerator("your/openapi/spec.yml");

const code = codeGenerator.generateCode([
  customGenerator,
]);

fs.writeFileSync("output/file/name", code, { encoding: "utf-8" });
```

### Define a text-based code template

A self-defined code generator can return an array of `string`.

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

### Define using the information extracted from OpenAPI Schema

The self-defined code generator can accept parameters extracted from OpenAPI Schema.
See Type definitions for available parameters.

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

### Define any Data Types Format

Convert a Data Type with the following `format` to any type definition.

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

The option to convert the Data Type Format to an arbitrary type definition is defined as follows.

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

The typedef generated by this will look like this

```ts
export namespace Schemas {
    export type Binary = Blob;
    export type IntOrString = number | string;
    export type AandB = A & B;
}
```

### Define a code template with TypeScript AST

You can extend your code using the API of TypeScript AST.
You can directly use the API of TypeScript AST or use the wrapper API of TypeScript AST provided by this library.

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

Performs validation of the input OpenAPI Schema.

#### generateTypeDefinition

Generates code that converts OpenAPI Schema to TypeScript type definitions.

#### generateCode

You can specify several of your own code generators, and the generators can use parameters extracted from OpenAPI Schema.
It internally performs the conversion of an array of `string` or `ts.Statement` as a string.

For example, creating a generator in units of file divisions increases the reusability of the generator.

#### getCodeGeneratorParamsArray

It provides parameters extracted from OpenAPI Schema.

#### getAdditionalTypeDefinitionCustomCodeGenerator

This is a type definition file for `Templates.ApiClient`. The reason it is not included in `generateTypeDefinition` is that you may not use the type definition generated by this function depending on your usage.

※ The reason it is not included in `generateTypeDefinition` is that you may not use the type definitions generated by this function depending on your application.

### TsGenerator

```ts
import { TsGenerator } from "@himenon/openapi-typescript-code-generator/api";
```

This is a wrapper API for the TypeScript AST used internally.
It is subject to change without notice.

### OpenApiTools

```ts
import { OpenApiTools } from "@himenon/openapi-typescript-code-generator/api";
```

#### Parser

- `OpenApiTools.Parser`

This is the API for parsing OpenAPI Schema.
It is subject to change without notice.

## Restrictions

### Directory Restrictions for Remote Reference

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

### HTTP communication restrictions for Remote Reference

`$ref: http://....` Currently not supported. We hope to support it in the future.

## Contributions

First of all, thank you for your interest.
When converting from the API specification to TypeScript code, resolving reference relationships can be particularly challenging, and there may not be enough test cases.
Adding test cases is a very powerful support for stabilizing the behavior, so please report any bugs you find that are behaving strangely.
Also, the basic design concepts of this repository can be found below. If you want to make changes that do not follow these concepts, please fork and extend them.
If your changes are in line with the design concept, please submit a pull request or issue!

## Design Concept

- Be typedef first.
- Typedefs should not contain any entities (file size should be 0 when typedefs are converted to `.js`)
- The directory structure should be mapped to the typedef structure.
- No dependency on any API client library.
- Can be extended by TypeScript AST.
- Conform to the OpenAPI specification.
- It should be a single file to maintain portability.

## Development

```bash
git clone https://github.com/Himenon/openapi-typescript-code-generator.git
cd openapi-typescript-code-generator
yarn
#### your change
yarn build && yarn test
```

## Useful development tools

TypeScript AST

- https://ts-ast-viewer.com

## LICENCE

[@himenon/openapi-typescript-code-generator](https://github.com/Himenon/typescript-codegen), MIT

### Reference implementation

Validation Design

- Copyright (c) 2018 Kogo Software LLC - [https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-schema-validator#readme](openapi-schema-validator)
