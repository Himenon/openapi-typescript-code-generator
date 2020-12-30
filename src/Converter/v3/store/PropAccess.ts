import * as Def from "./Definition";

const SLASH_DELIMITER = "/" as const;

export const get = <A, B, T extends Def.Statement<A, B>["type"]>(
  obj: Def.StatementMap<A, B>,
  type: T,
  path: string,
  delimiter = SLASH_DELIMITER,
): Def.GetStatement<A, B, T> | undefined => {
  const pathArray = path.split(delimiter);
  const firstKey = pathArray[0];
  const nextPath = pathArray.slice(1, pathArray.length);
  const isFinal = nextPath.length === 0;
  const nextType = nextPath.length >= 1 ? "namespace" : "interface";
  const key = Def.generateKey(isFinal ? type : nextType, firstKey);
  const target = obj[key];

  if (!target) {
    return;
  }

  if (target.type === "namespace") {
    if (isFinal) {
      return target as Def.GetStatement<A, B, T>;
    } else {
      return get(target.statements, type, nextPath.join(delimiter), delimiter);
    }
  }

  if (target.type === "interface") {
    return target as Def.GetStatement<A, B, T>;
  }

  return undefined;
};

export const set = <A, B, T extends Def.StatementMap<A, B>>(
  obj: T,
  path: string,
  statement: Def.Statement<A, B>,
  createNamespace: (name: string) => Def.NamespaceStatement<A, B>,
  delimiter = SLASH_DELIMITER,
): T => {
  const [firstPath, ...pathArray] = path.split(delimiter);
  if (!firstPath) {
    return obj;
  }
  const isBottom = pathArray.length === 0;
  const childObj = get(obj, "namespace", firstPath, delimiter);
  const target = childObj ? childObj : createNamespace(firstPath);
  target.statements = set(target.statements, pathArray.join(delimiter), statement, createNamespace, delimiter);
  const key = Def.generateKey(isBottom ? statement.type : target.type, firstPath);
  (obj as Def.StatementMap<A, B>)[key] = isBottom ? statement : target;
  return obj;
};
