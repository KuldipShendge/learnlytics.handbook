const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/kit-payments.js'), 'utf8');

function checkout({blocked = false} = {}) {
  const destinations = [], tabs = [], attempts = [];
  const status = {
    children: [], textContent: '',
    append(link) { this.children.push(link); },
    focus() {}, scrollIntoView() {}
  };
  const context = {
    window: {
      location: {assign: () => assert.fail('Checkout must keep the website open in its current tab')},
      open(url, target) {
        attempts.push({url, target});
        if (blocked) return null;
        const tab = {
          opener: {}, closed: false,
          location: {replace: url => destinations.push(url)},
          close() { this.closed = true; }
        };
        tabs.push(tab);
        return tab;
      }
    },
    document: {
      getElementById: () => ({querySelector: selector => selector === '.kit-payment-status' ? status : null}),
      createElement: tag => {
        assert.equal(tag, 'a', 'Checkout may create a fallback link, never an embedded payment button');
        return {};
      }
    }
  };
  vm.runInNewContext(source, context);
  return {...context, destinations, tabs, attempts, status};
}

const pages = {
  'data-analyst': ['https://rzp.io/rzp/S2y4eZ3', 'https://rzp.io/rzp/ro1v8df'],
  'ai-automation': ['https://rzp.io/rzp/6j2zp8fF', 'https://rzp.io/rzp/KKrZwPm'],
  'data-science': ['https://rzp.io/rzp/fain7HM', 'https://rzp.io/rzp/jJvaGhJy'],
  'ds-genai-ml': ['https://rzp.io/rzp/qLYK5iB', 'https://rzp.io/rzp/ZoRK2ea']
};
for (const country of ['IN', 'US', 'DE', 'FR']) {
  test('opens the correct payment pages for ' + country, async () => {
    const c = checkout();
    c.window.configureKitPayments(country, new Set(['IN']), new Set(), new Set(['DE', 'FR']));
    for (const [kit, pair] of Object.entries(pages)) {
      await c.window.openKitPayment(kit);
      assert.equal(c.destinations.at(-1), pair[country === 'IN' ? 0 : 1]);
      assert.deepEqual(c.attempts.at(-1), {url: 'about:blank', target: '_blank'});
      assert.equal(c.tabs.at(-1).opener, null);
    }
    assert.equal(c.destinations.length, 4);
  });
}

test('waits for region detection and ignores repeated clicks while pending', async () => {
  const c = checkout();
  let ready;
  c.window.checkoutRegionReady = new Promise(resolve => { ready = resolve; });
  const pending = c.window.openKitPayment('data-science');
  assert.equal(c.tabs.length, 1, 'The new tab must open synchronously during the click');
  assert.equal(c.tabs[0].opener, null);
  await c.window.openKitPayment('data-science');
  assert.equal(c.tabs.length, 1);
  assert.equal(c.destinations.length, 0);
  c.window.configureKitPayments('US', new Set(), new Set(), new Set());
  ready();
  await pending;
  assert.deepEqual(c.destinations, [pages['data-science'][1]]);
  await c.window.openKitPayment('data-science');
  assert.equal(c.destinations.length, 2);
});

test('uses India defaults when country detection is unavailable', async () => {
  const c = checkout();
  for (const [kit, pair] of Object.entries(pages)) {
    await c.window.openKitPayment(kit);
    assert.equal(c.destinations.at(-1), pair[0]);
  }
});

test('preserves the existing per-kit market choices outside India and the US', async () => {
  const c = checkout();
  c.window.configureKitPayments('JP', new Set(['IN', 'JP']), new Set(), new Set());
  for (const [kit, pair] of Object.entries(pages)) {
    await c.window.openKitPayment(kit);
    assert.equal(c.destinations.at(-1), pair[kit === 'data-analyst' || kit === 'ai-automation' ? 0 : 1]);
  }
});

test('unknown kits cannot navigate to a payment page', async () => {
  const c = checkout();
  for (const kit of ['missing-kit', 'toString', '__proto__']) await c.window.openKitPayment(kit);
  assert.equal(c.destinations.length, 0);
  assert.equal(c.tabs.length, 0);
});

test('offers a new-tab link for the correct market when the popup is blocked', async () => {
  const c = checkout({blocked: true});
  c.window.configureKitPayments('US', new Set(), new Set(), new Set());
  await c.window.openKitPayment('data-science');
  assert.equal(c.destinations.length, 0);
  assert.match(c.status.textContent, /blocked/);
  assert.deepEqual(c.status.children[0], {
    href: pages['data-science'][1], target: '_blank', rel: 'noopener noreferrer',
    textContent: 'Open secure payment page'
  });
});

test('does not reopen a payment tab closed while region detection is pending', async () => {
  const c = checkout();
  let ready;
  c.window.checkoutRegionReady = new Promise(resolve => { ready = resolve; });
  const pending = c.window.openKitPayment('data-analyst');
  c.tabs[0].close();
  ready();
  await pending;
  assert.equal(c.attempts.length, 1);
  assert.equal(c.destinations.length, 0);
  assert.equal(c.status.children[0].href, pages['data-analyst'][0]);
});

test('closes the unused tab after a checkout error and allows another attempt', async () => {
  const c = checkout();
  c.window.checkoutRegionReady = Promise.reject(new Error('Region detection failed'));
  await c.window.openKitPayment('data-science');
  assert.equal(c.tabs[0].closed, true);
  assert.equal(c.destinations.length, 0);
  assert.match(c.status.textContent, /Please try again/);
  c.window.checkoutRegionReady = Promise.resolve();
  await c.window.openKitPayment('data-science');
  assert.equal(c.destinations[0], pages['data-science'][0]);
});
