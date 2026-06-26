<template>
  <div class="wrapper-content">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageContent'
}
</script>

<style scoped>
  .wrapper-content {
    padding: 12px 20px 20px;
  }

  .wrapper-content ::v-deep .el-alert {
    margin-bottom: 15px;
  }

  .page-alert ::v-deep .el-alert {
    margin-bottom: 20px;
  }
</style>
