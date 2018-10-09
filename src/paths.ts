import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

export function getRootPath(): string | undefined {
  return vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined
}

export function getAbsPath(relPath: string): string | undefined {
  const rootPath = getRootPath()
  if (rootPath) {
    return path.join(rootPath, relPath)
  }
}

export function getWorkspaceRelPath(absPath: string): string | undefined {
  const uri = vscode.Uri.file(absPath)
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
  if (!workspaceFolder) {
    return
  }

  return getRelPath(workspaceFolder.uri.fsPath, absPath)
}

export function getRelPath(fromPath: string, toPath: string): string {
  const relDir = path.relative(path.dirname(fromPath), path.dirname(toPath))

  return path.join(relDir, toPath.split('/').pop()!)
}

export function rename(src: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rename(src, dest, err => {
      if (err) {
        vscode.window.showErrorMessage(`Failed to rename file: ${err}`)
        return reject(err)
      }
      vscode.window.setStatusBarMessage(`Renamed file to ${dest}`)
      resolve()
    })
  })
}
