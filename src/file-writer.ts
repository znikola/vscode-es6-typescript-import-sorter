'use strict';

// Utility file to write the imports to the document
import * as vscode from 'vscode';

import { ImportGroup } from './models/import-group';
import { Import } from './models/import';
import { validArray } from './validation';

const NEW_LINE = '\n';

export function fileWriterUtil(editor: vscode.TextEditor, importGroups: ImportGroup[], oldImports: Import[]): void {
  if (!validArray(importGroups) || !validArray(oldImports)) {
    return;
  }

  const importText = convertImportsToText(importGroups);
  const startPositionToReplace = oldImports[0].startPosition;
  const endPositionToReplace = oldImports[oldImports.length - 1].endPosition;

  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.replace(new vscode.Range(startPositionToReplace, endPositionToReplace), importText);
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

  return removeLastNewLine(importText);
}

function removeLastNewLine(importText: string): string {
  return importText.slice(0, -2);
}
