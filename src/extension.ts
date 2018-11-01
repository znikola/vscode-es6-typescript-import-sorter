'use strict';

import * as vscode from 'vscode';
import { sortImports } from 'import-sorter';
import { Range } from 'import-sorter/dist/lib/models/position';

const TYPESCRIPT_LANGUAGE = 'typescript';
const JAVASCRIPT_LANGUAGE = 'javascript';

export function activate(context: vscode.ExtensionContext) {
  let settings = vscode.workspace.getConfiguration('es6tssort');

  vscode.commands.registerTextEditorCommand(
    'extension.sortImports',
    (editor: vscode.TextEditor) => {
      // No open text editor or the file is not supported
      if (!editor || !isLanguageSupported(editor.document.languageId)) {
        return;
      }

      const { range: importsRange, text } = executeActions(editor.document);
      const range = getRange(importsRange);
      editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.replace(range, text);
      });
    },
    context.subscriptions
  );

  vscode.workspace.onWillSaveTextDocument(event => {
    if (settings.get('sortOnSave')) {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !isLanguageSupported(event.document.languageId)) {
        return;
      }

      const { range: importsRange, text } = executeActions(editor.document);
      const range = getRange(importsRange);
      editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.replace(range, text);
      });
    }
  });

  vscode.workspace.onDidChangeConfiguration(
    () => {
      settings = vscode.workspace.getConfiguration('es6tssort');
    },
    null,
    context.subscriptions
  );
}

export function deactivate() {}

/***** extension specifics start here ****/

function isLanguageSupported(language: string): boolean {
  return language === JAVASCRIPT_LANGUAGE || language === TYPESCRIPT_LANGUAGE;
}

// TODO: textDocument as an argument?
function executeActions(textDocument: vscode.TextDocument): { range: Range; text: string } {
  const content: string = textDocument.getText();
  const result = sortImports(content);
  return result;
}

// TODO: error handling for the argument
function getRange(importsRange: Range): vscode.Range {
  const startPosition = new vscode.Position(importsRange.start.line, importsRange.start.character);
  const endPosition = new vscode.Position(importsRange.end.line, importsRange.end.character);
  return new vscode.Range(startPosition, endPosition);
}
