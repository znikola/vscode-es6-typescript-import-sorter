'use strict';

import { TextDocument } from 'vscode';

import { Import } from './models/import';

const ES6_IMPORTS_REG_EX = /^import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?["'\s].*(?:[@\w\/\_\-]+)["'\s].*;\ */gm;

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
      startPosition: textDocument.positionAt(match.index),
      endPosition: textDocument.positionAt(ES6_IMPORTS_REG_EX.lastIndex),
    };
    imports = [...imports, newImport];
  }

  return imports;
}
