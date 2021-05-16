import ts from "typescript";

import { TsGenerator } from "../../api";
import type { CodeGenerator, ParsedSchema } from "../../types";
import { JsonSchemaToTypeDefinition } from "../../utils";

export interface Option {}

export const generator: CodeGenerator.AdvancedGenerateFunction<Option> = (payload, option?: Option): CodeGenerator.IntermediateCode[] => {
  const { accessor, entryPoint } = payload;
  const paths = accessor.operator.getNodePaths("OpenApiSchema");
  const statements: ts.Statement[] = [];
  paths.map(currentPoint => {
    const item = accessor.getChildByPaths(currentPoint, "OpenApiSchema");
    if (!item) {
      return;
    }
    const locatedData = item.value;
    if (locatedData.kind === "common") {
      JsonSchemaToTypeDefinition.convert({
        entryPoint: entryPoint,
        currentPoint: currentPoint,
        schema: locatedData.schema,
      });
    } else {
      locatedData.resolvedPath;
    }
  });

  return [
    TsGenerator.factory.Namespace.create({
      export: true,
      name: "Schemas",
      statements,
    }),
  ];
};
