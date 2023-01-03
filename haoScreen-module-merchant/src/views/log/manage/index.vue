<template>
  <el-container class="merchant-operator-wrapper common-container">
    <el-main class="merchant-operator-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button>
          </el-form-item>
        </el-form>
      </el-row>

      <el-row>
        <el-table
          v-loading="isLoading"
          :data="tableData"
          stripe
          size="small"
        >
          <el-table-column
            v-for="attr in Object.keys(tableItemAttr)"
            :key="'manageLog' + attr"
            :prop="attr"
            :label="$t('log.' + (tableItemAttr[attr].i18n || attr ))"
            :width="tableItemAttr[attr].width || ''"
          >
            <template slot-scope="scope">
              <span v-if="attr === 'createTime'">{{ parseTime(new Date(scope.row[attr]).getTime(), '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
              <span v-else-if="attr === 'url'">
                <div>{{ scope.row.url }}</div>
                <div>{{ scope.row.params }}</div>
              </span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-row class="table-pagination">
        <el-pagination
          :current-page.sync="pages.pageNumber"
          :page-size.sync="pages.pageSize"
          :total="pages.total"
          layout="sizes, prev, pager, next, jumper, ->, total"
          @size-change="handleChangePageSize"
          @current-change="hanldeChangeCurrentPage"
        ></el-pagination>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getManageLog } from '@/api/log'
import { parseTime, syncPages } from '@/utils'

export default {
  components: {
    StarlinkDatePicker
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        createTime: {
          width: '200px'
        },
        operatorName: {
          width: '160px'
        },
        url: {
          i18n: 'urlParams'
        },
        // params: {
        //   width: '240px'
        // },
        clientIp: {
          width: '160px'
        },
        status: {
          width: '120px'
        },
        delay: {
          width: '120px'
        }
      },

      // page data
      pages: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      searchForm: {
        startTime: '',
        endTime: '',
        searchKey: ''
      },
      isLoading: false,
      tableData: [],
      current: {}
    }
  },
  computed: {},
  watch: {},
  async created() {
    await this._getManageLog()
  },
  mounted() {},
  methods: {
    // util
    parseTime,

    // request
    async _getManageLog() {
      this.isLoading = true
      const param = { ...this.pages, ...this.searchForm }
      delete param.total
      await getManageLog(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          syncPages(this.pages, res)
        }
      })
      this.isLoading = false
    },

    // handler
    handleClickSearch() {
      this._getManageLog()
    },
    handleChangePageSize() {
      this._getManageLog()
    },
    hanldeChangeCurrentPage() {
      this._getManageLog()
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
