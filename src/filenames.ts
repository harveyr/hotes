import * as path from 'path'
import * as vscode from 'vscode'
import * as md from './markdown'
import { slugify } from './slugs'

export function updateFileName(
  doc: vscode.TextDocument,
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const title = md.getTitle(doc)
    if (!title) {
      console.log('No markdown title found in %s', doc.fileName)
      return resolve()
    }

    const currName = doc.fileName.split(path.sep).pop()
    if (!currName) {
      console.error('Failed to split path %s', doc.fileName)
      return resolve()
    }

    const newName = (slugify(title.toLowerCase()) + '.md').replace('..', '.')
    const oldPath = doc.fileName
    const newPath = oldPath.replace(currName, newName)

    if (newName === currName) {
      console.log('Filename is already %s. Not renaming.', newName)
      return resolve()
    }

    const edit = new vscode.WorkspaceEdit()
    edit.renameFile(vscode.Uri.file(doc.fileName), vscode.Uri.file(newPath))
    vscode.workspace.applyEdit(edit).then(() => {
      resolve(newPath)
    })
  })
}
