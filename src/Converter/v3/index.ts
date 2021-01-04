import ts from "typescript";

import * as TypeScriptCodeGenerator from "../../TypeScriptCodeGenerator";
import * as Comment from "./Comment";
import * as Headers from "./components/Headers";
import * as Parameters from "./components/Parameters";
import * as PathItem from "./components/PathItem";
import * as PathItems from "./components/PathItems";
import * as RequestBodies from "./components/RequestBodies";
import * as Responses from "./components/Responses";
import * as Schemas from "./components/Schemas";
import * as Context from "./Context";
import { Store } from "./store";
import { OpenApi } from "./types";

export { OpenApi };

export interface Converter {
  generateLeadingComment: () => string;
  createFunction: TypeScriptCodeGenerator.CreateFunction;
}

export const create = (entryPoint: string, rootSchema: OpenApi.Document): Converter => {
  const currentPoint = entryPoint;
  const createFunction = (context: ts.TransformationContext): ts.Statement[] => {
    const factory = TypeScriptCodeGenerator.Factory.create(context);
    const store = Store.create(factory);
    const toTypeNodeContext = Context.create(entryPoint, store, factory);

    if (rootSchema.components) {
      if (rootSchema.components.schemas) {
        Schemas.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.schemas, toTypeNodeContext);
      }
      if (rootSchema.components.headers) {
        Headers.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.headers, toTypeNodeContext);
      }
      if (rootSchema.components.responses) {
        Responses.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.responses, toTypeNodeContext);
      }
      if (rootSchema.components.parameters) {
        Parameters.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.parameters, toTypeNodeContext);
      }
      if (rootSchema.components.requestBodies) {
        RequestBodies.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.requestBodies, toTypeNodeContext);
      }
      // if (rootSchema.components.securitySchemes) {
      //   SecuritySchemas.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.securitySchemes);
      // }
      if (rootSchema.components.pathItems) {
        PathItems.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.pathItems, toTypeNodeContext);
      }
      // TODO
      // if (rootSchema.components.links) {
      //   statements.push(Links.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.links));
      // }

      // TODO
      // if (rootSchema.components.callbacks) {
      //   statements.push(Callbacks.generateNamespace(entryPoint, currentPoint, factory, rootSchema.components.callbacks));
      // }
    }
    if (rootSchema.paths) {
      Object.entries(rootSchema.paths).forEach(([pathName, pathItem], index) => {
        if (!pathName.startsWith("/")) {
          throw new Error(`Not start slash: ${pathName}`);
        }
        const pathIdentifer = `Path$${index + 1}`;
        PathItem.generateNamespace(
          entryPoint,
          currentPoint,
          store,
          factory,
          "components/pathItems",
          pathIdentifer,
          pathItem,
          toTypeNodeContext,
          { topComment: `Endpoint: ${pathName}` },
        );
      });
    }
    return store.getRootStatements();
  };

  return {
    createFunction,
    generateLeadingComment: () => Comment.generateLeading(rootSchema),
  };
};
