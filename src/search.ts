import * as vscode from 'vscode'
import * as markdown from './markdown'
import * as schema from './schema'
import * as docs from './docs'
import * as edits from './edits'

export enum Globs {
  Markdown = '**/*.md',
}

interface FileSearchItem extends schema.QuickPickItem {
  fsPath: string
}

export function markdownQuickPick() {
  docs
    .mapAsync(docToQuickPickItem)
    .then(showQuickPick)
    .then(onSearchItemSelect)
}

export function showMarkdownIndex() {
  // TODO: move index stuff to its own module
  buildIndex()
    .then(parts => {
      return vscode.workspace.openTextDocument({
        language: 'markdown',
        content: parts.join('\n\n'),
      })
    })
    .then(vscode.window.showTextDocument)
}

export function insertFileLink() {
  docs
    .mapAsync(docToQuickPickItem)
    .then(showQuickPick)
    .then(insertFileLinkIntoEditor)
}

function insertFileLinkIntoEditor(item?: FileSearchItem) {
  return new Promise((resolve, reject) => {
    if (!item) {
      return resolve()
    }

    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return resolve()
    }
    const link = markdown.localLinkMarkup({
      alt: item.label,
      fromFile: editor.document.fileName,
      toFile: item.fsPath,
    })

    edits.insertText(link)
  })
}

function showQuickPick(
  items: FileSearchItem[],
): Promise<FileSearchItem | undefined> {
  return new Promise((resolve, reject) => {
    return vscode.window
      .showQuickPick(items, {
        canPickMany: false,
        matchOnDescription: true,
        matchOnDetail: true,
        // onDidSelectItem: onSearchItemSelect,
      })
      .then(resolve)
  })
}

async function buildIndex(): Promise<string[]> {
  const linksByTag: Map<string, string[]> = new Map()
  let taggedParts: string[] = ['# Tagged Notes']
  let untaggedParts: string[] = ['# Untagged Notes']

  for (const parsed of docs.iter()) {
    const title: string = parsed.title ? parsed.title : 'title not found'
    const fileLink = `[${title}](${parsed.fileName})`
    const fileParts = [`## ${title}`, fileLink]

    if (parsed.tags.size) {
      const tagStr = Array.from(parsed.tags)
        .map(tag => {
          return `#${tag}`
        })
        .join(' ')
      fileParts.push(`Tags: ${tagStr}`)

      parsed.tags.forEach(tag => {
        let tagLinks = linksByTag.get(tag)
        if (!tagLinks) {
          tagLinks = []
        }
        tagLinks.push(`${fileLink} \`${tagStr}\` `)
        linksByTag.set(tag, tagLinks)
      })
    } else {
      untaggedParts = untaggedParts.concat(fileParts)
    }
  }

  const tags = Array.from(linksByTag.keys())
  tags.sort()
  for (const tag of tags) {
    const links = linksByTag.get(tag)!
    const linksStr = links
      .map(l => {
        return `- ${l}`
      })
      .join('\n')
    taggedParts = taggedParts.concat([`## Tag: \`#${tag}\``, linksStr])
  }

  return taggedParts.concat(untaggedParts)
}

async function docToQuickPickItem(doc: docs.Document): Promise<FileSearchItem> {
  const item: FileSearchItem = {
    label: doc.title,
    detail: doc.fileName,
    fsPath: doc.fileName,
  }

  if (doc.tags.size) {
    item.description = Array.from(doc.tags)
      .map(t => {
        return `#${t}`
      })
      .join(' ')
  }

  return item
}

function onSearchItemSelect(item?: FileSearchItem) {
  if (!item) {
    return
  }
  const fsPath = item.fsPath

  vscode.workspace.openTextDocument(fsPath).then(doc => {
    vscode.window.showTextDocument(doc)
  })
}
