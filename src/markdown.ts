import * as vscode from 'vscode'
import * as paths from './paths'

export function isMarkdown(doc: vscode.TextDocument): boolean {
  return doc.fileName.split('.').pop() === 'md'
}

export function getTitle(doc: vscode.TextDocument): string | undefined {
  if (!isMarkdown(doc)) {
    return
  }

  const line = doc.lineAt(0)
  const match = line.text.match(/#\s(\S.*)/)
  if (match) {
    return match[1]
  }
}

interface LinkMarkupArg {
  alt: string
  fromFile: string
  toFile: string
}
export function localLinkMarkup(arg: LinkMarkupArg) {
  const relPath = paths.getRelPath(arg.fromFile, arg.toFile)

  return `[+${arg.alt}](${relPath})`
}

export function linkMarkup(alt: string, uri: string) {
  return `[${alt}](${uri})`
}
