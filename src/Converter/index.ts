import * as ts from "typescript";
import * as TypeScriptCodeGenerator from "../TypeScriptCodeGenerator";
import { OpenApi } from "../OpenApiParser";
import * as Parameters from "./Parameters";
import * as Schemas from "./Schemas";
import * as Responses from "./Responses";
import * as RequestBodies from "./RequestBodies";

export const create = (entryPoint: string, rootSchema: OpenApi.OpenApi310): TypeScriptCodeGenerator.CreateFunction => {
  const currentPoint = entryPoint;
  return (context: ts.TransformationContext): ts.Statement[] => {
    const statements: ts.Statement[] = [];
    const factory = TypeScriptCodeGenerator.Factory.create(context);
    if (rootSchema.components) {
      if (rootSchema.components.schemas) {
        statements.push(Schemas.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.schemas));
      }
      if (rootSchema.components.responses) {
        statements.push(Responses.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.responses));
      }
      if (rootSchema.components.parameters) {
        statements.push(Parameters.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.parameters));
      }
      if (rootSchema.components.requestBodies) {
        statements.push(RequestBodies.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.requestBodies));
      }
    }
    return statements;
  };
};
