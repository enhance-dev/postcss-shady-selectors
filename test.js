import postcss from 'postcss'
import preset from 'postcss-preset-env'
import prettify from '@enhance/postcss-prettify'
import shady from './index.js'
import test from 'tape'

function process(css, { scopeTo }) {
  return postcss([
    preset({ stage: 4 }),
    shady({ scopeTo }),
    prettify()
  ])
    .process(css, { from: 'undefined' })
    .toString()
}

test('ssr context with special selectors', (t) => {
  const css = `
    :host { background:blue; }
    .container > ::slotted(*) {
      display: block;
    }
    .container > ::slotted(*[slot="title"]) {
      display: block;
    }
    .foo { display: block; }
    another-tag::part(thing) { display: block; }`

  const expected = `

my-tag {
  background: blue;
}

my-tag .container > * {
  display: block;
}

my-tag .container > *[slot="title"] {
  display: block;
}

my-tag .foo {
  display: block;
}

my-tag another-tag [part*="thing"][part*="another-tag"] {
  display: block;
}`

  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, 'shadow CSS transformed')
  t.end()
})

test(':host pseudo element', (t) => {
  const css = `:host div { background: blue; }`
  const expected = `

my-tag div {
  background: blue;
}`
  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, 'basic :host transformed')
  t.end()
})

test(':host() function form', (t) => {
  const css = `:host(.something) div { background:blue; }`
  const expected = `

my-tag.something div {
  background: blue;
}`
  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, ':host works')
  t.end()
})


test(':host-context() function form', (t) => {
  t.plan(1)

  const css = `:host-context(.something) div { background:blue; }`
  const expected = `

.something my-tag div {
  background: blue;
}`
  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, ':host works')
  t.end()
})


// Selector Lists have inconsistent browser support and it is unclear if the spec for :host :host-context and ::slotted support Selector Lists. The tests below are skipped for now.

// Not supported yet
test.skip(':host() with selector list', (t) => {
  const css = `:host(.something, [some=thing]) div { background:blue; }`
  const expected = `my-tag.something div,
  my-tag[some=thing] div {
    background:blue; 
}`
  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, ':host() with list')
  t.end()
})

//Not supported Yet
test.skip(':host-context() with selector list', (t) => {
  const css = `:host-context(.something, [some=thing]) div { background:blue; }`
  const expected = `

.something my-tag div, 
  [some=thing] my-tag div {
    background: blue;
  }`
  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, ':host-context() with list')
  t.end()
})

//Not supported yet
test.skip('::slotted() with selector list', (t) => {
  const css = `::slotted(.something, [some=thing]) div { background:blue; }`
  const expected = `

my-tag .something div, 
  [some=thing] my-tag div {
    background: blue;
  }`
  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, '::slotted() with list')
  t.end()
})


