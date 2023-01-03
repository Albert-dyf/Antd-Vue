<template>
  <!-- <el-dropdown class="file-export" trigger="click" @command="handleExport"> -->
  <el-button :loading="exportloadLoading" class="file-export export-btn" size="small" round type="success" @click="exportDefault">
    <i class="el-icon-document"></i>
    <span>{{ $t('common.export') }}</span>
    <!-- <i class="el-icon-arrow-down el-icon--right"></i> -->
  </el-button>
  <!-- <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="excel">Excel</el-dropdown-item>
      <el-dropdown-item command="pdf">PDF</el-dropdown-item>
    </el-dropdown-menu> -->
  <!-- </el-dropdown> -->
</template>

<script>
export default {
  name: 'FileExport',
  props: {
    fileData: {
      type: Array,
      required: true
    },
    headers: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    filename: {
      type: String,
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      exportloadLoading: false,
      theaders: [],
      tattrs: []
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.formatHeaders()
  },
  methods: {
    formatHeaders() {
      this.theaders = []
      this.tattrs = []
      this.headers.forEach(head => {
        this.theaders.push(this.$t('tableSetting.' + head.name))
        this.tattrs.push(head.name)
      })
    },
    exportDefault() {
      this.exportExcel()
    },
    handleExport(command) {
      if (command === 'excel') this.exportExcel()
      else this.exportPdf()
    },
    async exportExcel() {
      await this.formatHeaders()
      console.log('export excel')
      if (this.fileData.length > 0) {
        this.exportloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = this.theaders
          const filterVal = this.tattrs
          const list = JSON.parse(JSON.stringify(this.fileData))
          const data = this.formatJson(filterVal, list)
          console.log(data)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: this.filename
          })
          this.exportloadLoading = false
        })
      } else {
        this.$message({
          message: this.$t('popMessage.emptySelectError'),
          type: 'warning'
        })
      }
    },
    exportPdf() {
      console.log('export pdf')
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
  }
}
</script>

<style lang='scss' scoped>
.file-export {
  margin-right: 10px;
}
</style>
