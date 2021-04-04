import ts from "typescript";

import * as TypeScriptCodeGenerator from "../CodeGenerator";
import { CodeGenerator as CodeGenerator2 } from "../types";
import * as CodeGenerator from "./CodeGenerator";
import * as Comment from "./Comment";
import * as Headers from "./components/Headers";
import * as Parameters from "./components/Parameters";
// import * as PathItems from "./components/PathItems";
import * as RequestBodies from "./components/RequestBodies";
import * as Responses from "./components/Responses";
import * as Schemas from "./components/Schemas";
import * as ConvertContext from "./ConverterContext";
import * as Name from "./Name";
import * as Paths from "./paths";
import { Store } from "./store";
import * as TypeNodeContext from "./TypeNodeContext";
import { CodeGeneratorParams, OpenApi, PickedParameter } from "./types";

export { OpenApi, CodeGenerator, CodeGeneratorParams, PickedParameter, Name };

export interface Type {
  generateLeadingComment: () => string;
  createFunction: TypeScriptCodeGenerator.CreateFunction;
  codeGeneratorOption: CodeGenerator2.Option;
}

export interface Option {
  /**
   * List of operationId to be used
   */
  allowOperationIds?: string[];

  generateCodeAfterGeneratedTypeDefinition?: CodeGenerator2.GenerateFunction;

  codeGeneratorOption: CodeGenerator2.Option;
}

export const create = (entryPoint: string, rootSchema: OpenApi.Document, noReferenceOpenApiSchema: OpenApi.Document, option: Option): Type => {
  const currentPoint = entryPoint;
  const converterContext = ConvertContext.create();

  const createFunction = (context: ts.TransformationContext): ts.Statement[] => {
    const factory = TypeScriptCodeGenerator.Factory.create(context);
    const store = Store.create(factory, noReferenceOpenApiSchema);
    const toTypeNodeContext = TypeNodeContext.create(entryPoint, store, factory, converterContext);
    let extraStatements: ts.Statement[] = [];

    if (rootSchema.components) {
      if (rootSchema.components.schemas) {
        Schemas.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.schemas, toTypeNodeContext, converterContext);
      }
      if (rootSchema.components.headers) {
        Headers.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.headers, toTypeNodeContext, converterContext);
      }
      if (rootSchema.components.responses) {
        Responses.generateNamespace(
          entryPoint,
          currentPoint,
          store,
          factory,
          rootSchema.components.responses,
          toTypeNodeContext,
          converterContext,
        );
      }
      if (rootSchema.components.parameters) {
        Parameters.generateNamespace(
          entryPoint,
          currentPoint,
          store,
          factory,
          rootSchema.components.parameters,
          toTypeNodeContext,
          converterContext,
        );
      }
      if (rootSchema.components.requestBodies) {
        RequestBodies.generateNamespace(
          entryPoint,
          currentPoint,
          store,
          factory,
          rootSchema.components.requestBodies,
          toTypeNodeContext,
          converterContext,
        );
      }
      // if (rootSchema.components.securitySchemes) {
      //   SecuritySchemas.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.securitySchemes);
      // }
      // if (rootSchema.components.pathItems) {
      //   PathItems.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.pathItems, toTypeNodeContext);
      // }
      // TODO Feature Development
      // if (rootSchema.components.links) {
      //   statements.push(Links.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.links));
      // }

      // TODO Feature Development
      // if (rootSchema.components.callbacks) {
      //   statements.push(Callbacks.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.callbacks));
      // }
    }
    if (rootSchema.paths) {
      Paths.generateStatements(entryPoint, currentPoint, store, factory, rootSchema.paths, toTypeNodeContext, converterContext);

      const codeGeneratorParamsList = CodeGenerator.generateCodeGeneratorParamsList(store, converterContext, option.allowOperationIds);
      const extraStatements2 = option.generateCodeAfterGeneratedTypeDefinition?.(context, codeGeneratorParamsList, option.codeGeneratorOption) || [];
      extraStatements = extraStatements.concat(TypeScriptCodeGenerator.Utils.convertIntermediateCodes(extraStatements2));
    }
    return store.getRootStatements().concat(extraStatements);
  };

  return {
    createFunction,
    generateLeadingComment: () => Comment.generateLeading(rootSchema),
    codeGeneratorOption: option.codeGeneratorOption,
  };
};
