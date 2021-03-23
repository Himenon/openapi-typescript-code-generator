import { EOL } from "os";

import * as TypeScriptCodeGenerator from "./CodeGenerator";
import * as Converter from "./Converter";
import * as DefaultCodeTemplate from "./DefaultCodeTemplate";
import { fileSystem } from "./FileSystem";
import * as ResolveReference from "./ResolveReference";
import * as Validator from "./Validator";

export { Converter };

export interface Params {
  entryPoint: string;
  option?: {
    rewriteCodeAfterTypeDeclaration?: Converter.v3.CodeGenerator.RewriteCodeAfterTypeDeclaration;
    codeGenerator?: {
      /** default false */
      sync?: boolean;
    };
  };
  /** default: true */
  enableValidate?: boolean;
  log?: {
    validator?: {
      /**
       * default: undefined (all logs)
       * Number of lines displayed in the latest log
       */
      displayLogLines?: number;
    };
  };
  filter?: {
    allowOperationIds?: string[];
  };
}

const generateConvertOption = (filter: Params["filter"] = {}, option?: Params["option"]): Converter.v3.Option => {
  if (option) {
    return {
      rewriteCodeAfterTypeDeclaration: option.rewriteCodeAfterTypeDeclaration || DefaultCodeTemplate.rewriteCodeAfterTypeDeclaration,
      allowOperationIds: filter.allowOperationIds,
      codeGeneratorOption: {
        sync: option.codeGenerator ? !!option.codeGenerator.sync : false,
      },
    };
  }
  return {
    rewriteCodeAfterTypeDeclaration: DefaultCodeTemplate.rewriteCodeAfterTypeDeclaration,
    allowOperationIds: filter.allowOperationIds,
    codeGeneratorOption: {
      sync: false,
    },
  };
};

export const generateTypeScriptCode = ({ entryPoint, option, enableValidate = true, log, filter = {} }: Params): string => {
  const schema = fileSystem.loadJsonOrYaml(entryPoint);
  const resolvedReferenceDocument = ResolveReference.resolve(entryPoint, entryPoint, JSON.parse(JSON.stringify(schema)));

  if (enableValidate) {
    Validator.v3.validate(resolvedReferenceDocument, log && log.validator);
  }

  const convertOption = generateConvertOption(filter, option);
  const { createFunction, generateLeadingComment } = Converter.v3.create(entryPoint, schema, resolvedReferenceDocument, convertOption);
  return [generateLeadingComment(), TypeScriptCodeGenerator.generate(createFunction)].join(EOL + EOL + EOL);
};
