'use strict';

import { TextDocument } from 'vscode';

import { validString } from './validation';
import { Import } from './models/import';
import { determineType } from './util';

const ES6_IMPORTS_REGEX = /^import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?(["'\s].*(?:[@\w\/\_\-.]+)["'\s]).*;\ */gm;
// extracted from ES6_IMPORTS_REGEX. Because of how JavaScript's regex engine is implemented (https://stackoverflow.com/a/27131524/5252849), we have to extract it separatley.
const ES6_FROM_REGEX = /([@\w\/\_\-.]+)/gm;

export function parse(textDocument: TextDocument): Import[] {
  const content: string = textDocument.getText();
  if (!content) {
    return [];
  }

  ES6_IMPORTS_REGEX.lastIndex = 0;
  let imports: Import[] = [];

  let match: RegExpExecArray | null;
  while ((match = ES6_IMPORTS_REGEX.exec(content))) {
    const startPosition = textDocument.positionAt(match.index);
    const endPosition = textDocument.positionAt(ES6_IMPORTS_REGEX.lastIndex);

    const from = parseFrom(match[1]);
    const newImport: Import = {
      statement: match[0],
      from,
      type: determineType(from),
      startPosition,
      endPosition,
    };
    imports = [...imports, newImport];
  }

  return imports;
}

function parseFrom(raw: string): string {
  if (!validString(raw)) {
    return raw;
  }

  const result = raw.match(ES6_FROM_REGEX);
  if (!result) {
    return raw;
  }

  return result[0];
}
