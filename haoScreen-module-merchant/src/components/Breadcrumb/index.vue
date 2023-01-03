<template>
  <el-row v-show="current.meta.breadcrumb" class="app-breadcrumb-wrapper">
    <el-col :span="24">
      <el-breadcrumb class="app-breadcrumb" separator="/">
        <transition-group name="breadcrumb">
          <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
            <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ generateTitle(item.meta.title) }}</span>
            <a v-else @click.prevent="handleLink(item)">{{ generateTitle(item.meta.title) }}</a>
          </el-breadcrumb-item>
        </transition-group>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24">
      <h2 class="breadcrumb-current">{{ generateTitle(current.meta.title) }}</h2>
    </el-col>
  </el-row>
</template>

<script>
import { generateTitle } from '@/utils/i18n'
import pathToRegexp from 'path-to-regexp'

export default {
  name: 'BreadCrumb',
  data() {
    return {
      levelList: null
    }
  },
  computed: {
    current() {
      if (this.levelList.length > 0) {
        return this.levelList[this.levelList.length - 1]
      } else {
        return {
          meta: {
            breadcrumb: false
          }
        }
      }
    }
  },
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    generateTitle,
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]

      if (!this.isDashboard(first)) {
        matched = [{ path: '/dashboard', meta: { title: 'Dashboard' }}].concat(matched)
      }

      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb-wrapper {
  width: 100%;
  background: white;
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
  .breadcrumb-current {
    margin-left: 20px;
  }
}
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 20px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }

}
</style>
