import { EOL } from "node:os";
import { describe, expect, it } from "vitest";
import * as Factory from "../factory";

describe("TsGenerator Factory Helpers", () => {
  describe("escapeTemplateText", () => {
    it("テンプレートリテラル内の特殊文字をエスケープできること", () => {
      // バックスラッシュ、バッククォート、${ をエスケープする
      expect(Factory.escapeTemplateText("path\\to\\file")).toBe("path\\\\to\\\\file");
      expect(Factory.escapeTemplateText("`quoted`")).toBe("\\`quoted\\`");
      expect(Factory.escapeTemplateText("${variable}")).toBe("\\${variable}");
    });
  });

  describe("escapeIdentifier", () => {
    it("識別子に含まれるハイフンをアンダースコアに置換できること", () => {
      expect(Factory.escapeIdentifier("my-variable-name")).toBe("my_variable_name");
      expect(Factory.escapeIdentifier("nochange")).toBe("nochange");
    });
  });

  describe("indentLines", () => {
    it("各行にインデントを付与し、空行はそのままにすること", () => {
      const input = "line1\n\nline2";
      const expected = "  line1\n\n  line2";
      expect(Factory.indentLines(input, "  ")).toBe(expected);
    });
  });

  describe("hasTopLevelOp", () => {
    it("トップレベルに | または & がある場合は true を返すこと", () => {
      expect(Factory.hasTopLevelOp("A | B")).toBe(true);
      expect(Factory.hasTopLevelOp("A & B")).toBe(true);
    });

    it("括弧や型引数の中にある演算子は無視されること", () => {
      expect(Factory.hasTopLevelOp("(A | B)")).toBe(false);
      expect(Factory.hasTopLevelOp("Array<A | B>")).toBe(false);
      expect(Factory.hasTopLevelOp("{ prop: A | B }")).toBe(false);
      expect(Factory.hasTopLevelOp("[A | B]")).toBe(false);
    });

    it("ネストが深い場合の演算子も正しく無視されること", () => {
      expect(Factory.hasTopLevelOp("A | Array<{ p: B & C }>")).toBe(true);
      expect(Factory.hasTopLevelOp("Array<{ p: B & C }> | D")).toBe(true);
      expect(Factory.hasTopLevelOp("Map<K, V | T>")).toBe(false);
    });
  });

  describe("buildComment", () => {
    it("単一ラインのコメントを生成できること", () => {
      expect(Factory.buildComment("hello")).toBe(`/** hello */${EOL}`);
    });

    it("複数ラインのコメントを生成できること", () => {
      const input = "line1\nline2";
      const expected = `/**${EOL} * line1${EOL} * line2${EOL} */${EOL}`;
      expect(Factory.buildComment(input)).toBe(expected);
    });

    it("deprecated フラグがある場合に @deprecated タグを付与すること", () => {
      const expected = `/**${EOL} * @deprecated${EOL} * old feature${EOL} */${EOL}`;
      expect(Factory.buildComment("old feature", true)).toBe(expected);
    });

    it("コメント内の特殊な記号をエスケープすること", () => {
      expect(Factory.buildComment("*/")).toContain("\\*\\\\/");
      expect(Factory.buildComment("/*")).toContain("/\\\\*");
    });
  });

  describe("addComment", () => {
    it("コメントがある場合にコードの前に付与すること", () => {
      const code = "const a = 1;";
      const comment = "my variable";
      const result = Factory.addComment(code, comment);
      expect(result).toBe(`/** my variable */${EOL}${code}`);
    });

    it("コメントも deprecated もない場合は元のコードを返すこと", () => {
      const code = "const a = 1;";
      expect(Factory.addComment(code)).toBe(code);
    });
  });
});

describe("TsGenerator Factory Create API", () => {
  const factory = Factory.create();

  describe("StringLiteral", () => {
    it("文字列リテラルを生成できること（ダブルクォート）", () => {
      expect(factory.StringLiteral.create({ text: 'hello "world"' })).toBe('"hello \\"world\\""');
    });

    it("文字列リテラルを生成できること（シングルクォート）", () => {
      expect(factory.StringLiteral.create({ text: "hello 'world'", isSingleQuote: true })).toBe("'hello \\'world\\''");
    });
  });

  describe("TypeNode", () => {
    it("プリミティブ型を生成できること", () => {
      expect(factory.TypeNode.create({ type: "string" })).toBe("string");
      expect(factory.TypeNode.create({ type: "number" })).toBe("number");
      expect(factory.TypeNode.create({ type: "boolean" })).toBe("boolean");
    });

    it("enum 文字列型を生成できること", () => {
      expect(factory.TypeNode.create({ type: "string", enum: ["a", "b"] })).toBe('"a" | "b"');
    });

    it("配列型を生成できること", () => {
      expect(factory.TypeNode.create({ type: "array", value: "string" })).toBe("string[]");
    });

    it("トップレベル演算子を含む型の配列は括弧で囲まれること", () => {
      expect(factory.TypeNode.create({ type: "array", value: "string | number" })).toBe("(string | number)[]");
    });

    it("オブジェクト型（インライン）を生成できること", () => {
      const result = factory.TypeNode.create({ type: "object", value: ["id: string;", "name: string;"] });
      expect(result).toBe("{\n    id: string;\n    name: string;\n}");
    });
  });

  describe("UnionTypeNode", () => {
    it("ユニオン型を生成できること", () => {
      expect(factory.UnionTypeNode.create({ typeNodes: ["string", "number"] })).toBe("string | number");
    });

    it("ネストした演算子を持つ型は括弧で囲まれること", () => {
      expect(factory.UnionTypeNode.create({ typeNodes: ["A & B", "C"] })).toBe("(A & B) | C");
    });
  });

  describe("InterfaceDeclaration", () => {
    it("インターフェース宣言を生成できること", () => {
      const result = factory.InterfaceDeclaration.create({
        name: "MyInterface",
        members: ["id: string;", "name?: string;"],
        export: true,
      });
      expect(result).toBe("export interface MyInterface {\n    id: string;\n    name?: string;\n}");
    });
  });

  describe("Namespace", () => {
    it("名前空間を生成できること", () => {
      const result = factory.Namespace.create({
        name: "MyNamespace",
        statements: ["export type T = string;"],
        export: true,
      });
      expect(result).toBe("export namespace MyNamespace {\n    export type T = string;\n}");
    });

    it("ネストした名前空間を一括生成できること", () => {
      const result = factory.Namespace.createMultiple({
        names: ["A", "B", "C"],
        statements: ["export const v = 1;"],
        export: true,
      });
      expect(result).toContain("namespace A");
      expect(result).toContain("namespace B");
      expect(result).toContain("namespace C");
    });
  });
});
