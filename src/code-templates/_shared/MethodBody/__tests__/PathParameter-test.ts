import { EOL } from "os";

import ts from "typescript";

import { TsGenerator } from "../../../../api";
import type { CodeGenerator } from "../../../../types";
import * as Utils from "../../utils";
import * as PathParameter from "../PathParameter";

const traverse =
  (expression: ts.Expression) =>
  <T extends ts.Node>(context: Pick<ts.TransformationContext, "factory">) =>
  (rootNode: T) => {
    const visit = (node: ts.Node): ts.Node => {
      if (!ts.isSourceFile(node)) {
        return node;
      }
      return context.factory.updateSourceFile(
        node,
        [ts.factory.createExpressionStatement(expression)],
        node.isDeclarationFile,
        node.referencedFiles,
        node.typeReferenceDirectives,
        node.hasNoDefaultLib,
        node.libReferenceDirectives,
      );
    };
    return ts.visitNode(rootNode, visit);
  };

const getText = (expression: ts.Expression) => {
  const source = ts.createSourceFile("", "", ts.ScriptTarget.ESNext);
  const result = ts.transform(source, [traverse(expression)]);
  result.dispose();

  const printer = ts.createPrinter(); // AST -> TypeScriptに変換
  return printer.printFile(result.transformed[0] as any);
};

describe("PathParameter Test", () => {
  const factory = TsGenerator.Factory.create();
  const generate = (url: string, pathParameter: CodeGenerator.PickedParameter[]): string => {
    const urlTemplates = PathParameter.generateUrlTemplateExpression(factory, url, pathParameter);
    const expression = Utils.generateTemplateExpression(factory, urlTemplates);
    return getText(expression);
  };
  test("generateUrlTemplateExpression", () => {
    expect(generate("/{a}", [{ in: "path", name: "a", required: true }])).toEqual("`/${params.parameter.a}`;" + EOL);
    expect(generate("/{a}/", [{ in: "path", name: "a", required: true }])).toEqual("`/${params.parameter.a}/`;" + EOL);
    expect(generate("/a/{b}", [{ in: "path", name: "b", required: true }])).toEqual("`/a/${params.parameter.b}`;" + EOL);
    expect(generate("/a/{b}/", [{ in: "path", name: "b", required: true }])).toEqual("`/a/${params.parameter.b}/`;" + EOL);
    expect(generate("/a/{b}/c", [{ in: "path", name: "b", required: true }])).toEqual("`/a/${params.parameter.b}/c`;" + EOL);
    expect(generate("/a/{b}/c/", [{ in: "path", name: "b", required: true }])).toEqual("`/a/${params.parameter.b}/c/`;" + EOL);
    expect(generate("/a/b/{c}", [{ in: "path", name: "c", required: true }])).toEqual("`/a/b/${params.parameter.c}`;" + EOL);
    expect(generate("/a/b/{c}", [{ in: "path", name: "c", required: true }])).toEqual("`/a/b/${params.parameter.c}`;" + EOL);
    expect(generate("/a/b/{c}/", [{ in: "path", name: "c", required: true }])).toEqual("`/a/b/${params.parameter.c}/`;" + EOL);
    expect(generate("/a/b/{c}.json", [{ in: "path", name: "c", required: true }])).toEqual("`/a/b/${params.parameter.c}.json`;" + EOL);
    expect(generate("/{a}.json/{a}.json/{a}.json", [{ in: "path", name: "a", required: true }])).toEqual(
      "`/${params.parameter.a}.json/${params.parameter.a}.json/${params.parameter.a}.json`;" + EOL,
    );
    expect(generate("/.json.{a}.json/{a}.json.{a}", [{ in: "path", name: "a", required: true }])).toEqual(
      "`/.json.${params.parameter.a}.json/${params.parameter.a}.json.${params.parameter.a}`;" + EOL,
    );

    expect(
      generate("/{a}/{b}", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe("`/${params.parameter.a}/${params.parameter.b}`;" + EOL);
    expect(
      generate("/{a}/{b}/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe("`/${params.parameter.a}/${params.parameter.b}/`;" + EOL);
    expect(
      generate("/{a}/{b}/c", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe("`/${params.parameter.a}/${params.parameter.b}/c`;" + EOL);
    expect(
      generate("/{a}/{b}/c/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe("`/${params.parameter.a}/${params.parameter.b}/c/`;" + EOL);
    expect(
      generate("/{a}/b/{c}", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe("`/${params.parameter.a}/b/${params.parameter.c}`;" + EOL);
    expect(
      generate("/{a}/b/{c}/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe("`/${params.parameter.a}/b/${params.parameter.c}/`;" + EOL);
    expect(
      generate("/a/{b}/{c}", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe("`/a/${params.parameter.b}/${params.parameter.c}`;" + EOL);
    expect(
      generate("/a/{b}/{c}/", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe("`/a/${params.parameter.b}/${params.parameter.c}/`;" + EOL);
    expect(
      generate("/a/{b}...{c}/", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe("`/a/${params.parameter.b}...${params.parameter.c}/`;" + EOL);
  });
});
