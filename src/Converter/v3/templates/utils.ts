import ts from "typescript";

import { DevelopmentError } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";

export interface StringItem {
  type: "string";
  value: string;
}

export interface ExpressionItem {
  type: "property";
  value: ts.Expression;
}

export type Item = StringItem | ExpressionItem;

export type Params$TemplateExpression = Item[];

const getTemplateSpan = (
  factory: Factory.Type,
  currentIndex: number,
  nextIndex: number,
  lastIndex: number,
  currentItem: ExpressionItem,
  nextItem: Item | undefined,
): ts.TemplateSpan[] => {
  // == last
  if (!nextItem) {
    return [
      factory.TemplateSpan.create({
        expression: currentItem.value,
        literal: factory.TemplateTail.create({
          text: "",
        }),
      }),
    ];
  }

  if (nextItem.type === "property") {
    if (lastIndex === nextIndex) {
      return [
        factory.TemplateSpan.create({
          expression: currentItem.value,
          literal: factory.TemplateTail.create({
            text: "",
          }),
        }),
        factory.TemplateSpan.create({
          expression: nextItem.value,
          literal: factory.TemplateTail.create({
            text: "",
          }),
        }),
      ];
    } else {
      return [
        factory.TemplateSpan.create({
          expression: currentItem.value,
          literal: factory.TemplateTail.create({
            text: "",
          }),
        }),
        factory.TemplateSpan.create({
          expression: nextItem.value,
          literal: factory.TemplateMiddle.create({
            text: "",
          }),
        }),
      ];
    }
  } else {
    if (lastIndex === nextIndex) {
      return [
        factory.TemplateSpan.create({
          expression: currentItem.value,
          literal: factory.TemplateTail.create({
            text: nextItem.value,
          }),
        }),
      ];
    } else {
      return [
        factory.TemplateSpan.create({
          expression: currentItem.value,
          literal: factory.TemplateMiddle.create({
            text: nextItem.value,
          }),
        }),
      ];
    }
  }
};

/**
 *
 * ``
 * `a`
 * `${b}`
 * `a${b}`
 * `${a}${b}`
 * `${a}b${c}`
 * ``
 */
export const generateTemplateExpression = (factory: Factory.Type, list: Params$TemplateExpression): ts.Expression => {
  if (list.length === 0) {
    return factory.NoSubstitutionTemplateLiteral.create({
      text: "",
    });
  }
  const templateHead = factory.TemplateHead.create({
    text: list[0].type === "property" ? "" : list[0].value,
  });

  const spanList = list.splice(1, list.length);
  if (spanList.length === 0 && list[0].type === "string") {
    return factory.NoSubstitutionTemplateLiteral.create({
      text: list[0].value,
    });
  }
  const lastIndex = spanList.length - 1;
  const restValue = lastIndex % 2;
  let templateSpans: ts.TemplateSpan[] = [];
  for (let i = 0; i <= (lastIndex - restValue) / 2; i++) {
    if (spanList.length === 0) {
      continue;
    }
    const currentIndex = 2 * i;
    const nextIndex = 2 * i + 1;
    const currentItem = spanList[currentIndex];
    const nextItem = spanList[nextIndex];
    if (currentItem.type === "string") {
      throw new DevelopmentError("Logic Error");
    }
    templateSpans = templateSpans.concat(getTemplateSpan(factory, currentIndex, nextIndex, lastIndex, currentItem, nextItem));
  }
  return factory.TemplateExpression.create({
    head: templateHead,
    templateSpans: templateSpans,
  });
};

export const generateVariableIdentifier = (factory: Factory.Type, name: string) => {
  if (name.startsWith("/")) {
    throw new Error("can't start '/'. name=" + name);
  }
  const list = name.split(".");
  if (list.length === 1) {
    return factory.Identifier.create({
      name: name,
    });
  }
  const [n1, n2, ...rest] = list;
  const first = factory.PropertyAccessExpression.create({
    expression: n1,
    name: n2,
  });

  return rest.reduce<ts.PropertyAccessExpression>((previous, current: string) => {
    return factory.PropertyAccessExpression.create({
      expression: previous,
      name: current,
    });
  }, first);
};
