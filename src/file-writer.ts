// Utility file to write the imports to the document
import * as vscode from 'vscode';

import { ImportGroup } from './models/import-group';

export function fileWriterUtil(editor: vscode.TextDocument, newImports: ImportGroup[]): Thenable<boolean> {
  const workspaceEdits = new vscode.WorkspaceEdit();

  for (let i = 0; i < newImports.length; i++) {
    for (let j = 0; j < newImports[i].imports.length; j++) {
      const startPosition = new vscode.Position(
        newImports[i].imports[j].startPosition.line,
        newImports[i].imports[j].startPosition.character
      );
      const endPosition = new vscode.Position(
        newImports[i].imports[j].endPosition.line,
        newImports[i].imports[j].endPosition.character
      );
      workspaceEdits.replace(
        editor.uri,
        new vscode.Range(startPosition, endPosition),
        newImports[i].imports[j].statement
      );
    }

    if (i !== newImports.length - 1) {
      const startPosition = new vscode.Position(
        newImports[i].imports[newImports[i].imports.length - 1].startPosition.line,
        newImports[i].imports[newImports[i].imports.length - 1].endPosition.character + 1
      );
      const endPosition = new vscode.Position(startPosition.line, startPosition.character + 2);
      workspaceEdits.replace(editor.uri, new vscode.Range(startPosition, endPosition), '\n');
    }
  }

  return textWriter(workspaceEdits);
}

function textWriter(workspaceEdits: vscode.WorkspaceEdit): Thenable<boolean> {
  return vscode.workspace.applyEdit(workspaceEdits);
}
