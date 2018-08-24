'use strict';

import * as vscode from 'vscode';

const ES6_IMPORTS_REG_EX = /(^import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?["'\s].*(?:[@\w\/\_\-]+)["'\s].*;$)/gm;

export function parse(textDocument: vscode.TextDocument) {
  const content = textDocument.getText();
  if (!content) {
    return [];
  }

  ES6_IMPORTS_REG_EX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = ES6_IMPORTS_REG_EX.exec(textDocument.getText()))) {
    console.log(`match`, match);
    console.log(`start`, textDocument.positionAt(match.index));
    console.log(`end`, textDocument.positionAt(ES6_IMPORTS_REG_EX.lastIndex));
  }
}
