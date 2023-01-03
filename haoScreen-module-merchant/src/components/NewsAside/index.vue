<template>
  <el-aside class="news-aside" :class="hasScroll ? 'fixed-aside' : ''" :width="asideWidth">
    <div v-show="asideVisible" key="visible" class="visible-aside" @click="hiddeNewsAside">
      <div class="news-tree-title">
        <span>{{ $t('news.asideTitle') }}</span>
        <i class="right-control el-icon-d-arrow-left"></i>
      </div>
      <el-tree
        v-loading="isLoading"
        :hightlight-current="true"
        :data="treeData"
        :props="defaultProps"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
      </el-tree>
    </div>
    <div v-show="!asideVisible" key="hidden" class="hidden-aside" @click="showNewsAside">
      <i class="expend-control el-icon-d-arrow-right"></i>
      <span>{{ $t('news.asideTitle') }}</span>
    </div>
  </el-aside>
</template>

<script>
import { getNewsTree } from '@/api/news/index'

export default {
  name: 'NewsAside',
  data() {
    return {
      treeData: [
        {
          id: '',
          label: '新闻总览',
          children: []
        }
      ],
      defaultProps: {
        id: 'id',
        children: 'children',
        label: 'label'
      },
      asideVisible: true,
      asideWidth: '200px',
      hasScroll: false,
      isLoading: false
    }
  },
  computed: {},
  watch: {
    hasScroll() {
      this.$emit('hasScroll', this.hasScroll)
    },
    asideVisible() {
      this.$emit('asideVisible', this.asideVisible)
    }
  },
  created() {
    this.initTree()
  },
  mounted() {
    window.addEventListener('scroll', this.scrollListener)
  },
  destroy() {
    window.removeEventListener('scroll', this.scrollListener)
  },
  methods: {
    handleNodeClick(node) {
      console.log(node)
      this.$emit('nodeClick', node)
    },
    hiddeNewsAside() {
      this.asideVisible = false
      this.asideWidth = '40px'
    },
    showNewsAside() {
      this.asideVisible = true
      this.asideWidth = '200px'
    },
    scrollListener() {
      const scrollHeight = document.body.scrollHeight
      const clientHeight = document.body.clientHeight
      this.hasScroll = scrollHeight > clientHeight
    },
    async initTree() {
      this.isLoading = true
      await getNewsTree().then(res => {
        this.treeData[0].children = this.formatNewsTree(res)
      })

      // console.log(this.treeData)

      this.isLoading = false
    },
    formatNewsTree(data) {
      const map = new Map()
      data.forEach(nodeData => {
        const item = {
          id: nodeData.id,
          label: nodeData.name,
          children: []
        }

        if (nodeData.pId !== 'null') {
          const parent = map.get(nodeData.pId)
          // console.log(parent)

          if (parent.label) {
            parent.children.push(item)
          }
        } else {
          map.set(nodeData.id, item)
        }
      })

      // console.log(map.values())
      const newArr = []
      map.forEach(node => {
        newArr.push(node)
      })
      return newArr
    }
  }
}
</script>

<style lang='scss' scoped>
$theme: #409EFF;
$border-color-light: #dfe4ed;
$font-color-light: #909399;
$font-color-deep: #303133;
$shadow-set: 5px 5px 5px $border-color-light;

.news-aside {
  z-index: 9;
  position: relative;
  overflow: hidden;
  margin-right: 10px;
  transition: width .5s ease;
  background-color: white;
  box-shadow: $shadow-set;
  max-height: 65vh;

  .visible-aside {

    .news-tree-title {
      position: relative;
      padding: 5px;
      text-align: center;
      background-color: $theme;
      color: white;
      cursor: pointer;

      .right-control {
        float: right;
        margin-top: 2%
      }
    }
  }

  .hidden-aside {
    background-color: $theme;
    color: white;

    position: absolute;
    right: 0;
    top: 0;

    width: 40px;
    height: 100%;
    padding: 10px;

    writing-mode: vertical-lr;
    text-align: center;
    cursor: pointer;

    .expend-control {
      margin-bottom: 8px;
    }
  }
}

.fixed-aside {
  position: fixed;
  min-height: 65vh;
}
</style>
