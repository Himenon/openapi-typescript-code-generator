import * as Utils from "../utils";

type OK = Utils.VariableElement;

describe("Utils", () => {
  test("splitVariableText", () => {
    const splitVariableText = Utils.splitVariableText;
    expect(splitVariableText("")).toStrictEqual<OK[]>([]);
    expect(splitVariableText("a")).toStrictEqual<OK[]>([
      {
        kind: "string",
        value: "a",
      },
    ]);
    expect(splitVariableText("a.b")).toStrictEqual<OK[]>([
      {
        kind: "string",
        value: "a",
      },
      {
        kind: "string",
        value: "b",
      },
    ]);
    expect(splitVariableText("a.b.c")).toStrictEqual<OK[]>([
      {
        kind: "string",
        value: "a",
      },
      {
        kind: "string",
        value: "b",
      },

      {
        kind: "string",
        value: "c",
      },
    ]);
    expect(splitVariableText('a.b["c"]')).toStrictEqual<OK[]>([
      {
        kind: "string",
        value: "a",
      },
      {
        kind: "string",
        value: "b",
      },

      {
        kind: "element-access",
        value: "c",
      },
    ]);
    expect(splitVariableText('a.b["c.d"]')).toStrictEqual<OK[]>([
      {
        kind: "string",
        value: "a",
      },
      {
        kind: "string",
        value: "b",
      },

      {
        kind: "element-access",
        value: "c.d",
      },
    ]);
    expect(splitVariableText('a.b["c.d.e"]')).toStrictEqual<OK[]>([
      {
        kind: "string",
        value: "a",
      },
      {
        kind: "string",
        value: "b",
      },

      {
        kind: "element-access",
        value: "c.d.e",
      },
    ]);
  });
});
