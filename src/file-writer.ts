// Utility file to write the imports to the document
import * as vscode from 'vscode';

import { ImportGroup } from './models/import-group';
import { Import } from './models/import';

const NEW_LINE = '\n';

export function fileWriterUtil(editor: vscode.TextEditor, importGroups: ImportGroup[], oldImports: Import[]): void {
  const importText = convertImportsToText(importGroups);
  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    for (let old of oldImports) {
      editBuilder.delete(new vscode.Range(old.startPosition, old.endPosition));
    }

    editBuilder.insert(new vscode.Position(0, 0), importText);
  });
}

function convertImportsToText(importGroups: ImportGroup[]): string {
  let importText = '';
  for (let [i, group] of importGroups.entries()) {
    if (i !== 0) {
      importText += NEW_LINE;
    }

    for (let newImport of group.imports) {
      importText += newImport.statement;
      importText += NEW_LINE;
    }
  }

  importText += NEW_LINE;

  return importText;
}
