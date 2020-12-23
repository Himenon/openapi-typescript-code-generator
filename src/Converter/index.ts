import * as ts from "typescript";
import * as TypeScriptCodeGenerator from "../TypeScriptCodeGenerator";
import { OpenApi } from "../OpenApiParser";
import * as Parameters from "./Parameters";
import * as Schemas from "./Schemas";

export const create = (rootSchema: OpenApi.OpenApi310): TypeScriptCodeGenerator.CreateFunction => {
  return (context: ts.TransformationContext): ts.Statement[] => {
    const statements: ts.Statement[] = [];
    const factory = TypeScriptCodeGenerator.Factory.create(context);
    if (rootSchema.components) {
      if (rootSchema.components.schemas) {
        statements.push(Schemas.generate(factory, rootSchema.components.schemas));
      }
      if (rootSchema.components.parameters) {
        statements.push(Parameters.generate(factory, rootSchema.components.parameters));
      }
    }
    return statements;
  };
};
