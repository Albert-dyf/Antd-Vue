<template>
  <el-container class="service-task-wrapper common-container">
    <el-main class="service-task-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.customerId" :placeholder="$t('select.customerPlaceholder')" clearable>
              <el-option v-for="customer in customerAll" :key="customer.customerId" :label="customer.nickName" :value="customer.id" />
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
            :label="$t('service.' + (tableItemAttr[attr].i18n || attr))"
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
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickAllowance(scope.row)">{{ $t('service.allowance') }}</el-button>
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

    <!-- allowance -->
    <el-dialog
      :visible.sync="allowanceDialogVisible"
      :title="$t('service.allowance')"
      width="30vw"
      custom-class="allowance-dialog"
    >
      <el-form
        ref="allowanceFormRef"
        :model="allowanceForm"
        :rules="allowanceFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item
          v-for="attr in Object.keys(allowanceForm)"
          :key="'allowance' + attr"
          :label="$t('service.' + attr)"
          :prop="attr"
        >
          <el-input
            v-model="allowanceForm[attr]"
            :disabled="attr === 'taskName'"
            :type="attr === 'feeDigest' ? 'textarea' : ''"
          />
        </el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="allowanceDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitAllowance">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import StarlinkProgress from '@/components/StarlinkProgress'
import { getTaskList, getCustomerListAll, allowance } from '@/api/service'
import { syncPages, parseEnumValue, parseMoney, reverseMoney } from '@/utils'

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
      isLoading: false,
      tableData: [],
      current: {},
      taskStatus: [],
      screenTypes: [],
      customerAll: [],

      // allowance data
      allowanceDialogVisible: false,
      allowanceForm: {
        taskName: '',
        amount: '',
        feeDigest: ''
      },
      allowanceFormRules: {
        taskName: [
          { required: true, message: this.$t('service.taskName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        amount: [
          { required: true, message: this.$t('service.amount') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  computed: {},
  watch: {
    allowanceDialogVisible(val) {
      if (!val) {
        this.$refs.allowanceFormRef.resetFields()
        this.current = {}
      }
    }
  },
  async created() {
    await this._getCustomerListAll()
    await this._getTaskList()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getCustomerListAll() {
      const param = {
        pageNumber: 1,
        pageSize: 100
      }
      await getCustomerListAll(param).then(res => {
        if (res.code === 200) {
          this.customerAll = res.data.rows
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _getTaskList() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      await getTaskList(param).then(res => {
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
    async _allowance() {
      const data = {
        taskId: this.current.id,
        amount: reverseMoney(this.allowanceForm.amount),
        feeDigest: this.allowanceForm.feeDigest
      }
      await allowance(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.allowanceSuccess'))
          this.allowanceDialogVisible = false
          this._getTaskList()
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getTaskList()
    },
    handleClickAllowance(data) {
      this.current = data
      this.allowanceForm.taskName = data.taskName
      this.allowanceDialogVisible = true
    },
    handleClickSubmitAllowance() {
      this.$refs.allowanceFormRef.validate(valid => {
        if (valid) {
          this._allowance()
        }
      })
    },
    handleChangePageSize() {
      this._getTaskList()
    },
    hanldeChangeCurrentPage() {
      this._getTaskList()
    }
  }
}
</script>

<style lang='scss' scoped>
.service-task-wrapper {

  .allowance-dialog {
    .el-form {
      width: 25vw;
    }
  }
}
</style>
