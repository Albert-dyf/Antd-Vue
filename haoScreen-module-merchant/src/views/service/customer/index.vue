<template>
  <el-container class="service-customer-wrapper common-container">
    <el-main class="service-customer-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item v-if="false">
            <el-select v-model="searchForm.waiterId" :placeholder="$t('select.waiterPlaceholder')" clearable @visible-change="hanleWaiterSelectVisible">
              <el-option v-for="waiter in waiters" :key="waiter.id" :label="waiter.nickName || waiter.email" :value="waiter.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.useStatus" :placeholder="$t('select.useStatusPlaceholder')" clearable>
              <el-option v-for="status in useStatus" :key="status.value" :label="status.name" :value="status.value" />
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
            v-for="attr in Object.keys(tableItemAttr)"
            :key="'customerTableAttr' + attr"
            :label="$t('service.' + attr)"
            :prop="attr"
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span><span v-else-if="tableItemAttr[attr].type === 'money'">
                {{ parseMoney(scope.row[attr]) }}
              </span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <span v-if="scope.row.useStatus !== 0 && scope.row.useStatus !== 3">
                <el-button v-if="scope.row.useStatus === 2" type="text" @click="handleClickEnable(scope.row)">{{ $t('common.enable') }}</el-button>
                <el-button v-else-if="scope.row.useStatus === 1" type="text" @click="handleClickDisable(scope.row)">{{ $t('common.disable') }}</el-button>
                <!-- <el-button v-if="scope.row.useStatus === 1" type="text" @click="handleClickRecharge(scope.row)">{{ $t('service.recharge') }}</el-button> -->
                <el-button type="text" @click="handleClickBill(scope.row)">{{ $t('common.bill') }}</el-button>
                <el-button type="text" @click="handleClickRouting(scope.row)">{{ $t('common.offerDetail') }}</el-button>
                <!-- <el-popconfirm
                  :title="$t('popMessage.resetPwdTip')"
                  :confirm-button-text="$t('common.confirm')"
                  :cancel-button-text="$t('common.cancel')"
                  @onConfirm="handleConfirmResetPwd"
                >
                  <el-button slot="reference" class="delete-btn" type="text" @click="handleClickResetPwd(scope.row)">{{ $t('business.resetPwd') }}</el-button>
                </el-popconfirm> -->
              </span>
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

    <!-- recharge -->
    <el-dialog
      :visible.sync="rechargeDialogVisible"
      :title="$t('service.recharge')"
      width="30vw"
      custom-class="recharge-dialog"
    >
      <el-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item
          v-for="attr in Object.keys(rechargeForm)"
          :key="'recharge' + attr"
          :label="$t('service.' + attr)"
          :prop="attr"
        >
          <el-input
            v-model="rechargeForm[attr]"
            :disabled="attr === 'customerName'"
            :type="attr === 'feeDigest' ? 'textarea' : ''"
          />
        </el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="rechargeDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitRecharge">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <transition name="fade-transform" mode="out-in">
      <bill-panel v-if="showBillPanel" :customer="current" @backToTable="handleBack" />
    </transition>

    <transition name="fade-transform" mode="out-in">
      <routing v-if="routingVisible" :customer="current" @backToTable="handleBack" />
    </transition>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import BillPanel from '@/components/BillPanel'
import Routing from './components/routing.vue'
import { getCustomerListAll, recharge4Customer, enableCustomer, disableCustomer, resetPwd } from '@/api/service'
import { getOperatorList } from '@/api/commen-resource'
import { parseEnumValue, syncPages, parseMoney, reverseMoney } from '@/utils'

export default {
  components: {
    StarlinkDatePicker,
    BillPanel,
    Routing
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        email: {},
        nickName: {},
        waiterName: {},
        balance: {
          type: 'money'
        },
        useStatus: {
          type: 'enum',
          colorEnum: ['danger', 'success', 'warning', 'danger'],
          valueEnum: []
        },
        createTime: {},
        lastLoginTime: {}
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
        useStatus: '',
        waiterId: ''
      },
      isLoading: false,
      tableData: [],
      current: {},
      waitersPages: {
        pageNumber: 1,
        pageSize: 100
      },
      waiters: [],
      useStatus: [],

      // recharge
      rechargeDialogVisible: false,
      rechargeForm: {
        customerName: '',
        amount: '',
        feeDigest: ''
      },
      rechargeFormRules: {
        customerName: [
          { required: true, message: this.$t('service.customerName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        amount: [
          { required: true, message: this.$t('service.amount') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // bill panel
      showBillPanel: false,
      // routing
      routingVisible: false
    }
  },
  computed: {},
  watch: {
    rechargeDialogVisible(val) {
      if (!val) {
        this.current = {}
        this.$refs.rechargeFormRef.resetFields()
      }
    }
  },
  async created() {
    await this._getCustomerListAll()
    // await this._getOperatorList()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getCustomerListAll() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      await getCustomerListAll(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.useStatus.valueEnum = res.data.params.EnumUseStatus
          this.useStatus = parseEnumValue(res.data.params.EnumUseStatus)
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },
    async _getOperatorList() {
      const param = { ...this.waitersPages }
      await getOperatorList(param).then(res => {
        if (res.code === 200) {
          this.waiters = res.data.rows
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _recharge4Customer() {
      const data = { ...this.rechargeForm }
      delete data.customerName
      data.customerId = this.current.id
      data.amount = reverseMoney(this.rechargeForm.amount)
      await recharge4Customer(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.rechargeSuccess'))
          this.rechargeDialogVisible = false
          this._getCustomerListAll()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _enableCustomer() {
      await enableCustomer(this.current.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.enableSuccess'))
          this._getCustomerListAll()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _disableCustomer() {
      await disableCustomer(this.current.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.disableSuccess'))
          this._getCustomerListAll()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _resetPwd() {
      resetPwd(this.current.id).then(res => {
        if (res.code === 200) {
          this.$confirm(this.$t('popMessage.newPwdIs') + res.data.passwordNew, this.$t('popMessage.resetPwdSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getCustomerListAll()
    },
    handleClickRecharge(data) {
      this.current = data
      this.rechargeForm.customerName = this.current.nickName
      this.rechargeDialogVisible = true
    },
    handleClickEnable(data) {
      this.current = data
      this._enableCustomer()
    },
    handleClickDisable(data) {
      this.current = data
      this._disableCustomer()
    },
    handleClickResetPwd(data) {
      this.current = data
    },
    handleConfirmResetPwd() {
      this._resetPwd()
    },
    handleClickSubmitRecharge() {
      this.$refs.rechargeFormRef.validate(valid => {
        if (valid) {
          this._recharge4Customer()
        }
      })
    },
    handleClickBill(data) {
      this.current = data
      this.showBillPanel = true
    },
    handleChangePageSize() {
      this._getCustomerListAll()
    },
    hanldeChangeCurrentPage() {
      this._getCustomerListAll()
    },
    handleBack() {
      this.showBillPanel = false
      this.routingVisible = false
    },
    hanleWaiterSelectVisible(val) {
      if (val) {
        this._getOperatorList()
      }
    },
    handleClickRouting(data) {
      this.current = data
      this.routingVisible = true
    }
  }
}
</script>

<style lang='scss' scoped>
.service-customer-wrapper {
  position: relative;

  .recharge-dialog {
    .el-form {
      width: 25vw;
    }
  }
}
</style>
