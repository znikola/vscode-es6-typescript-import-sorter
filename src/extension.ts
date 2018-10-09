'use strict';

import * as vscode from 'vscode';

import { sortImports } from 'import-sorter';
import { Range } from 'import-sorter/dist/lib/models/position';

const TYPESCRIPT_LANGUAGE = 'typescript';
const JAVASCRIPT_LANGUAGE = 'javascript';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerTextEditorCommand('extension.sortImports', (editor: vscode.TextEditor) => {
    // No open text editor or the file is not supported
    if (!editor || !isLanguageSupported(editor.document.languageId)) {
      return;
    }

    const { range: importsRange, text } = executeActions(editor.document);
    const range = getRange(importsRange);
    editor.edit((editBuilder: vscode.TextEditorEdit) => {
      editBuilder.replace(range, text);
    });
  });

  const onTypeScriptSaveDisposable = vscode.languages.registerDocumentFormattingEditProvider(
    { scheme: 'file', language: TYPESCRIPT_LANGUAGE },
    { provideDocumentFormattingEdits }
  );
  const onJavaScriptSaveDisposable = vscode.languages.registerDocumentFormattingEditProvider(
    { scheme: 'file', language: JAVASCRIPT_LANGUAGE },
    { provideDocumentFormattingEdits }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(onTypeScriptSaveDisposable);
  context.subscriptions.push(onJavaScriptSaveDisposable);
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

function provideDocumentFormattingEdits(textDocument: vscode.TextDocument): vscode.TextEdit[] {
  const { range: importsRange, text } = executeActions(textDocument);
  const range = getRange(importsRange);
  return [vscode.TextEdit.replace(range, text)];
}

// TODO: error handling for the argument
function getRange(importsRange: Range): vscode.Range {
  const startPosition = new vscode.Position(importsRange.start.line, importsRange.start.character);
  const endPosition = new vscode.Position(importsRange.end.line, importsRange.end.character);
  return new vscode.Range(startPosition, endPosition);
}
