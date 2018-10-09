import * as assert from 'assert'
import * as dateFns from 'date-fns'
import * as dates from '../dates'

suite('Dates Tests', function() {
  test('ageInSeconds', function() {
    assert.equal(dates.ageInSeconds(dateFns.subSeconds(new Date(), 3)), 3)
  })
})
