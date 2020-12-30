import * as Def from "./Definition";

const SLASH_DELIMITER = "/" as const;

export const get = (
  obj: Def.StatementMap,
  type: "namespace" | "interface",
  path: string,
  delimiter = SLASH_DELIMITER,
): Def.Statement | undefined => {
  const splits = path.split(delimiter);
  const firstKey = splits[0];
  const nextPath = splits.slice(1, splits.length);
  const isFinal = nextPath.length === 0;
  const nextType = nextPath.length >= 1 ? "namespace" : "interface";
  const key = Def.generateKey(isFinal ? type : nextType, firstKey);
  const target = obj[key];

  if (!target) {
    return;
  }

  if (target.type === "namespace") {
    if (isFinal) {
      return target;
    } else {
      return get(target.statements, type, nextPath.join(delimiter), delimiter);
    }
  }

  if (target.type === "interface") {
    return target;
  }

  return undefined;
};

export const set = (obj: Statement, path: string, newStatement: Statement, delimiter = SLASH_DELIMITER) => {
  const target = get(obj, path, delimiter);
  if (target && target.type === "interface") {
  }
};
