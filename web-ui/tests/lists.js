/* eslint-env mocha */
// These are Chimp globals */
/* globals browser assert */

const countLists = () => {
  browser.waitForVisible('.organizations', 5000);
  const elements = browser.elements('.organizations');
  return elements.value.length;
};

describe('organization ui', () => {
  beforeEach(() => {
    browser.url('http://localhost:3100');
  });

  it('can create a organization', () => {
    const initialCount = countLists();

    browser.click('.js-new-organization');

    assert.equal(countLists(), initialCount + 1);
  });
});
