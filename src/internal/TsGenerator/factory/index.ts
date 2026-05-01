import { EOL } from "os";

// --- Private helpers ---

const escapeTemplateText = (text: string): string => text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const escapeIdentifier = (text: string): string => text.replace(/-/g, "_");

const indentLines = (s: string, indent: string): string =>
  s
    .split("\n")
    .map(line => (line ? `${indent}${line}` : line))
    .join("\n");

const hasTopLevelOp = (s: string): boolean => {
  let depth = 0;
  for (let i = 0; i < s.length - 2; i++) {
    const c = s[i];
    if (c === "{" || c === "<" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ">" || c === ")" || c === "]") depth--;
    else if (depth === 0 && (s[i] === "|" || s[i] === "&") && s[i - 1] === " " && s[i + 1] === " ") return true;
  }
  return false;
};

const buildComment = (comment: string, deprecated?: boolean): string => {
  const escaped = comment
    .replace(/\*\//, "\\*\\\\/")
    .replace(/\/\*/, "/\\\\*")
    .replace(/\*\/\*/, "\\*\\/\\*");
  const lines = deprecated ? ["@deprecated", ...escaped.split(/\r?\n/)] : escaped.split(/\r?\n/);
  const filtered = lines.filter((line, i) => !(i === lines.length - 1 && line === ""));
  if (filtered.length === 1) {
    return `/** ${filtered[0]} */` + EOL;
  }
  return `/**` + EOL + filtered.map(l => (l.trimEnd() ? ` * ${l.trimEnd()}` : ` *`)).join(EOL) + EOL + ` */` + EOL;
};

const addComment = (code: string, comment?: string, deprecated?: boolean): string => {
  if (!comment && !deprecated) return code;
  return buildComment(comment || "", deprecated) + code;
};

// --- Factory.Type interface ---

export interface Type {
  Identifier: {
    create(p: { name: string }): string;
  };
  StringLiteral: {
    create(p: { text: string; isSingleQuote?: boolean }): string;
  };
  RegularExpressionLiteral: {
    create(p: { text: string }): string;
  };
  LiteralTypeNode: {
    create(p: { value: string | boolean | number; comment?: string }): string;
  };
  TypeNode: {
    create(
      p:
        | { type: "string"; enum?: string[] }
        | { type: "integer" | "number"; enum?: number[] }
        | { type: "boolean"; enum?: boolean[] }
        | { type: "object"; value?: string[] }
        | { type: "array"; value: string }
        | { type: "null" | "undefined" | "never" | "void" | "any" },
    ): string;
  };
  TypeReferenceNode: {
    create(p: { name: string; typeArguments?: readonly string[] }): string;
  };
  UnionTypeNode: {
    create(p: { typeNodes: string[] }): string;
  };
  IntersectionTypeNode: {
    create(p: { typeNodes: string[] }): string;
  };
  TypeLiteralNode: {
    create(p: { members: string[] }): string;
  };
  IndexedAccessTypeNode: {
    create(p: { objectType: string; indexType: string }): string;
  };
  TypeOperatorNode: {
    create(p: { syntaxKind: "keyof" | "unique" | "readonly"; type: string }): string;
  };
  FunctionTypeNode: {
    create(p: { typeParameters?: readonly string[]; parameters: readonly string[]; type: string }): string;
  };
  TypeParameterDeclaration: {
    create(p: { name: string; constraint?: string; defaultType?: string }): string;
  };
  ParameterDeclaration: {
    create(p: { name: string; optional?: true; modifiers?: "private" | "public"; type?: string }): string;
  };
  PropertySignature: {
    create(p: { name: string; readOnly: boolean; optional: boolean; type: string; comment?: string }): string;
  };
  PropertyDeclaration: {
    create(p: {
      modifiers?: readonly string[];
      name: string;
      questionOrExclamationToken?: "?" | "!" | undefined;
      type?: string;
      initializer?: string;
    }): string;
  };
  IndexSignatureDeclaration: {
    create(p: { name: string; type: string }): string;
  };
  NoSubstitutionTemplateLiteral: {
    create(p: { text: string; rawText?: string }): string;
  };
  TemplateHead: {
    create(p: { text: string; rawText?: string }): string;
  };
  TemplateMiddle: {
    create(p: { text: string; rawText?: string }): string;
  };
  TemplateTail: {
    create(p: { text: string; rawText?: string }): string;
  };
  TemplateSpan: {
    create(p: { expression: string; literal: string }): string;
  };
  TemplateExpression: {
    create(p: { head: string; templateSpans: string[] }): string;
  };
  BinaryExpression: {
    create(p: { left: string; operator: "+" | "="; right: string }): string;
  };
  PropertyAccessExpression: {
    create(p: { expression: string; name: string }): string;
  };
  ElementAccessExpression: {
    create(p: { expression: string; argumentExpression: string }): string;
  };
  CallExpression: {
    create(p: { expression: string; typeArguments?: readonly string[]; argumentsArray: readonly string[] }): string;
  };
  ObjectLiteralExpression: {
    create(p: { properties: string[]; multiLine?: boolean }): string;
  };
  PropertyAssignment: {
    create(p: { name: string; initializer: string; comment?: string }): string;
  };
  ShorthandPropertyAssignment: {
    create(p: { name: string }): string;
  };
  ArrowFunction: {
    create(p: {
      typeParameters?: readonly string[];
      parameters: readonly string[];
      type?: string;
      equalsGreaterThanToken?: unknown;
      body: string;
    }): string;
  };
  ReturnStatement: {
    create(p: { expression?: string }): string;
  };
  ExpressionStatement: {
    create(p: { expression: string }): string;
  };
  Block: {
    create(p: { statements: string[]; multiLine?: boolean }): string;
  };
  VariableDeclaration: {
    create(p: { name: string; type?: string; initializer?: string }): string;
  };
  VariableDeclarationList: {
    create(p: { declarations: readonly string[]; flag: "const" }): string;
  };
  VariableStatement: {
    create(p: { comment?: string; deprecated?: boolean; modifiers?: readonly string[]; declarationList: string }): string;
  };
  TypeAliasDeclaration: {
    create(p: { export?: true; name: string; type: string; comment?: string; deprecated?: boolean }): string;
  };
  InterfaceDeclaration: {
    create(p: {
      export?: true;
      deprecated?: boolean;
      name: string;
      members: readonly string[];
      typeParameters?: readonly string[];
      comment?: string;
    }): string;
  };
  MethodDeclaration: {
    create(p: {
      name: string;
      async?: boolean;
      private?: boolean;
      typeParameters?: readonly string[];
      parameters?: readonly string[];
      type?: string;
      body?: string;
      comment?: string;
      deprecated?: boolean;
    }): string;
  };
  ConstructorDeclaration: {
    create(p: { parameters?: readonly string[]; body?: string }): string;
  };
  ClassDeclaration: {
    create(p: { name: string; export?: true; members: readonly string[]; typeParameterDeclaration: readonly string[] }): string;
  };
  Namespace: {
    create(p: { export?: true; name: string; statements: string[]; comment?: string; deprecated?: boolean }): string;
    findNamespace(p: { node: string; name: string }): string | undefined;
    createMultiple(p: { export?: true; names: string[]; statements: string[]; comment?: string; deprecated?: boolean }): string;
    update(p: { node: string; statements: string[] }): string;
    addStatements(p: { node: string; statements: string[] }): string;
  };
}

export const create = (): Type => {
  return {
    Identifier: {
      create(p) {
        return p.name;
      },
    },

    StringLiteral: {
      create(p) {
        if (p.isSingleQuote) {
          const escaped = p.text.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
          return `'${escaped}'`;
        }
        const escaped = p.text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return `"${escaped}"`;
      },
    },

    RegularExpressionLiteral: {
      create(p) {
        return p.text;
      },
    },

    LiteralTypeNode: {
      create(p) {
        const node = (() => {
          if (typeof p.value === "string") {
            const escaped = p.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            return `"${escaped}"`;
          }
          if (typeof p.value === "number") {
            return `${p.value}`;
          }
          return p.value ? "true" : "false";
        })();
        return addComment(node, p.comment);
      },
    },

    TypeNode: {
      create(p) {
        switch (p.type) {
          case "string":
            if (p.enum) {
              return p.enum.map(v => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(" | ");
            }
            return "string";
          case "number":
          case "integer":
            if (p.enum) {
              return p.enum.join(" | ");
            }
            return "number";
          case "boolean":
            if (p.enum) {
              return p.enum.map(v => `${v}`).join(" | ");
            }
            return "boolean";
          case "object": {
            const members = p.value || [];
            if (members.length === 0) return "{}";
            return `{\n${members.map(m => indentLines(m, "    ")).join("\n")}\n}`;
          }
          case "array": {
            const needsParens = hasTopLevelOp(p.value) && !p.value.startsWith("(");
            return needsParens ? `(${p.value})[]` : `${p.value}[]`;
          }
          case "null":
            return "null";
          case "undefined":
            return "undefined";
          case "never":
            return "never";
          case "void":
            return "void";
          case "any":
            return "any";
          default:
            return "any";
        }
      },
    },

    TypeReferenceNode: {
      create(p) {
        if (p.typeArguments && p.typeArguments.length > 0) {
          return `${p.name}<${p.typeArguments.join(", ")}>`;
        }
        return p.name;
      },
    },

    UnionTypeNode: {
      create(p) {
        return p.typeNodes.map(t => (hasTopLevelOp(t) && !t.startsWith("(") ? `(${t})` : t)).join(" | ");
      },
    },

    IntersectionTypeNode: {
      create(p) {
        return p.typeNodes.map(t => (hasTopLevelOp(t) && !t.startsWith("(") ? `(${t})` : t)).join(" & ");
      },
    },

    TypeLiteralNode: {
      create(p) {
        if (p.members.length === 0) return "{}";
        return `{\n${p.members.map(m => indentLines(m, "    ")).join("\n")}\n}`;
      },
    },

    IndexedAccessTypeNode: {
      create(p) {
        const obj = hasTopLevelOp(p.objectType) && !p.objectType.startsWith("(") ? `(${p.objectType})` : p.objectType;
        return `${obj}[${p.indexType}]`;
      },
    },

    TypeOperatorNode: {
      create(p) {
        return `${p.syntaxKind} ${p.type}`;
      },
    },

    FunctionTypeNode: {
      create(p) {
        const typeParams = p.typeParameters?.length ? `<${p.typeParameters.join(", ")}>` : "";
        return `${typeParams}(${p.parameters.join(", ")}) => ${p.type}`;
      },
    },

    TypeParameterDeclaration: {
      create(p) {
        let result = p.name;
        if (p.constraint) result += ` extends ${p.constraint}`;
        if (p.defaultType) result += ` = ${p.defaultType}`;
        return result;
      },
    },

    ParameterDeclaration: {
      create(p) {
        const mod = p.modifiers ? `${p.modifiers} ` : "";
        const opt = p.optional ? "?" : "";
        const type = p.type ? `: ${p.type}` : "";
        return `${mod}${p.name}${opt}${type}`;
      },
    },

    PropertySignature: {
      create(p) {
        const readonly = p.readOnly ? "readonly " : "";
        const optional = p.optional ? "?" : "";
        const node = `${readonly}${p.name}${optional}: ${p.type};`;
        return addComment(node, p.comment);
      },
    },

    PropertyDeclaration: {
      create(p) {
        const mods = p.modifiers?.length ? p.modifiers.join(" ") + " " : "";
        const token = p.questionOrExclamationToken || "";
        const type = p.type ? `: ${p.type}` : "";
        const init = p.initializer ? ` = ${p.initializer}` : "";
        return `${mods}${p.name}${token}${type}${init};`;
      },
    },

    IndexSignatureDeclaration: {
      create(p) {
        return `[${p.name}: string]: ${p.type};`;
      },
    },

    NoSubstitutionTemplateLiteral: {
      create(p) {
        return `\`${escapeTemplateText(p.rawText ?? p.text)}\``;
      },
    },

    TemplateHead: {
      create(p) {
        return `\`${escapeTemplateText(p.rawText ?? p.text)}\${`;
      },
    },

    TemplateMiddle: {
      create(p) {
        return `}${escapeTemplateText(p.rawText ?? p.text)}\${`;
      },
    },

    TemplateTail: {
      create(p) {
        return `}${escapeTemplateText(p.rawText ?? p.text)}\``;
      },
    },

    TemplateSpan: {
      create(p) {
        return `${p.expression}${p.literal}`;
      },
    },

    TemplateExpression: {
      create(p) {
        return p.head + p.templateSpans.join("");
      },
    },

    BinaryExpression: {
      create(p) {
        return `${p.left} ${p.operator} ${p.right}`;
      },
    },

    PropertyAccessExpression: {
      create(p) {
        return `${p.expression}.${p.name}`;
      },
    },

    ElementAccessExpression: {
      create(p) {
        return `${p.expression}[${p.argumentExpression}]`;
      },
    },

    CallExpression: {
      create(p) {
        const typeArgs = p.typeArguments?.length ? `<${p.typeArguments.join(", ")}>` : "";
        return `${p.expression}${typeArgs}(${p.argumentsArray.join(", ")})`;
      },
    },

    ObjectLiteralExpression: {
      create(p) {
        if (!p.multiLine) {
          return `{ ${p.properties.join(", ")} }`;
        }
        if (p.properties.length === 0) return "{}";
        return `{\n${p.properties.map(prop => indentLines(prop, "    ")).join(",\n")}\n}`;
      },
    },

    PropertyAssignment: {
      create(p) {
        const base = `${p.name}: ${p.initializer}`;
        return addComment(base, p.comment);
      },
    },

    ShorthandPropertyAssignment: {
      create(p) {
        return p.name;
      },
    },

    ArrowFunction: {
      create(p) {
        const typeParams = p.typeParameters?.length ? `<${p.typeParameters.join(", ")}>` : "";
        const params = `(${p.parameters.join(", ")})`;
        const ret = p.type ? `: ${p.type}` : "";
        return `${typeParams}${params}${ret} => ${p.body}`;
      },
    },

    ReturnStatement: {
      create(p) {
        return p.expression !== undefined ? `return ${p.expression};` : "return;";
      },
    },

    ExpressionStatement: {
      create(p) {
        return `${p.expression};`;
      },
    },

    Block: {
      create(p) {
        if (p.statements.length === 0) return "{}";
        if (!p.multiLine) {
          return `{ ${p.statements.join(" ")} }`;
        }
        return `{\n${p.statements.map(s => indentLines(s, "    ")).join("\n")}\n}`;
      },
    },

    VariableDeclaration: {
      create(p) {
        const type = p.type ? `: ${p.type}` : "";
        const init = p.initializer !== undefined ? ` = ${p.initializer}` : "";
        return `${p.name}${type}${init}`;
      },
    },

    VariableDeclarationList: {
      create(p) {
        return `const ${p.declarations.join(", ")}`;
      },
    },

    VariableStatement: {
      create(p) {
        const mods = p.modifiers?.length ? p.modifiers.join(" ") + " " : "";
        const node = `${mods}${p.declarationList};`;
        return addComment(node, p.comment, p.deprecated);
      },
    },

    TypeAliasDeclaration: {
      create(p) {
        const exp = p.export ? "export " : "";
        const node = `${exp}type ${p.name} = ${p.type};`;
        return addComment(node, p.comment, p.deprecated);
      },
    },

    InterfaceDeclaration: {
      create(p) {
        const exp = p.export ? "export " : "";
        const typeParams = p.typeParameters?.length ? `<${p.typeParameters.join(", ")}>` : "";
        const body = p.members.length > 0 ? `{\n${p.members.map(m => indentLines(m, "    ")).join("\n")}\n}` : "{\n}";
        const node = `${exp}interface ${escapeIdentifier(p.name)}${typeParams} ${body}`;
        return addComment(node, p.comment, p.deprecated);
      },
    },

    MethodDeclaration: {
      create(p) {
        const modifiers: string[] = [];
        if (p.private) modifiers.push("private");
        else modifiers.push("public");
        if (p.async) modifiers.push("async");
        const mods = modifiers.join(" ") + " ";
        const typeParams = p.typeParameters?.length ? `<${p.typeParameters.join(", ")}>` : "";
        const params = `(${(p.parameters || []).join(", ")})`;
        const ret = p.type ? `: ${p.type}` : "";
        const body = p.body || "{}";
        const node = `${mods}${p.name}${typeParams}${params}${ret} ${body}`;
        return addComment(node, p.comment, p.deprecated);
      },
    },

    ConstructorDeclaration: {
      create(p) {
        const params = `(${(p.parameters || []).join(", ")})`;
        const body = p.body || "{}";
        return `constructor${params} ${body}`;
      },
    },

    ClassDeclaration: {
      create(p) {
        const exp = p.export ? "export " : "";
        const typeParams = p.typeParameterDeclaration.length ? `<${p.typeParameterDeclaration.join(", ")}>` : "";
        const body = p.members.length > 0 ? `{\n${p.members.map(m => indentLines(m, "    ")).join("\n")}\n}` : "{}";
        return `${exp}class ${p.name}${typeParams} ${body}`;
      },
    },

    Namespace: {
      create(p) {
        const exp = p.export ? "export " : "";
        const body = p.statements.length > 0 ? `{\n${p.statements.map(s => indentLines(s, "    ")).join("\n")}\n}` : "{ }";
        const node = `${exp}namespace ${p.name} ${body}`;
        return addComment(node, p.comment, p.deprecated);
      },
      findNamespace(p) {
        const re = new RegExp(`(?:export\\s+)?namespace\\s+${escapeIdentifier(p.name)}\\s*\\{`);
        return re.test(p.node) ? p.node : undefined;
      },
      createMultiple(p) {
        const names = [...p.names].reverse();
        const firstName = names[0];
        const restNames = names.slice(1);
        const exp = p.export ? "export " : "";
        const body = p.statements.length > 0 ? `{\n${p.statements.map(s => indentLines(s, "    ")).join("\n")}\n}` : "{}";
        let current = addComment(`${exp}namespace ${firstName} ${body}`, p.comment, p.deprecated);
        return restNames.reduce((prev, name) => {
          return `export namespace ${name} {\n${indentLines(prev, "    ")}\n}`;
        }, current);
      },
      update(p) {
        const insertPoint = p.node.lastIndexOf("}");
        if (insertPoint === -1) return p.node;
        const added = p.statements.map(s => indentLines(s, "    ")).join("\n");
        return p.node.slice(0, insertPoint) + added + "\n}";
      },
      addStatements(p) {
        return p.statements.reduce((node, s) => {
          const insertPoint = node.lastIndexOf("}");
          if (insertPoint === -1) return node;
          return node.slice(0, insertPoint) + indentLines(s, "    ") + "\n}";
        }, p.node);
      },
    },
  };
};
