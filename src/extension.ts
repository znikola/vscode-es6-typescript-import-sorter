'use strict';

import * as vscode from 'vscode';

import { groupImports } from './group-imports';

import { parse } from './regex';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(`sort imports is active!`);

  const disposable = vscode.commands.registerCommand('extension.sortImports', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return; // No open text editor
    }

    if (!isTypeScriptFile(editor.document.languageId)) {
      return;
    }

    let imports = parse(editor.document);
    console.log(`imports`, imports);

    imports = groupImports(imports);

    console.log('Grouped imports', imports);
  });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

/***** extension specifics start here ****/

function isTypeScriptFile(language: string): boolean {
  return language === 'typescript';
}
