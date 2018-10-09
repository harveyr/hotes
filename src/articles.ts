import * as fs from 'fs'
import * as url from 'url'
import * as cheerio from 'cheerio'
import * as vscode from 'vscode'
import * as request from 'request'
import slugify from 'slugify'
import * as paths from './paths'

export function addArticle(): Promise<void> {
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        prompt: 'Article URL',
        validateInput: validateUrl,
      })
      .then(onInput)

    function onInput(uri?: string) {
      if (!uri) {
        return
      }

      request.get(uri, (err: Error, resp: request.Response, body: string) => {
        if (err) {
          return vscode.window.showErrorMessage(`${err}`)
        }
        if (resp.statusCode > 299) {
          return vscode.window.showErrorMessage(
            `Request failed with status ${resp.statusCode}`,
          )
        }

        const page = parsedPage(uri, body)
        const slug = slugify(page.title).toLowerCase()
        const relPath = `Reading/${slug}.md`

        const rootPath = vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0].uri.fsPath
          : undefined
        if (!rootPath) {
          return
        }

        const absPath = paths.getAbsPath(relPath)
        if (!absPath) {
          return
        }

        if (fs.existsSync(absPath)) {
          vscode.window.showInformationMessage(
            `Path already exists: ${relPath}`,
          )
        } else {
          fs.writeFileSync(absPath, page.markdown)
        }

        vscode.workspace
          .openTextDocument(absPath)
          .then(vscode.window.showTextDocument)
      })
    }
  })
}

function validateUrl(uri: string): string | undefined {
  const parsed = url.parse(uri)
  if (!parsed.protocol) {
    return 'URL is missing a protocol'
  }
  if (!parsed.host) {
    return 'URL is missing a host'
  }
  if (!parsed.path) {
    return 'URL is missing a path'
  }
}

interface ParsedDoc {
  title: string
  markdown: string
}

function parsedPage(uri: string, html: string): ParsedDoc {
  const $ = cheerio.load(html)

  const headerMap = new Map([
    ['h1', '#'],
    ['h2', '##'],
    ['h3', '###'],
    // ['h4', '####'],
    // ['h5', '#####'],
    // ['h6', '######'],
  ])

  let title = $('title').text()
  const headers: string[] = []

  $(':header').each((i: number, el: any) => {
    const headerName = el.name
    const text = $(el).text()

    if (!title && headerName === 'h1') {
      title = text
      return
    }

    const markdownHeader = headerMap.get(headerName)
    if (!markdownHeader) {
      return
    }

    headers.push(`${markdownHeader} ${text}`)
  })

  return {
    title: title,
    markdown: [`# ${title}`, uri, `Tags:`, '---'].concat(headers).join('\n\n'),
  }
}
