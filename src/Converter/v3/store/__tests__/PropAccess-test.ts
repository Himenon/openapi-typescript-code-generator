/* eslint-disable no-unused-vars */
import ts from "typescript";
import * as Def from "../Definition";
import * as PropAccess from "../PropAccess";

const createDummyModuleDeclaration = (name: string): ts.ModuleDeclaration => {
  return { name } as any;
};

const createDummyInterfaceDeclaration = (name: string): ts.InterfaceDeclaration => {
  return { name } as any;
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

const createNamespace = (name: string): Def.NamespaceStatement => {
  return {
    type: "namespace",
    value: createDummyModuleDeclaration(name),
    statements: {},
  };
};

describe("PropAccessTest", () => {
  test("get: level 1", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap, "namespace", "level1");
    expect(result1).toBeTruthy();
    if (!result1) {
      throw new Error("Failed result");
    }
    expect(result1.type).toBe("namespace");
    expect(result1.statements).toBe(testStatementMap["namespace:level1"].statements);

    const result2 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1");
    expect(result2).toBeUndefined();
  });
  test("get: level 2", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap, "namespace", "level1/level2");
    if (!result1) {
      throw new Error("Failed result");
    }
    expect(result1).toStrictEqual(testStatementMap["namespace:level1"].statements["namespace:level2"]);
    const result2 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1/level2");
    if (!result2) {
      throw new Error("Failed result");
    }
    expect(result2).toStrictEqual(testStatementMap["namespace:level1"].statements["interface:level2"]);
  });
  test("get: level 3", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1/level2/level3");
    if (!result1) {
      throw new Error("Failed result");
    }
    expect(result1).toStrictEqual(testStatementMap["namespace:level1"].statements["namespace:level2"].statements["interface:level3"]);
  });
  test("get: not found test", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1");
    expect(result1).toBeUndefined();

    const result2 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1/level3");
    expect(result2).toBeUndefined();
  });
  test("set: level1 & target: empty namespace", () => {
    const obj: Def.StatementMap = {};
    const value: Def.NamespaceStatement = { type: "namespace", value: createDummyModuleDeclaration("level1"), statements: {} };
    const result = PropAccess.set(obj, "level1", value, createNamespace);
    expect(result).toStrictEqual({
      "namespace:level1": value,
    });
  });
  test("set: level2 & target: empty namespace", () => {
    const obj: Def.StatementMap = {};
    const value: Def.NamespaceStatement = { type: "namespace", value: createDummyModuleDeclaration("level2"), statements: {} };
    const result = PropAccess.set(obj, "level1/level2", value, createNamespace);

    const expectResult: Def.StatementMap = {
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
    const obj: Def.StatementMap = {};
    const value: Def.NamespaceStatement = { type: "namespace", value: createDummyModuleDeclaration("mostDepth"), statements: {} };
    const result = PropAccess.set(obj, "level1/level2/level3", value, createNamespace);
    const expectResult: Def.StatementMap = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("level1"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("level2"),
            statements: {
              "namespace:level3": createNamespace("level3"),
            },
          },
        },
      },
    };
    expect(result).toStrictEqual(expectResult);
  });

  test("set: level3 & target: exist namespace", () => {
    const obj: Def.StatementMap = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("level1"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("level2"),
            statements: {
              "namespace:level3": createNamespace("level3"),
            },
          },
        },
      },
    };
    const value: Def.InterfaceStatement = { type: "interface", value: createDummyInterfaceDeclaration("dummyInterface"), statements: {} };
    const result = PropAccess.set(obj, "level1/level2/level3/level4", value, createNamespace);
    const expectResult: Def.StatementMap = {
      "namespace:level1": {
        type: "namespace",
        value: createDummyModuleDeclaration("level1"),
        statements: {
          "namespace:level2": {
            type: "namespace",
            value: createDummyModuleDeclaration("level2"),
            statements: {
              "namespace:level3": {
                type: "namespace",
                value: createDummyModuleDeclaration("level3"),
                statements: {
                  "interface:level4": value,
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
