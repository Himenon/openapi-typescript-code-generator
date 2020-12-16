import * as ts from "typescript";

const code = `
interface Hoge {
  name: string;
}

const hoge: Hoge = {
  name: "hoge",
};
`;

const source = ts.createSourceFile("", code, ts.ScriptTarget.ESNext);

const result = ts.transform(source, []);
result.dispose();

const printer = ts.createPrinter();

console.log(printer.printFile(result.transformed[0] as ts.SourceFile));
