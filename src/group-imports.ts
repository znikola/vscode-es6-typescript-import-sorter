'use strict';

import * as vscode from 'vscode';

import { Import } from './models/import';
import { ImportGroup } from './models/import-group';

export function groupImports(imports: Import[]): ImportGroup[] {
  let last = '';
  const importGroups: ImportGroup[] = [];
  let currentImports: Import[] = [];

  for (let i = 0; i < imports.length; i++) {
    const statement = imports[i].from;
    const current = statement.split('/');
    let statementGroupingText = '';

    for (let x = 0; x < current.length; x++) {
      if (current[x] === '..') {
        statementGroupingText += '/' + current[x];
      } else if (x === 0) {
        statementGroupingText += current[x];
        break;
      } else {
        break;
      }
    }

    if (last) {
      if (last !== statementGroupingText) {
        const blankLinePostion = new vscode.Position(currentImports[currentImports.length - 1].endPosition.line, 1);
        importGroups.push({ imports: currentImports, blankLinePostion });
        currentImports = [];
        currentImports.push(imports[i]);
      } else {
        currentImports.push(imports[i]);
      }
    } else {
      currentImports.push(imports[i]);
    }

    last = statementGroupingText;

    if (i === imports.length - 1) {
      const blankLinePostion = new vscode.Position(currentImports[currentImports.length - 1].endPosition.line, 1);
      importGroups.push({ imports: currentImports, blankLinePostion });
    }
  }
  return importGroups;
}
