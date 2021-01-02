import * as Path from "path";

import * as ts from "typescript";

import { DevelopmentError } from "../../Exception";
import * as TypeScriptCodeGenerator from "../../TypeScriptCodeGenerator";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";

export interface ReferencePathSet {
  pathArray: string[];
  base: string;
}

const generatePath = (entryPoint: string, currentPoint: string, referencePath: string, type: "local" | "remote"): ReferencePathSet => {
  const ext = Path.extname(currentPoint); // .yml
  const from = Path.relative(Path.dirname(entryPoint), currentPoint).replace(ext, ""); // components/schemas/A/B
  const base = Path.dirname(from);
  const result = Path.relative(base, referencePath); // remoteの場合? localの場合 referencePath.split("/")
  const pathArray = result.split("/");
  return {
    pathArray,
    base,
  };
};

const generateName = (store: Store.Type, base: string, pathArray: string[]): string => {
  const names: string[] = [];
  console.log("\nStart Generate Name\n");
  pathArray.reduce((previous, lastPath, index) => {
    const current = Path.join(previous, lastPath);
    console.log(`current = ${current}`);
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
    throw new DevelopmentError("Local Reference Error \n" + JSON.stringify({ pathArray, names, base }, null, 2));
  }
  console.log("\nFinish Generate Name\n");
  return names.join(".");
};

export const create = (entryPoint: string, store: Store.Type, factory: TypeScriptCodeGenerator.Factory.Type): ToTypeNode.Context => {
  const getReferenceName: ToTypeNode.Context["getReferenceName"] = (currentPoint, referencePath, type): string => {
    const { pathArray, base } = generatePath(entryPoint, currentPoint, referencePath, type);
    return generateName(store, base, pathArray);
  };
  const setReferenceHandler: ToTypeNode.Context["setReferenceHandler"] = reference => {
    if (store.hasStatement(reference.path, ["interface", "typeAlias"])) {
      return;
    }
    if (reference.type === "remote") {
      const typeNode = ToTypeNode.convert(entryPoint, reference.referencePoint, factory, reference.data, {
        setReferenceHandler,
        getReferenceName,
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
          type: ToTypeNode.convert(entryPoint, reference.referencePoint, factory, reference.data, {
            setReferenceHandler: setReferenceHandler,
            getReferenceName,
          }),
        });
        store.addStatement(reference.path, {
          type: "typeAlias",
          value,
        });
      }
    }
  };
  return { setReferenceHandler: setReferenceHandler, getReferenceName };
};
