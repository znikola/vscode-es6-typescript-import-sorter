'use strict';

import * as vscode from 'vscode';
import { sortImports } from 'import-sorter';
import { Range } from 'import-sorter/dist/lib/models/position';
import { ImportFile } from 'import-sorter/dist/lib/models/import';

const TYPESCRIPT_LANGUAGE = 'typescript';
const JAVASCRIPT_LANGUAGE = 'javascript';

export function activate(context: vscode.ExtensionContext) {
  let settings = vscode.workspace.getConfiguration('es6tssort');

  const disposable = vscode.commands.registerTextEditorCommand('extension.sortImports', (editor: vscode.TextEditor) => {
    // No open text editor or the file is not supported
    if (!editor || !isLanguageSupported(editor.document.languageId)) {
      return;
    }

    const { range: importsRange, sortedImports } = executeActions(editor.document);
    const range = getRange(importsRange);
    editor.edit((editBuilder: vscode.TextEditorEdit) => {
      editBuilder.replace(range, sortedImports);
    });
  });

  const saveDisposable = vscode.workspace.onWillSaveTextDocument(event => {
    if (settings.get('sortOnSave')) {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !isLanguageSupported(event.document.languageId)) {
        return;
      }

      const { range: importsRange, sortedImports } = executeActions(editor.document);
      const range = getRange(importsRange);
      editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.replace(range, sortedImports);
      });
    }
  });

  const onChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    () => {
      settings = vscode.workspace.getConfiguration('es6tssort');
    },
    null,
    context.subscriptions
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(saveDisposable);
  context.subscriptions.push(onChangeDisposable);
}

export function deactivate() {}

/***** extension specifics start here ****/

function isLanguageSupported(language: string): boolean {
  return language === JAVASCRIPT_LANGUAGE || language === TYPESCRIPT_LANGUAGE;
}

// TODO: textDocument as an argument?
function executeActions(textDocument: vscode.TextDocument): ImportFile {
  const content: string = textDocument.getText();
  // TODO: library error handling?
  const result = sortImports({ content });
  return result;
}

// TODO: error handling for the argument
function getRange(importsRange: Range): vscode.Range {
  const startPosition = new vscode.Position(importsRange.start.line, importsRange.start.character);
  const endPosition = new vscode.Position(importsRange.end.line, importsRange.end.character);
  return new vscode.Range(startPosition, endPosition);
}
