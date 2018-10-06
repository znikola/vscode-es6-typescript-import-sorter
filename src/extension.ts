'use strict';

import * as vscode from 'vscode';

import { getRange } from './core/file-writer';
import { groupImports } from './core/group-imports';
import { parse } from './core/regex';
import { sort } from './core/sorting';
import { Import } from './models/import';
import { ImportGroup } from './models/import-group';

const TYPESCRIPT_LANGUAGE = 'typescript';
const JAVASCRIPT_LANGUAGE = 'javascript';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerTextEditorCommand('extension.sortImports', (editor: vscode.TextEditor) => {
    // No open text editor or the file is not supported
    if (!editor || !isLanguageSupported(editor.document.languageId)) {
      return;
    }

    const { importsToDelete, grouped } = executeActions(editor.document);
    const { range, text } = getRange(grouped, importsToDelete);
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

function executeActions(document: vscode.TextDocument): { importsToDelete: Import[]; grouped: ImportGroup[] } {
  const imports = parse(document);
  const importsToDelete = [...imports];
  const sorted = sort(imports);
  const grouped = groupImports(sorted);

  return { importsToDelete, grouped };
}

function provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
  const { importsToDelete, grouped } = executeActions(document);
  const { range, text } = getRange(grouped, importsToDelete);

  return [vscode.TextEdit.replace(range, text)];
}
