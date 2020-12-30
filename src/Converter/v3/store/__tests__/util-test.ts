import ts from "typescript";
import * as Def from "../Definition";
import * as PropAccess from "../PropAccess";

const dummyModuleDeclaration = {} as ts.ModuleDeclaration;
const dummyInterfaceDeclaration = {} as ts.InterfaceDeclaration;

const testStatementMap = {
  "namespace:level1": {
    type: "namespace",
    value: dummyModuleDeclaration,
    statements: {
      "namespace:level2": {
        type: "namespace",
        value: dummyModuleDeclaration,
        statements: {
          "interface:level3": {
            type: "interface",
            value: dummyInterfaceDeclaration,
          },
        },
      },
      "interface:level2": {
        type: "interface",
        value: dummyInterfaceDeclaration,
      },
    },
  },
};

describe("PropAccessTest", () => {
  test("get: level 1", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap, "namespace", "level1");
    expect(result1).toBeTruthy();
    if (!result1) {
      throw new Error("Failed result");
    }
    if (result1.type === "interface") {
      throw new Error("Failed type");
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
    if (result1.type === "interface") {
      throw new Error("Failed type");
    }
    expect(result1).toBe(testStatementMap["namespace:level1"].statements["namespace:level2"]);
    const result2 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1/level2");
    if (!result2) {
      throw new Error("Failed result");
    }
    if (result2.type === "namespace") {
      throw new Error("Failed type");
    }
    expect(result2).toBe(testStatementMap["namespace:level1"].statements["interface:level2"]);
  });
  test("get: level 3", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1/level2/level3");
    if (!result1) {
      throw new Error("Failed result");
    }
    if (result1.type === "namespace") {
      throw new Error("Failed type");
    }
    expect(result1).toBe(testStatementMap["namespace:level1"].statements["namespace:level2"].statements["interface:level3"]);
  });

  test("get: not found test", () => {
    const result1 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1");
    expect(result1).toBeUndefined();

    const result2 = PropAccess.get(testStatementMap as Def.StatementMap, "interface", "level1/level3");
    expect(result2).toBeUndefined();
  });
});
