import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import * as dates from './dates'
import * as edits from './edits'
import * as schema from './schema'
import * as paths from './paths'

interface ImageItem extends schema.QuickPickItem {
  fsPath: string
  ext: string
}

export function addImage() {
  // FIXME:
  const home = process.env.HOME
  if (!home) {
    return vscode.window.showErrorMessage('No $HOME in environment')
  }
  const basePath = path.join(home, 'Downloads')
  const files = getSortedFiles(basePath, ['png'])

  vscode.window.showQuickPick(filesToItems(files)).then((item?: ImageItem) => {
    if (!item) {
      return
    }

    const destRelPath = `Images/${new Date().getTime()}.${item.ext}`
    const destPath = paths.getAbsPath(destRelPath)
    if (!destPath) {
      return
    }

    const read = fs.createReadStream(item.fsPath)
    const write = fs.createWriteStream(destPath)
    read.on('error', err => {
      console.error('Read error: ', err)
    })
    write.on('error', err => {
      console.error('write error: ', err)
    })
    read.pipe(write)

    const link = `![Alt](/${destRelPath})`

    edits.insertText(link)

    const disposable = vscode.window.setStatusBarMessage(
      `Wrote image to ${destRelPath}`,
    )
    setTimeout(disposable.dispose, 3000)
  })
}

function filesToItems(files: string[]): ImageItem[] {
  return files.map(f => {
    const stats = fs.statSync(f)
    const created = dates.humanizedDistance(stats.birthtime)

    const ext: string = f.split('.').pop()!

    return {
      label: f.split('/').pop() || f,
      detail: `Age: ${created}`,
      fsPath: f,
      ext: ext,
    }
  })
}

function getSortedFiles(dirPath: string, extensions: string[]): string[] {
  const extSet: Set<string> = new Set(
    extensions.map(e => {
      if (e.charAt(0) === '.') {
        return e.slice(1)
      }
      return e
    }),
  )

  return fs
    .readdirSync(dirPath)
    .filter(f => {
      const ext = f.split('.').pop()
      return ext && extSet.has(ext)
    })
    .map(f => {
      return {
        name: path.join(dirPath, f),
        time: fs.statSync(path.join(dirPath, f)).mtime.getTime(),
      }
    })
    .sort((a, b) => {
      return b.time - a.time
    })
    .map(v => {
      return v.name
    })
}

// function getLatestFile(
//   dirPath: string,
//   extensions: string[],
// ): string | undefined {
//   const files = getSortedFiles(dirPath, extensions)
//   if (files && files.length) {
//     return files[0]
//   }
// }
