function resolvePlain(vm) {
  if (vm.$options.name !== 'ElButton') {
    return false
  }

  const propsData = vm.$options.propsData || {}
  if (Object.prototype.hasOwnProperty.call(propsData, 'plain')) {
    return Boolean(vm.plain)
  }

  return true
}

function syncPlainClass(vm) {
  if (vm.$options.name !== 'ElButton' || !vm.$el || vm.$el.nodeType !== 1) {
    return
  }

  vm.$el.classList.toggle('is-plain', resolvePlain(vm))
}

/**
 * 全局为 el-button 默认启用 plain（显式传入 :plain 时以传入值为准）
 */
export default Vue => {
  Vue.mixin({
    mounted() {
      syncPlainClass(this)
    },
    updated() {
      syncPlainClass(this)
    }
  })
}
