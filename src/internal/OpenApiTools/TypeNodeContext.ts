import * as Path from "path";

import ts from "typescript";

import type { OpenApi } from "../../types";
import { DevelopmentError } from "../Exception";
import * as TypeScriptCodeGenerator from "../TsGenerator";
import * as ConverterContext from "./ConverterContext";
import * as ToTypeNode from "./toTypeNode";
import type * as Walker from "./Walker";

export interface ReferencePathSet {
  pathArray: string[];
  base: string;
}

const generatePath = (entryPoint: string, currentPoint: string, referencePath: string): ReferencePathSet => {
  const ext = Path.extname(currentPoint); // .yml
  const from = Path.relative(Path.dirname(entryPoint), currentPoint).replace(ext, ""); // components/schemas/A/B
  const base = Path.dirname(from).replace(Path.sep, "/");
  const result = Path.posix.relative(base, referencePath); // remoteの場合? localの場合 referencePath.split("/")
  const pathArray = result.split("/");
  return {
    pathArray,
    base,
  };
};

const calculateReferencePath = (store: Walker.Store, base: string, pathArray: string[], converterContext: ConverterContext.Types,): ToTypeNode.ResolveReferencePath => {
  let names: string[] = [];
  let unresolvedPaths: string[] = [];
  pathArray.reduce((previous, lastPath, index) => {
    const current = Path.posix.join(previous, lastPath);
    // ディレクトリが深い場合は相対パスが`..`を繰り返す可能性があり、
    // その場合はすでに登録されたnamesを削除する
    if (lastPath === ".." && names.length > 0) {
      names = names.slice(0, names.length - 1);
    }
    const isFinalPath = index === pathArray.length - 1;
    if (isFinalPath) {
      const statement = store.getStatement(current, "interface");
      const statement2 = store.getStatement(current, "typeAlias");
      const statement3 = store.getStatement(current, "namespace");
      if (statement) {
        names.push(statement.name);
        return current;
      } else if (statement2) {
        names.push(statement2.name);
        return current;
      } else if (statement3) {
        names.push(statement3.name);
        return current;
      } else {
        unresolvedPaths.push(lastPath);
      }
    } else {
      const statement = store.getStatement(current, "namespace");
      if (statement) {
        unresolvedPaths = unresolvedPaths.slice(0, unresolvedPaths.length - 1);
        names.push(statement.name);
      } else {
        unresolvedPaths.push(lastPath);
      }
    }
    return current;
  }, base);
  if (names.length === 0) {
    throw new DevelopmentError("Local Reference Error \n" + JSON.stringify({ pathArray, names, base }, null, 2));
  }
  const maybeResolvedNameFragments = names.concat(unresolvedPaths).map(converterContext.escapeDeclarationText);
  return {
    name: names.map(converterContext.escapeDeclarationText).join("."),
    maybeResolvedName: maybeResolvedNameFragments.join("."),
    unresolvedPaths,
    depth: maybeResolvedNameFragments.length,
    pathArray,
  };
};

export const create = (
  entryPoint: string,
  rootSchema: OpenApi.Document,
  store: Walker.Store,
  factory: TypeScriptCodeGenerator.Factory.Type,
  converterContext: ConverterContext.Types,
): ToTypeNode.Context => {
  const resolveReferencePath: ToTypeNode.Context["resolveReferencePath"] = (currentPoint, referencePath) => {
    const { pathArray, base } = generatePath(entryPoint, currentPoint, referencePath);
    return calculateReferencePath(store, base, pathArray, converterContext);
  };
  const setReferenceHandler: ToTypeNode.Context["setReferenceHandler"] = (currentPoint, reference) => {
    if (store.hasStatement(reference.path, ["interface", "typeAlias"])) {
      return;
    }
    if (reference.type === "remote") {
      const typeNode = ToTypeNode.convert(
        entryPoint,
        reference.referencePoint,
        factory,
        reference.data,
        {
          rootSchema,
          setReferenceHandler,
          resolveReferencePath,
        },
        converterContext,
      );
      if (ts.isTypeLiteralNode(typeNode)) {
        store.addStatement(reference.path, {
          kind: "interface",
          name: reference.name,
          value: factory.InterfaceDeclaration.create({
            export: true,
            name: reference.name,
            members: typeNode.members,
          }),
        });
      } else {
        const value = factory.TypeAliasDeclaration.create({
          export: true,
          name: converterContext.escapeDeclarationText(reference.name),
          type: ToTypeNode.convert(
            entryPoint,
            reference.referencePoint,
            factory,
            reference.data,
            {
              rootSchema,
              setReferenceHandler,
              resolveReferencePath,
            },
            converterContext,
          ),
        });
        store.addStatement(reference.path, {
          name: reference.name,
          kind: "typeAlias",
          value,
        });
      }
    } else if (reference.type === "local") {
      if (!store.isAfterDefined(reference.path)) {
        const { maybeResolvedName } = resolveReferencePath(currentPoint, reference.path);
        const value = factory.TypeAliasDeclaration.create({
          export: true,
          name: converterContext.escapeDeclarationText(reference.name),
          type: factory.TypeReferenceNode.create({
            name: converterContext.escapeTypeReferenceNodeName(maybeResolvedName),
          }),
        });
        store.addStatement(reference.path, {
          name: reference.name,
          kind: "typeAlias",
          value,
        });
      }
    }
  };
  return { rootSchema, setReferenceHandler: setReferenceHandler, resolveReferencePath: resolveReferencePath };
};
