import * as assert from 'assert'
import * as docs from '../docs'
// import * as paths from '../paths'

suite('Docs Tests', function() {
  test('parse doc', function() {
    const text = `# This is a title!\n\n#Tag1\ntags: #tag-2 bad#badtag\nzombo [link1](./2/3)\n[link2](http://zooks) #tag3 [[docs](docs)]`
    const parsed = docs.parseDocText('/doc', text)
    assert.equal('This is a title!', parsed.title)

    const expectedTags = ['tag1', 'tag-2', 'tag3']
    assert.equal(expectedTags.length, parsed.tags.size, 'found both tags')
    const tagsStr = JSON.stringify(Array.from(parsed.tags))
    for (const tag of expectedTags) {
      assert.equal(true, parsed.tags.has(tag), `${tag} not found in ${tagsStr}`)
    }

    assert.deepEqual(
      ['[link1](./2/3)', '[link2](http://zooks)', '[docs](docs)'],
      parsed.links.map(l => l.markup),
    )
  })

  // test('link updates', () => {
  //   const docPath = '/Notes/Reading/some-reading.md'
  //   const linkPath = paths.getWorkspaceRelPath('Elsewhere/other-reading.md')!
  //   docs.setDoc({
  //     fileName: docPath,
  //     tags: new Set(),
  //     links: [
  //       {
  //         alt: 'Other Reading',
  //         uri: linkPath,
  //       },
  //     ],
  //   })
  // })
})
