# Hotes (Harvey's Notes)

This is an experimental [VS Code](https://code.visualstudio.com/) extension. The
goal is to streamline my personal note-taking in markdown. For the time being
this is not meant for anyone other than me.

## Why?

I take a lot of notes. After devoting substantial time to [Dropbox
Paper](https://www.dropbox.com/paper), [Notion.so](https://www.notion.so),
[Bear](https://bear.app/), [Evernote](https://evernote.com/), etc., I wanted to
try the simplest, most portable, most durable approach: a bunch of markdown
files!

But I'm not ready to give up on the niceties some of those tools provide, such
as wiki-style linking between docs and easy image insertion. I also don't want
to saddle myself to another framework like org mode or vimwiki.

Hence this project, to see how much work it'd be to find a best-of-all-worlds compromise.

Note that I almost bailed on this approach until I tried the excellent
[Markdown Support for Visual Studio Code](https://github.com/neilsustc/vscode-markdown),
which makes editing markdown in vscode just as nice as (if not nicer than) any
of those tools listed above.

## Features

### Insert links between pages

Provides a command to create a link to between pages that will actually work in the editor when clicked on. For example:

```md
[Some Good Stuff](../bad-stuff/some-good-stuff.md)
```

### Document index

Find `#tags` in docs and build up a browsable index of them with links to docs.

### Add images to notes

Provides a quick-picker of the images in my screenshots directory. Upon selection, it will copy the file into my `Notes/Images` folder with a unique name and insert a link to the image (`![alt](/Notes/Images/123456789.png)`) into the doc.

That naming approach prevents images from showing up in `Ctrl-P` searching.

### Create note templates for web articles

Enter a URL, get a markdown template that looks like:

```markdown
# Article Title Goes Here

https://url/goes/here

Tags: (to be added manually)

## Scraped headers ...

### ... go here
```

### Auto-rename markdown files

For example, a markdown file with a header `# Fascinating Article about (Doorknobs)!` will be auto-named `fascinating-article-about-doorknobs.md`.

Keeping the filenames in sync with the doc titles aids in `Ctrl-P` searching, among other things.

## TODO

- [ ] Try Azure pipeline for tests https://code.visualstudio.com/docs/extensions/testing-extensions
