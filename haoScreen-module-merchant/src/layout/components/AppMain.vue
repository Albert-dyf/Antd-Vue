<template>
  <section :class="breadcrumb? 'has-breadcrumb' : ''" class="app-main">
    <breadcrumb class="breadcrumb-container" />
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'

export default {
  name: 'AppMain',
  components: { Breadcrumb },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    },
    breadcrumb() {
      return this.$route.meta.breadcrumb
    }
  }
}
</script>

<style lang="scss" scoped>
$background-color: #f0f2f5;

.app-main {
  /*50px = navbar  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: auto;
  background-color: $background-color;
}

.has-breadcrumb {
  padding-top: 112px;
}

.fixed-header+.app-main {
  min-height: 100vh;
  padding-top: 84px;
}

.breadcrumb-container {
  position: fixed;
  z-index: 5;
  top: 50px;
}
</style>

<style lang="scss">
$commonContainerPadding: 24px;
$contentBg: white;
$borderRadius: 4px;

// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}

// common styles
.common-container {
  padding: $commonContainerPadding;
  background: inherit;
}

.common-body {
  background: $contentBg;
  border-radius: $borderRadius;

  .delete-btn {
    margin-left: 10px;
  }

  .el-button--text {
    height: 32px;
    padding: 0;
  }
}

// .search-form {}

.table-tool-bar {
  margin-bottom: 18px;
}

.table-pagination {
  padding: 18px 0;

  .el-pagination {
    padding: 0;

    .el-input {
      margin: 0;
    }
  }
}
</style>
