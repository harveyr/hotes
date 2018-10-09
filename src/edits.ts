import * as vscode from 'vscode'

export function insertText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return resolve()
    }

    editor.edit(builder => {
      builder.insert(editor.selection.active, text)
      resolve()
    })
  })
}
