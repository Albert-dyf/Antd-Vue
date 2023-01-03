<template>
  <el-container class="business-task-wrapper common-container">
    <el-main class="business-task-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.customerId" :placeholder="$t('select.customerPlaceholder')" clearable>
              <el-option v-for="customer in customers" :key="customer.customerId" :label="customer.nickName" :value="customer.customerId" />
            </el-select>
          </el-form-item>
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
                  :percentage="(scope.row.activatedCount / scope.row.finishedCount).toFixed(3) * 100 || 0"
                  :text="(scope.row.activatedCount + ' / ' + scope.row.finishedCount)"
                >
                </starlink-progress>
              </span>
              <span v-else-if="attr === 'country'">{{ scope.row.countryNameZh + ' / ' + scope.row.countryNameEn }}</span>
              <span v-else>{{ scope.row[attr] }}</span>
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
import { getCustomerTask, getCustomerList } from '@/api/business'
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
        country: {},
        screenType: {
          type: 'enum',
          valueEnum: []
        },
        customerName: {},
        activatedCount: {
          i18n: 'activatedCountTotal'
        },
        // totalCount: {},
        orderCostAmount: {
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
        taskStatus: '',
        customerId: ''
      },
      taskStatus: [],
      isLoading: false,
      tableData: [],
      customers: [],
      current: {},
      screenTypes: []
    }
  },
  computed: {},
  watch: {},
  async created() {
    await this._getCustomerTask()
    await this._getCustomerList()
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
    async _getCustomerList() {
      const param = {
        pageNumber: 1,
        pageSize: 100
      }
      await getCustomerList(param).then(res => {
        if (res.code === 200) {
          this.customers = res.data.rows
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
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
