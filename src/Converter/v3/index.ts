import ts from "typescript";
import { OpenApi } from "./types";
import * as Path from "path";
import * as TypeScriptCodeGenerator from "../../TypeScriptCodeGenerator";
import * as Parameters from "./Parameters";
import * as Schemas from "./Schemas";
import * as Responses from "./Responses";
import * as RequestBodies from "./RequestBodies";
import * as Headers from "./Headers";
import * as SecuritySchemas from "./SecuritySchemas";
import * as PathItems from "./PathItems";
import * as ToTypeNode from "./toTypeNode";
import * as Comment from "./Comment";
import { Store } from "./store";

export { OpenApi };

export interface Converter {
  generateLeadingComment: () => string;
  createFunction: TypeScriptCodeGenerator.CreateFunction;
}

const createContext = (entryPoint: string, store: Store.Type, factory: TypeScriptCodeGenerator.Factory.Type): ToTypeNode.Context => {
  const getLocalReferenceName: ToTypeNode.Context["getReferenceName"] = (currentPoint, reference): string => {
    if (reference.type !== "local") {
      throw new Error("Setting Miss");
    }
    const ext = Path.extname(currentPoint);
    const from = Path.relative(Path.dirname(entryPoint), currentPoint).replace(ext, ""); // components/schemas/A/B
    const base = Path.dirname(from);
    const pathArray = reference.path.split("/");
    const names: string[] = [];
    pathArray.reduce((previous, lastPath, index) => {
      const current = [previous, lastPath].join("/");
      console.log(current);
      const isLast = index === pathArray.length - 1;
      if (isLast) {
        const statement = store.getStatement(current, "interface");
        if (statement) {
          names.push(statement.value.name.text);
        } else {
          const statement2 = store.getStatement(current, "typeAlias");
          if (statement2) {
            names.push(statement2.value.name.text);
          }
        }
      } else {
        const statement = store.getStatement(current, "namespace");
        if (statement) {
          names.push(statement.value.name.text);
        }
      }
      return current;
    }, base);
    if (names.length === 0) {
      throw new Error("Local Reference Error \n" + JSON.stringify({ reference, pathArray, names, base }, null, 2));
    }
    return names.join(".");
  };

  const getReferenceName: ToTypeNode.Context["getReferenceName"] = (currentPoint, reference): string => {
    const ext = Path.extname(currentPoint);
    const from = Path.relative(Path.dirname(entryPoint), currentPoint).replace(ext, ""); // components/schemas/A/B
    const base = Path.dirname(from);
    const target = reference.path; // components/schemas/A/C/D
    const result = Path.relative(base, target);
    const names: string[] = [];
    const pathArray = result.split("/");
    // TODO ifが複数あるのでリファクタリングする
    pathArray.reduce((previous, lastPath, index) => {
      const current = [previous, lastPath].join("/");
      const isLast = index === pathArray.length - 1;
      if (isLast) {
        const statement = store.getStatement(current, "interface");
        if (statement) {
          names.push(statement.value.name.text);
        } else {
          const statement2 = store.getStatement(current, "typeAlias");
          if (statement2) {
            names.push(statement2.value.name.text);
          }
        }
      } else {
        const statement = store.getStatement(current, "namespace");
        if (statement) {
          names.push(statement.value.name.text);
        }
      }
      return current;
    }, base);
    if (names.length === 0) {
      throw new Error("おかしい");
    }
    return names.join("."); // C.D
  };
  const setReference: ToTypeNode.Context["setReference"] = (reference, convert) => {
    if (store.hasStatement(reference.path, ["interface", "typeAlias"])) {
      return;
    }
    if (reference.type === "remote") {
      const typeNode = convert(entryPoint, reference.referencePoint, factory, reference.data, {
        setReference,
        getReferenceName,
        getLocalReferenceName,
      });
      if (ts.isTypeLiteralNode(typeNode)) {
        store.addStatement(reference.path, {
          type: "interface",
          value: factory.Interface({
            export: true,
            name: reference.name,
            members: typeNode.members,
          }),
        });
      } else {
        const value = factory.TypeAliasDeclaration.create({
          export: true,
          name: reference.name,
          type: convert(entryPoint, reference.referencePoint, factory, reference.data, {
            setReference,
            getReferenceName,
            getLocalReferenceName,
          }),
        });
        store.addStatement(reference.path, {
          type: "typeAlias",
          value,
        });
      }
    }
  };
  return { setReference, getReferenceName, getLocalReferenceName };
};

export const create = (entryPoint: string, rootSchema: OpenApi.RootTypes): Converter => {
  const currentPoint = entryPoint;
  const createFunction = (context: ts.TransformationContext): ts.Statement[] => {
    const factory = TypeScriptCodeGenerator.Factory.create(context);
    const store = Store.create(factory);
    const toTypeNodeContext = createContext(entryPoint, store, factory);

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
      if (rootSchema.components.securitySchemes) {
        SecuritySchemas.generateNamespace(entryPoint, currentPoint, store, factory, rootSchema.components.securitySchemes);
      }
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
    return store.getRootStatements();
  };

  return {
    createFunction,
    generateLeadingComment: () => Comment.generateLeading(rootSchema),
  };
};
