'use strict';

// Utility file to write the imports to the document
import * as vscode from 'vscode';

import { Import } from '../models/import';
import { ImportGroup } from '../models/import-group';
import { validArray } from '../utils/validation';

const NEW_LINE = '\n';

export function getRange(importGroups: ImportGroup[], oldImports: Import[]): { range: vscode.Range; text: string } {
  if (!validArray(importGroups) || !validArray(oldImports)) {
    return { range: <vscode.Range>{}, text: '' };
  }

  const text = convertImportsToText(importGroups);

  const startPositionToReplace = oldImports[0].startPosition;
  const endPositionToReplace = oldImports[oldImports.length - 1].endPosition;

  return {
    range: new vscode.Range(startPositionToReplace, endPositionToReplace),
    text,
  };
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
  return importText.slice(0, -1);
}
