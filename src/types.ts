import * as ts from "typescript";

export type TransformerFactory<T extends ts.Node> = ts.TransformerFactory<T>;
