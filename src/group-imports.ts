'use strict';

import * as vscode from 'vscode';

import { Import } from './models/import';
import { ImportGroup } from './models/import-group';
import { isLastIteration } from './util';

export function groupImports(imports: Import[]): ImportGroup[] {
  let last = '';
  const importGroups: ImportGroup[] = [];
  let currentImports: Import[] = [];

  for (let i = 0; i < imports.length; i++) {
    const importFrom = imports[i].from;
    const importStatementSections = importFrom.split('/');
    let statementTitle = '';

    for (let x = 0; x < importStatementSections.length; x++) {
      if (importStatementSections[x] === '..') {
        statementTitle += '/' + importStatementSections[x];
      } else if (x === 0) {
        statementTitle += importStatementSections[x];
        break;
      } else {
        break;
      }
    }

    if (last) {
      if (last !== statementTitle) {
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

    last = statementTitle;

    if (isLastIteration(i, imports)) {
      const blankLinePostion = new vscode.Position(currentImports[currentImports.length - 1].endPosition.line, 1);
      importGroups.push({ imports: currentImports, blankLinePostion });
    }
  }
  return importGroups;
}
