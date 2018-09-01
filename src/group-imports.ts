import * as vscode from 'vscode';

import { Import } from './models/import';

export function groupImports(imports: Import[]): Import[] {
  let last: string;
  const reg = /([a-zA-Z-@_]+)/;

  for (let i = 0; i < imports.length; i++) {
    const statement = imports[i].statement.split('from');
    const current = reg.exec(statement[statement.length - 1]);

    if (last) {
      if (last !== current[0]) {
        imports[i].startPosition = new vscode.Position(
          imports[i].startPosition.line + 1,
          imports[i].startPosition.character
        );
      }
    }
    last = current[0];
  }
  return imports;
}
