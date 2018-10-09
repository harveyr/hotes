import * as assert from 'assert'
import * as paths from '../paths'

suite('Paths Tests', function() {
  test('getRelPath', function() {
    assert.equal(
      '../bingo/jones.md',
      paths.getRelPath('/path/to/some/jones.md', '/path/to/bingo/jones.md'),
    )
    assert.equal(
      'jones2.md',
      paths.getRelPath('/path/to/bingo/jones1.md', '/path/to/bingo/jones2.md'),
    )
  })
})
