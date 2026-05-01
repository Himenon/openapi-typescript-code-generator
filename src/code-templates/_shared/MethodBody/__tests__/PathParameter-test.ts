import { TsGenerator } from "../../../../api";
import type { CodeGenerator } from "../../../../types";
import * as Utils from "../../utils";
import * as PathParameter from "../PathParameter";

describe("PathParameter Test", () => {
  const factory = TsGenerator.Factory.create();
  const generate = (url: string, pathParameter: CodeGenerator.PickedParameter[]): string => {
    const urlTemplates = PathParameter.generateUrlTemplateExpression(factory, url, pathParameter);
    return Utils.generateTemplateExpression(factory, urlTemplates);
  };
  test("generateUrlTemplateExpression", () => {
    expect(generate("/{a}", [{ in: "path", name: "a", required: true }])).toEqual(`\`/\${encodeURIComponent(params.parameter.a)}\``);
    expect(generate("/{a}/", [{ in: "path", name: "a", required: true }])).toEqual(`\`/\${encodeURIComponent(params.parameter.a)}/\``);
    expect(generate("/a/{b}", [{ in: "path", name: "b", required: true }])).toEqual(`\`/a/\${encodeURIComponent(params.parameter.b)}\``);
    expect(generate("/a/{b}/", [{ in: "path", name: "b", required: true }])).toEqual(`\`/a/\${encodeURIComponent(params.parameter.b)}/\``);
    expect(generate("/a/{b}/c", [{ in: "path", name: "b", required: true }])).toEqual(`\`/a/\${encodeURIComponent(params.parameter.b)}/c\``);
    expect(generate("/a/{b}/c/", [{ in: "path", name: "b", required: true }])).toEqual(`\`/a/\${encodeURIComponent(params.parameter.b)}/c/\``);
    expect(generate("/a/b/{c}", [{ in: "path", name: "c", required: true }])).toEqual(`\`/a/b/\${encodeURIComponent(params.parameter.c)}\``);
    expect(generate("/a/b/{c}", [{ in: "path", name: "c", required: true }])).toEqual(`\`/a/b/\${encodeURIComponent(params.parameter.c)}\``);
    expect(generate("/a/b/{c}/", [{ in: "path", name: "c", required: true }])).toEqual(`\`/a/b/\${encodeURIComponent(params.parameter.c)}/\``);
    expect(generate("/a/b/{c}.json", [{ in: "path", name: "c", required: true }])).toEqual(
      `\`/a/b/\${encodeURIComponent(params.parameter.c)}.json\``,
    );
    expect(generate("/{a}.json/{a}.json/{a}.json", [{ in: "path", name: "a", required: true }])).toEqual(
      `\`/\${encodeURIComponent(params.parameter.a)}.json/\${encodeURIComponent(params.parameter.a)}.json/\${encodeURIComponent(params.parameter.a)}.json\``,
    );
    expect(generate("/.json.{a}.json/{a}.json.{a}", [{ in: "path", name: "a", required: true }])).toEqual(
      `\`/.json.\${encodeURIComponent(params.parameter.a)}.json/\${encodeURIComponent(params.parameter.a)}.json.\${encodeURIComponent(params.parameter.a)}\``,
    );

    expect(
      generate("/{a}/{b}", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(`\`/\${encodeURIComponent(params.parameter.a)}/\${encodeURIComponent(params.parameter.b)}\``);
    expect(
      generate("/{a}/{b}/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(`\`/\${encodeURIComponent(params.parameter.a)}/\${encodeURIComponent(params.parameter.b)}/\``);
    expect(
      generate("/{a}/{b}/c", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(`\`/\${encodeURIComponent(params.parameter.a)}/\${encodeURIComponent(params.parameter.b)}/c\``);
    expect(
      generate("/{a}/{b}/c/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "b", required: true },
      ]),
    ).toBe(`\`/\${encodeURIComponent(params.parameter.a)}/\${encodeURIComponent(params.parameter.b)}/c/\``);
    expect(
      generate("/{a}/b/{c}", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(`\`/\${encodeURIComponent(params.parameter.a)}/b/\${encodeURIComponent(params.parameter.c)}\``);
    expect(
      generate("/{a}/b/{c}/", [
        { in: "path", name: "a", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(`\`/\${encodeURIComponent(params.parameter.a)}/b/\${encodeURIComponent(params.parameter.c)}/\``);
    expect(
      generate("/a/{b}/{c}", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(`\`/a/\${encodeURIComponent(params.parameter.b)}/\${encodeURIComponent(params.parameter.c)}\``);
    expect(
      generate("/a/{b}/{c}/", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(`\`/a/\${encodeURIComponent(params.parameter.b)}/\${encodeURIComponent(params.parameter.c)}/\``);
    expect(
      generate("/a/{b}...{c}/", [
        { in: "path", name: "b", required: true },
        { in: "path", name: "c", required: true },
      ]),
    ).toBe(`\`/a/\${encodeURIComponent(params.parameter.b)}...\${encodeURIComponent(params.parameter.c)}/\``);
  });
});
