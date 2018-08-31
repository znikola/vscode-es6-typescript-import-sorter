'use strict';

import { TextDocument } from 'vscode';

import { validateString } from './validation';
import { Import } from './models/import';

const ES6_IMPORTS_REG_EX = /^import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?(["'\s].*(?:[@\w\/\_\-]+)["'\s]).*;\ */gm;
// extracted from ES6_IMPORTS_REG_EX. Because of how JavaScript's regex engine is implemented (https://stackoverflow.com/a/27131524/5252849), we have to extract it separatley.
const ES6_FROM_REG_EX = /([@\w\/\_\-]+)/gm;

export function parse(textDocument: TextDocument): Import[] {
  const content: string = textDocument.getText();
  if (!content) {
    return [];
  }

  ES6_IMPORTS_REG_EX.lastIndex = 0;
  let imports: Import[] = [];

  let match: RegExpExecArray | null;
  while ((match = ES6_IMPORTS_REG_EX.exec(content))) {
    const newImport: Import = {
      statement: match[0],
      from: parseFrom(match[1]),
      startPosition: textDocument.positionAt(match.index),
      endPosition: textDocument.positionAt(ES6_IMPORTS_REG_EX.lastIndex),
    };
    imports = [...imports, newImport];
  }

  return imports;
}

function parseFrom(raw: string): string {
  if (!validateString(raw)) {
    return raw;
  }

  const result = raw.match(ES6_FROM_REG_EX);
  if (!result) {
    return raw;
  }

  return result[0];
}
