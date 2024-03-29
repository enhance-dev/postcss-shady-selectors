function PostcssShadySelectors(opts = {}) {
  return {
    postcssPlugin: 'postcss-shady-selectors',
    Once(root) {
      root.walkRules(rule => {
        rule.selector = selectorConverter(rule.selector, opts)
      })
    }
  }
}

function selectorConverter(out, { scopeTo = '' }) {
  out = out.replace(/(::slotted)\(\s*(.+)\s*\)/, '$2')
    .replace(/(:host-context)\(\s*(.+)\s*\)/, '$2 __TAGNAME__')
    .replace(/(:host)\(\s*(.+)\s*\)/, '__TAGNAME__$2')
    .replace(/([[a-zA-Z0-9_-]*)(::part)\(\s*(.+)\s*\)/, '$1 [part*="$3"][part*="$1"]')
    .replace(':host', '__TAGNAME__')

  out = /__TAGNAME__/.test(out)
    ? out.replace(/(.*)__TAGNAME__(.*)/, `$1${scopeTo}$2`)
    : out.startsWith('&')
      ? out
      : `${scopeTo} ${out}`

  return out
}

PostcssShadySelectors.postcss = true
export default PostcssShadySelectors
