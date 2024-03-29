<template>
  <el-container class="service-provider-wrapper common-container">
    <el-main class="service-provider-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.useStatus" :placeholder="$t('select.useStatusPlaceholder')" clearable>
              <el-option v-for="status in useStatus" :key="status.value" :label="status.name" :value="status.value" />
            </el-select>
          </el-form-item>
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
            :key="'provider' + attr"
            :prop="attr"
            :label="$t('service.' + attr)"
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'money'">{{ $t('common.dollarChar') + ' ' + parseMoney(scope.row[attr]) }}</span>
              <span v-else-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span>
              <span v-else>{{ scope.row[attr] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickRefreshAmount(scope.row)">{{ $t('service.refreshAmount') }}</el-button>
              <el-button type="text" @click="handleClickRecharge(scope.row)">{{ $t('service.recharge') }}</el-button>
              <el-button type="text" @click="handleClickBill(scope.row)">{{ $t('common.bill') }}</el-button>
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
            :disabled="attr === 'providerName'"
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
      <bill-panel v-if="showBillPanel" :provider-id="current.id" @backToTable="handleBack" />
    </transition>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import BillPanel from '@/components/BillPanel'
import { getProviderAll, recharge4Provider, refreshBalance } from '@/api/service'
import { parseEnumValue, syncPages, parseMoney, reverseMoney } from '@/utils'

export default {
  components: {
    StarlinkDatePicker,
    BillPanel
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        providerName: {},
        providerCode: {},
        balanceLocal: {
          type: 'money'
        },
        balanceRemote: {
          type: 'money'
        },
        balanceWarningThreshold: {
          type: 'money'
        },
        useStatus: {
          type: 'enum',
          valueEnum: [],
          colorEnum: ['danger', 'success', 'warning', 'danger']
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
        useStatus: ''
      },
      isLoading: false,
      tableData: [],
      current: {},
      useStatus: [],

      // recharge
      rechargeDialogVisible: false,
      rechargeForm: {
        providerName: '',
        amount: '',
        feeDigest: ''
      },
      rechargeFormRules: {
        providerName: [
          { required: true, message: this.$t('service.providerName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        amount: [
          { required: true, message: this.$t('service.amount') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // bill panel
      showBillPanel: false
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
    await this._getProviderAll()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getProviderAll() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      await getProviderAll(param).then(res => {
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
    async _recharge4Provider() {
      const data = { ...this.rechargeForm }
      delete data.providerName
      data.providerId = this.current.id
      data.amount = reverseMoney(this.rechargeForm.amount)
      await recharge4Provider(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.rechargeSuccess'))
          this.rechargeDialogVisible = false
          this._getProviderAll()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _refreshBalance() {
      await refreshBalance(this.current.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.refreshSuccess'))
          this.rechargeDialogVisible = false
          this._getProviderAll()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getProviderAll()
    },
    handleClickRecharge(data) {
      this.current = data
      this.rechargeForm.providerName = this.current.providerName
      this.rechargeDialogVisible = true
    },
    handleClickSubmitRecharge() {
      this.$refs.rechargeFormRef.validate(valid => {
        if (valid) {
          this._recharge4Provider()
        }
      })
    },
    handleClickRefreshAmount(data) {
      this.current = data
      this._refreshBalance()
    },
    handleClickBill(data) {
      this.current = data
      this.showBillPanel = true
    },
    handleChangePageSize() {
      this._getProviderAll()
    },
    hanldeChangeCurrentPage() {
      this._getProviderAll()
    },
    handleBack() {
      this.showBillPanel = false
    }
  }
}
</script>

<style lang='scss' scoped>
.service-provider-wrapper {
  position: relative;

  .recharge-dialog {
    .el-form {
      width: 25vw;
    }
  }
}
</style>
