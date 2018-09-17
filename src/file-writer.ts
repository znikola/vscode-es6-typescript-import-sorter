// Utility file to write the imports to the document
import * as vscode from 'vscode';

import { ImportGroup } from './models/import-group';
import { Import } from './models/import';

export function fileWriterUtil(
  editor: vscode.TextDocument,
  newImports: ImportGroup[],
  oldImports: Import[]
): Thenable<boolean> {
  const workspaceEdits = new vscode.WorkspaceEdit();
  const textEdits: vscode.TextEdit[] = [];
  let text = '';
  let index = 0;

  // workspaceEdits.delete(
  //   editor.uri,
  //   new vscode.Range(
  //     new vscode.Position(0, 0),
  //     new vscode.Position(
  //       oldImports[oldImports.length - 1].endPosition.line,
  //       oldImports[oldImports.length - 1].endPosition.character
  //     )
  //   )
  // );

  // workspaceEdits.replace(
  //   editor.uri,
  //   new vscode.Range(
  //     new vscode.Position(0, 0),
  //     new vscode.Position(
  //       oldImports[oldImports.length - 1].endPosition.line,
  //       oldImports[oldImports.length - 1].endPosition.character
  //     )
  //   ),
  //   ''
  // );

  // workspaceEdits.set(editor.uri, [
  //   new vscode.TextEdit(
  //     new vscode.Range(
  //       new vscode.Position(0, 0),
  //       new vscode.Position(
  //         oldImports[oldImports.length - 1].endPosition.line,
  //         oldImports[oldImports.length - 1].endPosition.character
  //       )
  //     ),
  //     ''
  //   ),
  // ]);

  for (let i = 0; i < oldImports.length; i++) {
    workspaceEdits.delete(editor.uri, new vscode.Range(oldImports[i].startPosition, oldImports[i].endPosition));
  }

  // textWriter(workspaceEdits);

  for (let i = 0; i < newImports.length; i++) {
    for (let j = 0; j < newImports[i].imports.length; j++) {
      const length = newImports[i].imports[j].endPosition.line - newImports[i].imports[j].startPosition.line;
      const startPosition = new vscode.Position(index, newImports[i].imports[j].startPosition.character);
      const endPosition = new vscode.Position(index + length, newImports[i].imports[j].endPosition.character);
      textEdits.push(
        new vscode.TextEdit(new vscode.Range(startPosition, endPosition), newImports[i].imports[j].statement)
      );
      text = text + newImports[i].imports[j].statement;
      workspaceEdits.replace(
        editor.uri,
        new vscode.Range(startPosition, endPosition),
        newImports[i].imports[j].statement
      );
      index = index + length + 1;
    }

    if (i !== newImports.length - 1) {
      const startPosition = new vscode.Position(
        index - 1,
        newImports[i].imports[newImports[i].imports.length - 1].endPosition.character + 1
      );
      const endPosition = new vscode.Position(startPosition.line, startPosition.character + 2);
      textEdits.push(new vscode.TextEdit(new vscode.Range(startPosition, endPosition), '\n'));
      workspaceEdits.replace(editor.uri, new vscode.Range(startPosition, endPosition), '\n');
    }
  }

  // workspaceEdits.set(editor.uri, textEdits);

  return textWriter(workspaceEdits);
}

function textWriter(workspaceEdits: vscode.WorkspaceEdit): Thenable<boolean> {
  return vscode.workspace.applyEdit(workspaceEdits);
}
