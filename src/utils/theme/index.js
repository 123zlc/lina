import { changeMenuColor, generateColors, getProjectTheme, mix, setRootColors } from './color'
import axios from 'axios'
import formula from './formula.json'
import { scopedLocalStorage as localStorage } from '@/utils/storage'

let originalStyle = ''

const SEMANTIC_BUTTONS = {
  primary: {
    colorVar: '--color-primary',
    disabledBorder: '#BAD6FF',
    disabledText: '#BAD6FF',
    disabledBg: '#F0F7FF'
  },
  warning: {
    colorVar: '--color-warning',
    disabledBorder: '#FFDAAD',
    disabledText: '#FFDAAD',
    disabledBg: '#FFF9F0'
  },
  success: {
    colorVar: '--color-success',
    disabledBorder: '#8FEBAB',
    disabledText: '#8FEBAB',
    disabledBg: '#EDFFF1'
  },
  danger: {
    colorVar: '--color-danger',
    disabledBorder: '#FFC6BF',
    disabledText: '#FFC6BF',
    disabledBg: '#FFF2F0'
  }
}

function buildSemanticButtonStyles() {
  let css = ''
  for (const [type, config] of Object.entries(SEMANTIC_BUTTONS)) {
    const color = `var(${config.colorVar})`
    // 全局 mixin 默认给 el-button 加 is-plain，样式只针对 .is-plain 即可
    css += `
      .el-button--${type}.is-plain:not(.is-disabled) {
        color: ${color}!important;
        border-color: ${color}!important;
        background-color: #fff!important;
      }
      .el-button--${type}.is-plain:not(.is-disabled):hover,
      .el-button--${type}.is-plain:not(.is-disabled):focus,
      .el-button--${type}.is-plain:not(.is-disabled):active {
        color: #fff!important;
        background-color: ${color}!important;
        border-color: ${color}!important;
      }
      .el-button--${type}.is-plain.is-disabled,
      .el-button--${type}.is-plain.is-disabled:hover,
      .el-button--${type}.is-plain.is-disabled:focus,
      .el-button--${type}.is-plain.is-disabled:active {
        color: ${config.disabledText}!important;
        border-color: ${config.disabledBorder}!important;
        background-color: ${config.disabledBg}!important;
      }
    `
  }
  return css
}

export function changeElementColor() {
  let colorsCssText = ''
  let cssText = originalStyle
  const colors = generateColors(getProjectTheme())
  for (const [key, value] of Object.entries(colors)) {
    cssText = cssText.replace(new RegExp('(:|\\s+)' + key, 'g'), '$1' + `${value}`)
    colorsCssText += `
    .color-${key}{color: ${value}!important;}
    .bg-${key}{background-color: ${value}!important;}
    .border-${key}{border-color: ${value}!important;}
    `
    if (['primary', 'success', 'info', 'warning', 'danger'].includes(key)) {
      const darken = mix('000000', value.replace(/#/g, ''), 10)
      const tooLightColor = mix('ffffff', value.replace(/#/g, ''), 90)
      colorsCssText = colorsCssText + `
        .el-link.el-link--${key}{
          color: ${value}!important;
        }
        .el-link.el-link--${key}:hover {
          color: ${darken}!important;
        }
        .el-link.el-link--${key}.is-underline:hover:after,
        .el-link.el-link--${key}:after {
          border-color: ${value}!important;
        }
        .el-tag--dark.el-tag--${key} {
          background-color: ${value} !important;
        }
        .el-alert.el-alert--${key}.is-light {
          background-color: ${tooLightColor};
        }
      `
    }
  }

  colorsCssText += buildSemanticButtonStyles()

  colorsCssText = colorsCssText.replaceAll('\n', '')
  let styleTag = document.getElementById('themeStyle')
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.setAttribute('id', 'themeStyle')
    document.head.appendChild(styleTag)
  }
  styleTag.innerText = cssText + colorsCssText
}

export function changeThemeColors() {
  return new Promise((resolve) => {
    if (!originalStyle) {
      axios.all([
        axios.get(window.__UI_BASE__ + 'theme/element-ui.css'),
        axios.get(window.__UI_BASE__ + 'theme/element-extra.css')
      ]).then(
        axios.spread((file, extraFile) => {
          const fileData = file.data
          const extraFileData = extraFile.data.replace(/[\r\n]/g, '')
          originalStyle = replaceStyleColors(fileData + extraFileData)
          resolve()
        })
      )
    } else {
      resolve()
    }
  }).then(() => {
    setRootColors()
    changeMenuColor()
    changeElementColor()
  })
}

export function applyProjectTheme() {
  try {
    localStorage.removeItem('themeColors')
  } catch (error) {
    // ignore storage errors
  }
  return changeThemeColors()
}

export function replaceStyleColors(data) {
  const colors = generateColors()
  const colorMap = new Map()
  Object.keys(formula).forEach((key) => {
    colorMap.set(colors[key], key)
  })

  for (const [key, value] of colorMap) {
    data = data.replace(new RegExp(key, 'ig'), value)
  }

  return data
}
