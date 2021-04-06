import type { OpenApi } from "../../../types";
import { UndefinedComponent } from "../../Exception";
import { Factory } from "../../TsGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import * as Header from "./Header";
import * as Reference from "./Reference";
import * as Schema from "./Schema";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  headers: Record<string, OpenApi.Header | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  store.addComponent("headers", {
    kind: "namespace",
    name: Name.Components.Headers,
  });
  Object.entries(headers).forEach(([name, header]) => {
    if (Guard.isReference(header)) {
      const reference = Reference.generate<OpenApi.Header>(entryPoint, currentPoint, header);
      if (reference.type === "local") {
        if (!store.hasStatement(reference.path, ["interface"])) {
          throw new UndefinedComponent(`Reference "${header.$ref}" did not found in ${reference.path} by ${reference.name}`);
        }
      } else if (reference.type === "remote") {
        Schema.addSchema(
          entryPoint,
          currentPoint,
          store,
          factory,
          reference.path,
          reference.name,
          reference.data.schema,
          context,
          converterContext,
        );
      }
    } else {
      store.addStatement(`components/headers/${name}`, {
        kind: "typeAlias",
        name: converterContext.escapeDeclarationText(name),
        value: Header.generateTypeNode(entryPoint, currentPoint, factory, name, header, context, converterContext),
      });
    }
  });
};
