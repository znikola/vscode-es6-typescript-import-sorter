'use strict';

import * as vscode from 'vscode';

import { groupImports } from './group-imports';

import { fileWriterUtil } from './file-writer';
import { parse } from './regex';
import { sort } from './sorting';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerTextEditorCommand('extension.sortImports', (editor: vscode.TextEditor) => {
    // No open text editor or the file is not supported
    if (!editor || !isLanguageSupported(editor.document.languageId)) {
      return;
    }

    executeActions(editor);
  });

  const onSaveDisposable = vscode.workspace.onWillSaveTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isLanguageSupported(event.document.languageId)) {
      return;
    }

    executeActions(editor);
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(onSaveDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

/***** extension specifics start here ****/

function isLanguageSupported(language: string): boolean {
  return language === 'javascript' || language === 'typescript';
}

function executeActions(editor: vscode.TextEditor) {
  const imports = parse(editor.document);
  const importsToDelete = [...imports];
  const sorted = sort(imports);
  const grouped = groupImports(sorted);
  fileWriterUtil(editor, grouped, importsToDelete);
}
