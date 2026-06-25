/**
 * 将 public/theme/element-ui.css 中的旧主色色阶替换为新主色色阶。
 * Usage: node utils/retheme-element-ui.js
 */
const fs = require('fs')
const path = require('path')
const color = require('css-color-function')
const formula = require('../src/utils/theme/formula.json')

const OLD_THEME = {
  '--color-primary': '#3D73F5',
  '--color-success': '#2793d7',
  '--color-info': '#1c84c6',
  '--color-warning': '#f8ac59',
  '--color-danger': '#ed5565'
}

const NEW_THEME = {
  '--color-primary': '#3D73F5',
  '--color-success': '#1AC45D',
  '--color-info': '#3D73F5',
  '--color-warning': '#FF8F34',
  '--color-danger': '#FF4545'
}

function generateColors(themeColors) {
  const colors = {}
  const primaryColor = themeColors['--color-primary']

  for (const [key, value] of Object.entries(formula)) {
    let replaceColor
    if (value.includes('primary')) {
      replaceColor = value.replace(/primary/g, primaryColor)
    }
    if (value.includes('success')) {
      replaceColor = value.replace(/success/g, themeColors['--color-success'])
    }
    if (value.includes('info')) {
      replaceColor = value.replace(/info/g, themeColors['--color-info'])
    }
    if (value.includes('warning')) {
      replaceColor = value.replace(/warning/g, themeColors['--color-warning'])
    }
    if (value.includes('danger')) {
      replaceColor = value.replace(/danger/g, themeColors['--color-danger'])
    }
    if (replaceColor && !replaceColor.includes('undefined')) {
      const convertColor = color.convert(replaceColor)
      colors[key] =
        convertColor.indexOf('rgba') > -1 ? convertColor : colorRgbToHex(convertColor)
    }
  }

  return colors
}

function colorRgbToHex(rgb) {
  const [r, g, b] = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
  return (
    '#' +
    ((1 << 24) + (Number(r) << 16) + (Number(g) << 8) + Number(b)).toString(16).slice(1)
  )
}

function replacePalette(css, fromColors, toColors) {
  let next = css
  Object.keys(formula).forEach((key) => {
    const from = fromColors[key]
    const to = toColors[key]
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) {
      return
    }
    next = next.replace(new RegExp(from.replace('#', '#'), 'ig'), to)
  })
  return next
}

const cssPath = path.join(__dirname, '../public/theme/element-ui.css')
const css = fs.readFileSync(cssPath, 'utf8')
const updated = replacePalette(css, generateColors(OLD_THEME), generateColors(NEW_THEME))

fs.writeFileSync(cssPath, updated)
console.log('Updated Element UI theme CSS (primary #3D73F5, success #1AC45D, warning #FF8F34, danger #FF4545)')
