import * as assert from 'assert'
import { slugify } from '../slugs'

suite('Slugify Tests', function() {
  test('slugify', function() {
    assert.equal('asdf-123', slugify('Asdf 123'))
    assert.equal('asdf-123', slugify('Asdf: 123'))
    assert.equal('asdf-123', slugify('Asdf: 123!'))
    assert.equal('asdf-123', slugify('Asdf: (123)!'))
    assert.equal('asdf-123', slugify('Asdf: (123)!*'))
    assert.equal('asdf-123', slugify('Asdf: (123)!* ~'))
    assert.equal('asdf-123', slugify('Asdf: (123)!* ~ @'))
    assert.equal('asdf-123', slugify('Asdf / 123'), 'slash handling')
  })
})
