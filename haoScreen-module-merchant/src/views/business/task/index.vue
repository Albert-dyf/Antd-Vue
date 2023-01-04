<template>
  <el-container class="business-task-wrapper common-container">
    <el-main class="business-task-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.screenType" :placeholder="$t('select.screenTypePlaceholder')" clearable>
              <el-option v-for="(screenType, i) in screenTypes" :key="'screenType' + i" :label="screenType.name" :value="screenType.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.taskStatus" :placeholder="$t('select.taskStatusPlaceholder')" clearable>
              <el-option v-for="(stateOption, i) in taskStatus" :key="'state' + i" :label="stateOption.name" :value="stateOption.value" />
            </el-select>
          </el-form-item>
          <el-form-item><el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button></el-form-item>
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
            v-for="(attr, i) in Object.keys(tableItemAttr)"
            :key="'taskAttr' + i"
            :prop="attr"
            :label="$t('business.' + (tableItemAttr[attr].i18n || attr))"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span>
              <span v-else-if="tableItemAttr[attr].type === 'money'">{{ parseMoney(scope.row[attr]) }}</span>
              <span v-else-if="attr === 'activatedCount'">
                <starlink-progress
                  :text-inside="true"
                  :show-text="true"
                  :stroke-width="26"
                  :percentage="(scope.row.activatedCount / scope.row.totalCount).toFixed(3) * 100 || 0"
                  :text="(scope.row.activatedCount + ' / ' + scope.row.totalCount)"
                >
                </starlink-progress>
              </span>
              <!-- <span v-else-if="attr === 'country'">{{ scope.row.countryNameZh + ' / ' + scope.row.countryNameEn }}</span> -->
              <span v-else>{{ scope.row[attr] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickRefresh(scope.row)">{{ $t('common.refreshTask') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-row class="table-pagination">
        <el-pagination
          :current-page.sync="pages.pageNumber"
          :page-size.sync="pages.pageSize"
          :total.sync="pages.total"
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
import StarlinkProgress from '@/components/StarlinkProgress'
import { getCustomerTask, refreshTaskStatus } from '@/api/business'
import { syncPages, parseEnumValue, parseMoney } from '@/utils'

export default {
  components: {
    StarlinkDatePicker,
    StarlinkProgress
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        taskName: {},
        countryCode: {},
        screenType: {
          type: 'enum',
          valueEnum: []
        },
        customerEmail: {},
        activatedCount: {
          i18n: 'activatedCountTotal'
        },
        // totalCount: {},
        orderSaleAmount: {
          type: 'money'
        },
        orderSalePrice: {
          type: 'money'
        },
        taskStatus: {
          type: 'enum',
          valueEnum: [],
          colorEnum: ['danger', 'info', '', '', 'success', 'danger']
        },
        createTime: {}
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
        searchKey: '',
        taskStatus: ''
      },
      taskStatus: [],
      isLoading: false,
      tableData: [],
      current: {},
      screenTypes: []
    }
  },
  computed: {},
  watch: {},
  created() {
    this._getCustomerTask()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getCustomerTask() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      await getCustomerTask(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.screenType.valueEnum = parseEnumValue(res.data.params.EnumScreenType)
          this.screenTypes = res.data.params.EnumScreenType
          this.tableItemAttr.taskStatus.valueEnum = parseEnumValue(res.data.params.EnumTaskStatus)
          this.taskStatus = res.data.params.EnumTaskStatus
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },
    _refreshTaskStatus() {
      refreshTaskStatus(this.current.taskId).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.refreshSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getCustomerTask()
    },
    handleClickOverview(data) {
      this.current = data
    },
    handleChangePageSize() {
      this._getRoutingList()
    },
    hanldeChangeCurrentPage() {
      this._getRoutingList()
    },
    handleClickRefresh(data) {
      this.current = data
      this._refreshTaskStatus()
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
