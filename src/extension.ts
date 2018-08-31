'use strict';

import * as vscode from 'vscode';

import { parse } from './regex';
import { sort } from './sorting';

export function activate(context: vscode.ExtensionContext) {
  console.log(`sort imports is active!`);

  const disposable = vscode.commands.registerTextEditorCommand('extension.sortImports', (editor: vscode.TextEditor) => {
    if (!editor || !isTypeScriptFile(editor.document.languageId)) {
      return; // No open text editor or the file is not supported
    }

    if (!isTypeScriptFile(editor.document.languageId)) {
      return;
    }

    const imports = parse(editor.document);
    console.log(`imports`, imports.map(i => i.from));
    const sorted = sort(imports);
    console.log(`sorted`, sorted.map(i => i.from));
  });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

/***** extension specifics start here ****/

function isTypeScriptFile(language: string): boolean {
  return language === 'typescript';
}
