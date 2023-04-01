import ts from "typescript";

import type { TsGenerator } from "../../api";
import * as Utils from "../../utils";

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
  factory: TsGenerator.Factory.Type,
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
export const generateTemplateExpression = (factory: TsGenerator.Factory.Type, list: Params$TemplateExpression): ts.Expression => {
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
      throw new Error("Logic Error");
    }
    templateSpans = templateSpans.concat(getTemplateSpan(factory, currentIndex, nextIndex, lastIndex, currentItem, nextItem));
  }
  return factory.TemplateExpression.create({
    head: templateHead,
    templateSpans: templateSpans,
  });
};

export interface VariableAccessIdentifer {
  kind: "string";
  value: string;
}

export interface ElementAccessExpression {
  kind: "element-access";
  value: string;
}

export type VariableElement = VariableAccessIdentifer | ElementAccessExpression;

export const splitVariableText = (text: string): VariableElement[] => {
  // ["...."] にマッチする
  const pattern = '["[a-zA-Z_0-9.]+"]';
  // 'a.b.c["a"]["b"]'.split(/(\["[a-zA-Z_0-9\.]+"\])/g)
  const splitTexts = text.split(/(\["[a-zA-Z_0-9\\.]+"\])/g); // 区切り文字も含めて分割
  return splitTexts.reduce<VariableElement[]>((splitList, value) => {
    if (value === "") {
      return splitList;
    }
    // ["book.name"] にマッチするか
    if (new RegExp(pattern).test(value)) {
      // ["book.name"] から book.name を抽出
      const matchedValue = value.match(/[a-zA-Z_0-9\\.]+/);
      if (matchedValue) {
        splitList.push({
          kind: "element-access",
          value: matchedValue[0],
        });
      }
      return splitList;
    } else {
      const dotSplited = value.split(".");
      const items = dotSplited.map<VariableAccessIdentifer>(childValue => ({ kind: "string", value: childValue }));
      return splitList.concat(items);
    }
  }, []);
};

export const generateVariableIdentifier = (
  factory: TsGenerator.Factory.Type,
  name: string,
): ts.Identifier | ts.PropertyAccessExpression | ts.ElementAccessExpression => {
  if (name.startsWith("/")) {
    throw new Error("can't start '/'. name=" + name);
  }
  const list = splitVariableText(name);
  // Object参照していない変数名の場合
  if (list.length === 1) {
    return factory.Identifier.create({
      name: name,
    });
  }
  const [n1, n2, ...rest] = list;
  // a.b のような単純な変数名の場合
  const first = factory.PropertyAccessExpression.create({
    expression: n1.value,
    name: n2.value,
  });

  return rest.reduce<ts.PropertyAccessExpression | ts.ElementAccessExpression>((previous, current) => {
    if (current.kind === "string" && Utils.isAvailableVariableName(current.value)) {
      return factory.PropertyAccessExpression.create({
        expression: previous,
        name: current.value,
      });
    }
    // 直接 .value でアクセスできない場合に ["value"] といった形で参照する
    return factory.ElementAccessExpression.create({
      expression: previous,
      index: current.value,
    });
  }, first);
};

export interface LiteralExpressionObject {
  [key: string]: { type: "string" | "variable"; value: string };
}

export const generateObjectLiteralExpression = (
  factory: TsGenerator.Factory.Type,
  obj: LiteralExpressionObject,
  extraProperties: ts.PropertyAssignment[] = [],
): ts.ObjectLiteralExpression => {
  const properties = Object.entries(obj).map(([key, item]) => {
    const initializer =
      item.type === "variable" ? generateVariableIdentifier(factory, item.value) : factory.StringLiteral.create({ text: item.value });
    return factory.PropertyAssignment.create({
      name: Utils.escapeText(key),
      initializer,
    });
  });

  return factory.ObjectLiteralExpression.create({
    properties: extraProperties.concat(properties),
    multiLine: true,
  });
};

/**
 * "/{a}/b/{a}/c{a}/".split(new RegExp("({a})"))
 * => ["/", "{a}", "/b/", "{a}", "/c", "{a}", "/"]
 */
export const stringToArray = (text: string, delimiter: string): string[] => text.split(new RegExp(`(${delimiter})`));

export const multiSplitStringToArray = (text: string, delimiters: string[]): string[] => {
  return delimiters.reduce<string[]>(
    (current, delimiter) => {
      return current.reduce<string[]>((result, currentText) => {
        return result.concat(stringToArray(currentText, delimiter));
      }, []);
    },
    [text],
  );
};
