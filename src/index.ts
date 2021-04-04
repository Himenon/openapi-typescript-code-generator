import { EOL } from "os";

import * as TsGenerator from "./CodeGenerator";
import * as Transformer from "./Converter";
import { fileSystem } from "./FileSystem";
import * as ResolveReference from "./ResolveReference";
import type { OpenApiTsCodeGen } from "./types";
import * as Validator from "./Validator";

export { Transformer, OpenApiTsCodeGen };

export const make = (config: OpenApiTsCodeGen.Configuration): OpenApiTsCodeGen.Output => {
  const schema = fileSystem.loadJsonOrYaml(config.entryPoint);
  const resolvedReferenceDocument = ResolveReference.resolve(config.entryPoint, config.entryPoint, JSON.parse(JSON.stringify(schema)));

  if (!config.validator) {
    Validator.validate(resolvedReferenceDocument);
  } else {
    if (config.validator.openapiSchema) {
      Validator.validate(resolvedReferenceDocument, config.validator.logger);
    }
  }

  const { createFunction, generateLeadingComment } = Transformer.create(config.entryPoint, schema, resolvedReferenceDocument, {
    allowOperationIds: config.openApiSchemaParser?.allowOperationIds,
    codeGeneratorOption: config.typeDefinitionGenerator?.additional?.option || {},
  });

  return {
    typeDefinition: {
      value: [generateLeadingComment(), TsGenerator.generate(createFunction)].join(EOL + EOL + EOL),
    },
    additionalCodes: {},
  };
};
