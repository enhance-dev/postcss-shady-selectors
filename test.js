import postcss from 'postcss'
import prettify from '@enhance/postcss-prettify'
import shady from './index.js'
import test from 'tape'

function process(css, { scopeTo }) {
  return postcss([
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

test('& selector', (t) => {
  const css = `:host .example {
      font-family: system-ui;
      font-size: 1.2rem;
      & > a {
        color: tomato;
        &:hover,
        &:focus {
          color: ivory;
          background-color: tomato;
        }
      }
    }
  `
  const expected = `

my-tag .example {
  font-family: system-ui;
  font-size: 1.2rem;
  & > a {
    color: tomato;
    &:hover,
        &:focus {
      color: ivory;
      background-color: tomato;
    }
  }
}
  `

  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, 'nesting works')
  t.end()
})

test('nesting without &', (t) => {
  const css = `:host .example {
      font-family: system-ui;
      font-size: 1.2rem;
      > a {
        color: tomato;
        &:hover,
        &:focus {
          color: ivory;
          background-color: tomato;
        }
      }
    }
  `
  const expected = `

my-tag .example {
  font-family: system-ui;
  font-size: 1.2rem;
  > a {
    color: tomato;
    &:hover,
        &:focus {
      color: ivory;
      background-color: tomato;
    }
  }
}
  `

  const actual = process(css, { scopeTo: 'my-tag' })
  t.equal(expected, actual, 'nesting without & works')
  t.end()
})
