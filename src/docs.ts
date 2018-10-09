import * as fs from 'fs'

import * as vscode from 'vscode'
import * as dates from './dates'
import * as paths from './paths'
import * as markdown from './markdown'

const linkRegexp = /\[([^[]+)\]\(([^([]+)\)/g
const tagRegexp = /(^|\W)#([a-zA-Z][a-zA-Z0-9_\-]+)/g

// TODO: get rid of alt and uri?
interface MarkdownLink {
  markup: string
  alt: string
  uri: string
}

export interface Document {
  fileName: string
  title: string
  tags: Set<string>
  links: MarkdownLink[]
}

let parsedDocs: Map<string, Document> = new Map()

let scanPromise: Promise<void> | undefined

export function scan(): Promise<void> {
  if (!scanPromise) {
    scanPromise = doScan()
  }

  return scanPromise

  function doScan(): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = new Date()

      vscode.workspace
        .findFiles('**/*.md')
        .then(files => {
          return Promise.all(files.map(parseFile))
        })
        .then(docs => {
          docs.forEach(set)
          vscode.window.setStatusBarMessage(
            `Hotes: parsed ${docs.length} docs in ${dates.ageInMilliseconds(
              start,
            )}ms`,
          )
          resolve()
        })
    })
  }
}

/**
 * Scan a file and update it in the records.
 */
export function scanFile(fsPath?: string): Promise<Document | undefined> {
  return new Promise((resolve, reject) => {
    if (!fsPath) {
      return resolve()
    }
    parseFile(vscode.Uri.file(fsPath)).then(d => {
      set(d)
      resolve({ ...d })
    })
  })
}

export async function mapAsync(
  f: (d: Document) => Promise<any>,
): Promise<any[]> {
  const a = []
  for (const doc of iter()) {
    a.push(await f(doc))
  }

  return a
}

export function get(key: string): Document | undefined {
  return parsedDocs.get(key)
}

export function set(d: Document) {
  parsedDocs.set(d.fileName, d)
}

export function* iter() {
  const paths = Array.from(parsedDocs.keys())
  paths.sort((a, b) => {
    return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs
  })

  for (const p of paths) {
    const doc = parsedDocs.get(p)
    if (doc) {
      yield { ...doc }
    }
  }
}

function parseFile(f: vscode.Uri): Promise<Document> {
  return new Promise((resolve, reject) => {
    vscode.workspace
      .openTextDocument(f)
      .then(parseDoc)
      .then(resolve)
  })
}

async function parseDoc(doc: vscode.TextDocument): Promise<Document> {
  return parseDocText(
    doc.fileName,
    doc.getText(new vscode.Range(0, 0, doc.lineCount - 1, 0)),
  )
}

export function parseDocText(fileName: string, text: string): Document {
  let title: string | undefined
  const titleMatch = text.match(/^#\s(.+)/m)
  if (titleMatch) {
    title = titleMatch[1]
  } else {
    title = paths.getWorkspaceRelPath(fileName)
  }

  const parsed: Document = {
    fileName: fileName,
    title: title ? title : '???',
    tags: new Set(),
    links: [],
  }

  let tagMatch
  // For now, hacky way to avoid accidentally seeing tags in code blocks and the
  // like farther down the page. TODO: standardize on a tag format.
  const tagText = text.slice(0, 500)
  do {
    tagMatch = tagRegexp.exec(tagText)
    if (tagMatch) {
      const tag = tagMatch[2].trim().toLowerCase()
      if (tag.length > 2) {
        parsed.tags.add(tagMatch[2].trim().toLowerCase())
      }
    }
  } while (tagMatch)

  let linkMatch
  do {
    linkMatch = linkRegexp.exec(text)
    if (linkMatch) {
      parsed.links.push({
        markup: linkMatch[0],
        alt: linkMatch[1],
        uri: linkMatch[2],
      })
    }
  } while (linkMatch)

  return parsed
}

export async function updateLinks(oldPath: string, newPath: string) {
  const updates = getLinkUpdates(oldPath, newPath)
  if (!updates.length) {
    return
  }

  const workspaceEdit = new vscode.WorkspaceEdit()
  Promise.all(updates.map(recordEdit))
    .then(() => {
      return vscode.workspace.applyEdit(workspaceEdit)
    })
    .then(() => {
      return Promise.all(updates.map(u => scanFile(u.fsPath)))
    })
    .then(() => {
      vscode.window.showInformationMessage(`Updated ${updates.length} links`)
    })

  function recordEdit(e: ReplacementEdit) {
    return new Promise((resolve, reject) => {
      vscode.workspace.openTextDocument(e.fsPath).then(d => {
        const newText = d.getText().replace(e.old, e.new)
        workspaceEdit.replace(
          d.uri,
          new vscode.Range(0, 0, d.lineCount - 1, d.eol),
          newText,
        )
        resolve()
      })
    })
  }
}

interface ReplacementEdit {
  fsPath: string
  old: string
  new: string
}

export function getLinkUpdates(
  oldPath: string,
  newPath: string,
): ReplacementEdit[] {
  const updates: ReplacementEdit[] = []

  for (const doc of iter()) {
    const oldRelPath = paths.getRelPath(doc.fileName, oldPath)

    for (const link of doc.links) {
      if (!link.markup.includes(oldRelPath)) {
        continue
      }
      const target = get(newPath)
      if (!target) {
        continue
      }

      updates.push({
        fsPath: doc.fileName,
        old: link.markup,
        new: markdown.localLinkMarkup({
          alt: target.title,
          fromFile: doc.fileName,
          toFile: newPath,
        }),
      })
      // just one link per doc shouuuuld do it?
      break
    }
  }

  return updates
}
