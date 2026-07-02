import defaultSettings from '@/settings'
import { getPublicSettings } from '@/api/settings'
import { applyProjectTheme } from '@/utils/theme/index'
import { getProjectTheme } from '@/utils/theme/color'
import request from '@/utils/request'
import faviconUrl from '@/assets/img/facio.ico'
import logoUrl from '@/assets/img/logo.png'
import { LOGIN_TITLE } from '@/constants/branding'

const { showSettings, fixedHeader, sidebarLogo, tagsView } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  tagsView: tagsView,
  logoMode: 'combine',
  vendor: '',
  publicSettings: {},
  hasValidLicense: false,
  authMethods: {},
  themeColors: {},
  tableActionButtonType: 'default'
}

function syncInterfaceTheme(interfaceSettings = {}) {
  const themeColors = getProjectTheme()

  applyProjectTheme()

  return {
    ...interfaceSettings,
    login_title: LOGIN_TITLE,
    logo_index: logoUrl,
    logo_logout: logoUrl,
    favicon: faviconUrl,
    theme_info: {
      ...(interfaceSettings.theme_info || {}),
      colors: themeColors
    }
  }
}

function updateTitleIcon() {
  let link = document.querySelector("link[rel*='icon']")
  if (!link) {
    link = document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  link.href = faviconUrl
  document.title = LOGIN_TITLE
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_PUBLIC_SETTINGS: (state, settings) => {
    state.publicSettings = settings
    state.themeColors = getProjectTheme()
    state.tableActionButtonType = settings?.INTERFACE?.theme_info?.['table-action-button'] || 'default'

    if (settings['XPACK_ENABLED']) {
      state.hasValidLicense = settings['XPACK_LICENSE_IS_VALID']
    }
  },
  SET_LOGO_MODE: (state, value) => {
    state.logoMode = value
  },
  SET_SECURITY_WATERMARK_ENABLED: (state, value) => {
    state.publicSettings['SECURITY_WATERMARK_ENABLED'] = value
  },
  SET_VENDOR: (state, value) => {
    state.vendor = value
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  applyProjectTheme() {
    applyProjectTheme()
  },
  getPublicSettings({ commit, state }, isOpen) {
    return new Promise((resolve, reject) => {
      getPublicSettings(isOpen)
        .then(response => {
          const data = response || {}
          updateTitleIcon()
          const interfaceSettings = syncInterfaceTheme(data?.INTERFACE)
          const logoMode = interfaceSettings?.logo_mode || 'combine'
          const vendor = interfaceSettings?.vendor || ''
          const nextSettings = {
            ...data,
            INTERFACE: interfaceSettings
          }
          commit('SET_LOGO_MODE', logoMode)
          commit('SET_VENDOR', vendor)
          commit('SET_PUBLIC_SETTINGS', nextSettings)
          resolve(response)
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            alert(
              '自 v3.6 版本开始，要求配置可信任域名或主机，否则无法正常使用, 查看: https://github.com/jumpserver/jumpserver/releases/tag/v3.6.0'
            )
          }
          reject(error)
        })
    })
  },
  updateAuthItemStatus({ commit }, payload) {
    const [key, value] = payload
    return new Promise((resolve, reject) => {
      const url = '/api/v1/settings/setting/?category=auth'
      const data = { [key]: value }
      request
        .patch(url, data)
        .then(res => {
          state.authMethods[key] = value
          resolve(res)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  getAuthMethods({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.authMethods && Object.keys(state.authMethods).length > 0) {
        resolve(state.authMethods)
      } else {
        const url = '/api/v1/settings/setting/?category=auth'
        request
          .get(url)
          .then(res => {
            state.authMethods = res
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
