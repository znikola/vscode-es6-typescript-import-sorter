'use strict';

import * as vscode from 'vscode';

// regex found here: https://gist.github.com/manekinekko/7e58a17bc62a9be47172
// TODO: we should checkout this list as well: https://gist.github.com/pilwon/ff55634a29bb4456e0dd
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
