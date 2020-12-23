import * as ts from "typescript";
import * as TypeScriptCodeGenerator from "../TypeScriptCodeGenerator";
import { OpenApi } from "../OpenApiParser";
import * as Parameters from "./Parameters";
import * as Schemas from "./Schemas";

export const create = (entryFilename: string, rootSchema: OpenApi.OpenApi310): TypeScriptCodeGenerator.CreateFunction => {
  const referenceFilename = entryFilename;
  return (context: ts.TransformationContext): ts.Statement[] => {
    const statements: ts.Statement[] = [];
    const factory = TypeScriptCodeGenerator.Factory.create(context);
    if (rootSchema.components) {
      if (rootSchema.components.schemas) {
        statements.push(Schemas.generate(entryFilename, referenceFilename, factory, rootSchema.components.schemas));
      }
      if (rootSchema.components.parameters) {
        statements.push(Parameters.generate(entryFilename, referenceFilename, factory, rootSchema.components.parameters));
      }
    }
    return statements;
  };
};
