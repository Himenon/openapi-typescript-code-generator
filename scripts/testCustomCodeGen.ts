import * as fs from "fs";

import ts from "typescript";

import * as CodeGenerator from "../lib";

const rewriteCodeAfterTypeDeclaration: CodeGenerator.RewriteCodeAfterTypeDeclaration = (
  context: ts.TransformationContext,
  codeGeneratorParamsList: CodeGenerator.CodeGeneratorParams[],
  codeGenerateOption: CodeGenerator.CodeGeneratorOption,
) => {
  const methodList = codeGeneratorParamsList.map(params => {
    const responseNames = [...params.responseSuccessNames, ...params.responseErrorNames];
    const returnType = responseNames.length === 0 ? "void" : responseNames.map(name => `${name}["application/json"]`).join(" | ");
    return `public async ${params.operationId}(): Promise<${returnType}> { return {} as any; }`;
  });
  return `export class MyClient { constructor(url: string) {} \n ${methodList.join("\n")} }`;
};

const gen = (name: string, enableValidate = true): void => {
  const params: CodeGenerator.Params = {
    entryPoint: `test/${name}/index.yml`,
    enableValidate,
    option: {
      rewriteCodeAfterTypeDeclaration: rewriteCodeAfterTypeDeclaration,
    },
    log: {
      validator: {
        displayLogLines: 1,
      },
    },
  };
  fs.mkdirSync("test/code", { recursive: true });
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync(`test/code/custom-${name}.ts`, code, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/${name}.ts`);
};

const main = () => {
  gen("api.test.domain");
};

main();
