/* eslint-disable no-unused-vars */
import ts from "typescript";
import * as Def from "../Definition";
import * as PropAccess from "../PropAccess";

export type A = { name: string };
export type B = { name: string };

const createDummyModuleDeclaration = (name: string): A => {
  return { name };
};

const createDummyInterfaceDeclaration = (name: string): B => {
  return { name };
};

const testStatementMap = {
  "namespace:level1": {
    type: "namespace",
    value: createDummyModuleDeclaration("level1"),
    statements: {
      "namespace:level2": {
        type: "namespace",
        value: createDummyModuleDeclaration("level2"),
        statements: {
          "interface:level3": {
            type: "interface",
            value: createDummyInterfaceDeclaration("level3"),
          },
        },
      },
      "interface:level2": {
        type: "interface",
        value: createDummyInterfaceDeclaration("level2"),
      },
    },
  },
};

const createNamespace = (name: string): Def.NamespaceStatement<A, B> => {
  return {
    type: "namespace",
    value: createDummyModuleDeclaration(name),
    statements: {},
  };
};

describe("PropAccessTest", () => {
  test("get: level 1", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap<A, B>, "namespace", "level1");
    expect(result1).toBeTruthy();
    if (!result1) {
      throw new Error("Failed result");
    }
    expect(result1.type).toBe("namespace");
    expect(result1.statements).toBe(testStatementMap["namespace:level1"].statements);

    const result2 = PropAccess.get(testStatementMap as Def.StatementMap<A, B>, "interface", "level1");
    expect(result2).toBeUndefined();
  });
  test("get: level 2", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap<A, B>, "namespace", "level1/level2");
    if (!result1) {
      throw new Error("Failed result");
    }
    expect(result1).toStrictEqual(testStatementMap["namespace:level1"].statements["namespace:level2"]);
    const result2 = PropAccess.get(testStatementMap as Def.StatementMap<A, B>, "interface", "level1/level2");
    if (!result2) {
      throw new Error("Failed result");
    }
    expect(result2).toStrictEqual(testStatementMap["namespace:level1"].statements["interface:level2"]);
  });
  test("get: level 3", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap<A, B>, "interface", "level1/level2/level3");
    if (!result1) {
      throw new Error("Failed result");
    }
    expect(result1).toStrictEqual(testStatementMap["namespace:level1"].statements["namespace:level2"].statements["interface:level3"]);
  });
  test("get: not found test", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap<A, B>, "interface", "level1");
    expect(result1).toBeUndefined();

    const result2 = PropAccess.get(testStatementMap as Def.StatementMap<A, B>, "interface", "level1/level3");
    expect(result2).toBeUndefined();
  });
  test("set: level1 & target: empty namespace", () => {
    const obj: Def.StatementMap<A, B> = {};
    const statement: Def.NamespaceStatement<A, B> = { type: "namespace", value: createDummyModuleDeclaration("level1"), statements: {} };
    const result = PropAccess.set(obj, "level1", statement, createNamespace);
    expect(result).toStrictEqual({
      "namespace:level1": statement,
    });
  });
  test("set: level2 & target: empty namespace", () => {
    const obj: Def.StatementMap<A, B> = {};
    const statement: Def.NamespaceStatement<A, B> = { type: "namespace", value: createDummyModuleDeclaration("level2"), statements: {} };
    const result = PropAccess.set(obj, "level1/level2", statement, createNamespace);

    const expectResult: Def.StatementMap<A, B> = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("level1"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("level2"),
            statements: {},
          },
        },
      },
    };
    expect(result).toStrictEqual(expectResult);
  });

  test("set: level3 & target: empty namespace", () => {
    const obj: Def.StatementMap<A, B> = {};
    const statement: Def.NamespaceStatement<A, B> = { type: "namespace", value: createDummyModuleDeclaration("mostDepth"), statements: {} };
    const result = PropAccess.set(obj, "level1/level2/level3", statement, createNamespace);
    const expectResult: Def.StatementMap<A, B> = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("level1"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("level2"),
            statements: {
              "namespace:level3": statement,
            },
          },
        },
      },
    };
    expect(result).toStrictEqual(expectResult);
  });

  test("set: level2 & target: exist namespace", () => {
    const obj: Def.StatementMap<A, B> = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("Hello"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("World"),
            statements: {},
          },
        },
      },
    };
    const statement: Def.InterfaceStatement<B> = { type: "interface", value: createDummyInterfaceDeclaration("dummyInterface") };
    const result = PropAccess.set(obj, "level1/level2", statement, createNamespace);
    const expectResult: Def.StatementMap<A, B> = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("Hello"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("World"),
            statements: {},
          },
          "interface:level2": statement,
        },
      },
    };
    expect(result).toStrictEqual(expectResult);
  });

  test("set: level3 & target: exist namespace", () => {
    const obj: Def.StatementMap<A, B> = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("Hello"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("World"),
            statements: {
              "namespace:level3": createNamespace("level3"),
            },
          },
        },
      },
    };
    const statement: Def.InterfaceStatement<B> = { type: "interface", value: createDummyInterfaceDeclaration("dummyInterface") };
    const result = PropAccess.set(obj, "level1/level2/level3/level4", statement, createNamespace);
    const expectResult: Def.StatementMap<A, B> = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("Hello"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("World"),
            statements: {
              "namespace:level3": {
                type: "namespace",
                value: createDummyModuleDeclaration("level3"),
                statements: {
                  "interface:level4": statement,
                },
              },
            },
          },
        },
      },
    };
    expect(result).toStrictEqual(expectResult);
  });
});
