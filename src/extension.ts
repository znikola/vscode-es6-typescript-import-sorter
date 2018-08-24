'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(`sort imports is active!`);

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  vscode.workspace.onDidSaveTextDocument(event => {
    if (!isTypeScriptFile(event.languageId)) {
      return;
    }

    const imports = getImports(event);
    console.log(`imports`, imports);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}

/***** extension specifics start here ****/

// regex found here: https://gist.github.com/manekinekko/7e58a17bc62a9be47172
// TODO: we should checkout this list as well: https://gist.github.com/pilwon/ff55634a29bb4456e0dd
const ES6_IMPORTS_REG_EX = /(^import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?["'\s].*(?:[@\w\/\_\-]+)["'\s].*;$)/gm;

function isTypeScriptFile(language: string): boolean {
  return language === 'typescript';
}

// TODO: to be removed
// function isTypeScriptFile(document: vscode.TextDocument): boolean {
//     return vscode.languages.match({ scheme: 'file', language: 'typescript' }, document) > 0;
// }

function getImports(textDocument: vscode.TextDocument): string[] {
  const content = textDocument.getText();
  if (!content) {
    return [];
  }

  const regExResult = content.match(ES6_IMPORTS_REG_EX);
  if (!regExResult) {
    return [];
  }

  let results: string[] = [];
  for (const [i, res] of regExResult.entries()) {
    console.log(`result ${i}`, res);
    results = [...results, res];
  }

  return results;
}
