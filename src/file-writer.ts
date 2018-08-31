// Utility file to write the imports to the document
import * as vscode from 'vscode';

import { Import } from './models/import';

export function fileWriterUtil(editor: vscode.TextDocument, newImports: Import[]): Thenable<boolean> {
  const workspaceEdits = new vscode.WorkspaceEdit();
  newImports.forEach(value => {
    workspaceEdits.replace(editor.uri, new vscode.Range(value.startPosition, value.endPosition), value.statement);
  });

  return textWriter(workspaceEdits);
}

function textWriter(workspaceEdits: vscode.WorkspaceEdit): Thenable<boolean> {
  return vscode.workspace.applyEdit(workspaceEdits);
}
