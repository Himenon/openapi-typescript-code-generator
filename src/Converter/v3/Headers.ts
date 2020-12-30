import * as Reference from "./Reference";
import * as Header from "./Header";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import { Store } from "./store";
import { UndefinedComponent } from "../../Exception";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  headers: OpenApi.MapLike<string, OpenApi.Header | OpenApi.Reference>,
): void => {
  store.addStatement("headers", {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Headers",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
    }),
    statements: [],
  });
  Object.entries(headers).forEach(([name, header]) => {
    if (Guard.isReference(header)) {
      const reference = Reference.generate<OpenApi.Header>(entryPoint, currentPoint, header);
      if (reference.type === "local") {
        if (!store.hasStatement(reference.target, reference.name)) {
          throw new UndefinedComponent(`Reference "${header.$ref}" did not found in ${reference.target} by ${reference.name}`);
        }
      } else if (reference.type === "remote") {
        store.addStatement(reference.target, {
          type: "interface",
          value: Header.generateInterface(entryPoint, reference.referencePoint, factory, reference.target, reference.data),
        });
      }
      return;
    }
    store.addStatement("components/Headers", {
      type: "interface",
      value: Header.generateInterface(entryPoint, currentPoint, factory, name, header),
    });
  });
};
