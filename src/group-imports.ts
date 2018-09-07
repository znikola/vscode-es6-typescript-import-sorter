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

    if (last) {
      if (last !== current[0]) {
        const blankLinePostion = new vscode.Position(currentImports[currentImports.length - 1].endPosition.line + 1, 1);
        importGroups.push({ imports: currentImports, blankLinePostion });
        currentImports = [];
        currentImports.push(imports[i]);
      } else {
        currentImports.push(imports[i]);
      }
    } else {
      currentImports.push(imports[i]);
    }

    last = current[0];

    if (i === imports.length - 1) {
      const blankLinePostion = new vscode.Position(currentImports[currentImports.length - 1].endPosition.line + 1, 1);
      importGroups.push({ imports: currentImports, blankLinePostion });
    }
  }
  return importGroups;
}
