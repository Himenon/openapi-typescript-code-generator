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
    rewriteCodeAfterTypeDeclaration?: Converter.v3.Generator.RewriteCodeAfterTypeDeclaration;
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

export const generateTypeScriptCode = ({ entryPoint, option, enableValidate = true, log, filter = {} }: Params): string => {
  const schema = fileSystem.loadJsonOrYaml(entryPoint);
  const resolvedReferenceDocument = ResolveReference.resolve(entryPoint, entryPoint, JSON.parse(JSON.stringify(schema)));

  if (enableValidate) {
    Validator.v3.validate(resolvedReferenceDocument, log && log.validator);
  }

  const convertOption: Converter.v3.Option = option
    ? {
        rewriteCodeAfterTypeDeclaration: option.rewriteCodeAfterTypeDeclaration || DefaultCodeTemplate.rewriteCodeAfterTypeDeclaration,
        allowOperationIds: filter.allowOperationIds || [],
      }
    : {
        rewriteCodeAfterTypeDeclaration: DefaultCodeTemplate.rewriteCodeAfterTypeDeclaration,
        allowOperationIds: filter.allowOperationIds || [],
      };
  const { createFunction, generateLeadingComment } = Converter.v3.create(entryPoint, schema, resolvedReferenceDocument, convertOption);
  return [generateLeadingComment(), TypeScriptCodeGenerator.generate(createFunction)].join(EOL + EOL + EOL);
};
