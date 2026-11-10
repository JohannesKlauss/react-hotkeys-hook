/** @type {import('prism-react-renderer').PrismTheme} */
const lightCodeTheme = {
  plain: { color: '#25232a', backgroundColor: '#f9f8f5' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#5c5861' } },
    { types: ['keyword', 'atrule', 'attr-name'], style: { color: '#694aa4' } },
    { types: ['function', 'function-variable', 'class-name', 'tag', 'builtin'], style: { color: '#32559c' } },
    { types: ['string', 'char', 'attr-value', 'number', 'boolean', 'constant'], style: { color: '#a13d28' } },
    { types: ['deleted'], style: { color: '#a13420' } },
  ],
}

/** @type {import('prism-react-renderer').PrismTheme} */
const darkCodeTheme = {
  plain: { color: '#f3efe9', backgroundColor: '#15171c' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#a39da6' } },
    { types: ['keyword', 'atrule', 'attr-name'], style: { color: '#c4b8ff' } },
    { types: ['function', 'function-variable', 'class-name', 'tag', 'builtin'], style: { color: '#a7bcff' } },
    { types: ['string', 'char', 'attr-value', 'number', 'boolean', 'constant'], style: { color: '#ffab8b' } },
    { types: ['deleted'], style: { color: '#ffb6a4' } },
  ],
}

module.exports = { lightCodeTheme, darkCodeTheme }
