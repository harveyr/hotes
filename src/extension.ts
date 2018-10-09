'use strict'
import * as vscode from 'vscode'
import * as articles from './articles'
import * as docs from './docs'
import * as filenames from './filenames'
import * as images from './images'
import * as search from './search'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Hotes activating')

  docs.scan()

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.showIndex',
      search.showMarkdownIndex,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.searchHotes',
      search.markdownQuickPick,
    ),
  )
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.insertLink',
      search.insertFileLink,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.addArticle',
      articles.addArticle,
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.addImage', images.addImage),
  )

  vscode.workspace.onDidSaveTextDocument(doc => {
    filenames
      .updateFileName(doc)
      .then(docs.scanFile)
      .then(newDoc => {
        if (newDoc && newDoc.fileName !== doc.fileName) {
          docs.updateLinks(doc.fileName, newDoc.fileName)
        }
      })
  })
}

// this method is called when your extension is deactivated
export function deactivate() {}
