<template>
  <el-container class="business-customer-wrapper common-container">
    <el-main class="business-customer-content common-body">
      <el-row>
        <el-form inline size="small" @submit.native.prevent>
          <starlink-date-picker v-if="false" :star-time="searchForm.startTime" :end-time="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable @keyup.enter.native="handleClickSearch" /></el-form-item>
          <el-form-item><el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button></el-form-item>
        </el-form>
      </el-row>

      <el-row class="table-tool-bar">
        <el-button type="primary" size="small" @click="handleClickAdd">+ {{ $t('common.add') }}</el-button>
        <el-button type="primary" size="small" @click="handleClickTransfer">{{ $t('business.transferCustomer') }}</el-button>
      </el-row>

      <el-row>
        <el-table
          v-loading="isLoading"
          :data="tableData"
          stripe
          size="small"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            v-for="(attr, i) in Object.keys(tableItemAttr)"
            :key="('customerAttr' + i)"
            :prop="attr"
            :label="$t('business.' + attr)"
          >
            <template slot-scope="scope">
              <el-switch
                v-if="tableItemAttr[attr].type === 'switch'"
                v-model="scope.row[attr]"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
              <span v-else-if="tableItemAttr[attr].type === 'money'">
                {{ $t('common.dollarChar') + ' ' + parseMoney(scope.row[attr]) }}
              </span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickBill(scope.row)">{{ $t('common.bill') }}</el-button>
              <el-button type="text" @click="handleClickRouting(scope.row)">{{ $t('common.offer') }}</el-button>
              <!-- <el-popconfirm
                :title="$t('popMessage.resetPwdTip')"
                :confirm-button-text="$t('common.confirm')"
                :cancel-button-text="$t('common.cancel')"
                @onConfirm="handleConfirmResetPwd"
              >
                <el-button slot="reference" class="delete-btn" type="text" @click="handleClickResetPwd(scope.row)">{{ $t('business.resetPwd') }}</el-button>
              </el-popconfirm> -->
              <el-popconfirm
                :title="$t('popMessage.deleteTip')"
                :confirm-button-text="$t('common.confirm')"
                :cancel-button-text="$t('common.cancel')"
                @onConfirm="handleConfirmDelete"
              >
                <el-button slot="reference" class="delete-btn" type="text" @click="handleClickDelete(scope.row)">{{ $t('common.delete') }}</el-button>
              </el-popconfirm>
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

    <!-- add customer dialog -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('business.addCustomer')"
      width="30vw"
      custom-class="add-customer-dialog"
    >
      <el-form
        ref="addCustomerFormRef"
        :model="addCustomerForm"
        :rules="addCustomerFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item :label="$t('business.email')" prop="email"><el-input v-model="addCustomerForm.email" @keyup.enter.native="handleClickSubmit"></el-input></el-form-item>
        <el-form-item :label="$t('business.customerPwd')" prop="password"><el-input v-model="addCustomerForm.password" @keyup.enter.native="handleClickSubmit"></el-input></el-form-item>
        <el-form-item :label="$t('business.nickName')" prop="nickName"><el-input v-model="addCustomerForm.nickName" @keyup.enter.native="handleClickSubmit"></el-input></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- transfer customer -->
    <el-dialog
      :visible.sync="transferDialogVisible"
      :title="$t('business.transferCustomer')"
      width="30vw"
      custom-class="transfer-customer-dialog"
      @close="handleCloseTransferDialog"
    >
      <el-form
        ref="transferCustomerFormRef"
        :model="transferCustomerForm"
        :rules="transferCustomerFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item :label="$t('business.selectedCustomer')">
          <section class="customer-tags-wrapper">
            <el-tag v-for="customer in selectedCustomer" :key="customer.id">{{ customer.nickName }}</el-tag>
          </section>
        </el-form-item>
        <el-form-item :label="$t('business.transferOperatorId')" prop="transferOperatorId">
          <el-select
            v-model="transferCustomerForm.transferOperatorId"
            filterable
            remote
            clearable
            :remote-method="handleSearchRemote"
            :loading="loadingOperator"
            :placeholder="$t('select.selectOrSearchKey')"
            @clear="handleSelectedClear"
          >
            <section v-infinite-scroll="loadOperator" style="overflow: auto; height: 150px;">
              <el-option v-for="operator in operators" :key="operator.operatorId" :label="operator.nickName" :value="operator.operatorId"></el-option>
            </section>
          </el-select>
        </el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="transferDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitTransfer">{{ $t('business.transferCustomer') }}</el-button>
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
import { getCustomerList, addCustomer, deleteCustomer, updateCustomerStatus, transferCustomer } from '@/api/business'
import { getEncryptorPublicKey } from '@/api/commen-resource'
import { getOperatorList } from '@/api/commen-resource'
import JSEncrypt from 'jsencrypt'
import { parseMoney, syncPages } from '@/utils'
import { isEmail, isPwd } from '@/utils/regex'

export default {
  components: {
    StarlinkDatePicker,
    BillPanel,
    Routing
  },
  data() {
    // validator
    const validateEmail = (rule, value, callback) => {
      if (!isEmail(value)) {
        return callback(this.$t('validator.isNotEmail'))
      }

      callback()
    }

    const validatePwd = (rule, value, callback) => {
      if (!isPwd(value)) {
        return callback(this.$t('validator.isNotPwd'))
      }

      callback()
    }
    return {
      // setup
      tableItemAttr: {
        email: {},
        nickName: {},
        balance: {
          type: 'money'
        },
        useStatus: {
          type: 'switch'
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
        // startTime: '',
        // endTime: '',
        searchKey: ''
      },
      isLoading: false,
      tableData: [],
      current: {},
      selectedCustomer: [],

      // add user data
      addDialogVisible: false,
      addCustomerForm: {
        email: '',
        nickName: '',
        password: '',
        privateKeyId: ''
      },
      addCustomerFormRules: {
        email: [
          { required: true, message: this.$t('business.email') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] },
          { validator: validateEmail, trigger: ['blur', 'change'] }
        ],
        nickName: [
          { required: true, message: this.$t('business.nickName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: this.$t('business.customerPwd') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] },
          { validator: validatePwd, trigger: ['blur', 'change'] }
        ]
      },
      privateKeyId: '',
      publicKey: '',

      // transfer customer
      transferDialogVisible: false,
      transferCustomerForm: {
        transferOperatorId: ''
      },
      transferCustomerFormRules: {
        transferOperatorId: [
          { required: true, message: this.$t('business.transferOperatorId') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },
      operators: [],
      operatorPages: {
        pageNumber: 0,
        pageSize: 10,
        totalPages: 1
      },
      operaotrSearchKey: '',
      loadingOperator: false,

      // bill panel
      showBillPanel: false,
      // routing
      routingVisible: false
    }
  },
  computed: {},
  watch: {
    addDialogVisible(val) {
      if (!val) {
        this.$refs.addCustomerFormRef.resetFields()
      }
    }
  },
  async created() {
    await this._getCustomerList()
  },
  mounted() {},
  methods: {
    // request
    parseMoney,
    async _getCustomerList() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      await getCustomerList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },
    _getPublicKey() {
      getEncryptorPublicKey().then(res => {
        this.privateKeyId = res.data.privateKeyId
        this.publicKey = res.data.publicKey
      })
    },
    async _getOperators(type) {
      this.loadingOperator = true
      await getOperatorList({ ...this.operatorPages, searchKey: this.operaotrSearchKey }).then(res => {
        if (res.code === 200) {
          if (type) {
            this.operators = [...this.operators, ...res.data.rows]
          } else {
            this.operators = res.data.rows
          }
          syncPages(this.operatorPages, res)
        }
      })
      this.loadingOperator = false
    },
    _addCustomer() {
      const data = {
        ...this.addCustomerForm
      }
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(this.publicKey)
      data.privateKeyId = this.privateKeyId
      data.password = encryptor.encrypt(this.addCustomerForm.password).toString()
      addCustomer(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addCustomerSuccess'))
          this.addDialogVisible = false
          this._getCustomerList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _deleteCustomer() {
      deleteCustomer(this.current.customerId).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
          this._getCustomerList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _updateCustomerStatus() {
      updateCustomerStatus(this.current.customerId, this.current.useStatus).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.statusChangeSuccess'))
          this._getCustomerList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _transferCustomer() {
      const data = {
        customerIds: this.selectedCustomer.map(item => { return item.customerId }).toString(),
        destWaiterId: this.transferCustomerForm.transferOperatorId
      }
      transferCustomer(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.transferCustomerSuccess'))
          this.transferDialogVisible = false
          this._getCustomerList()
        } else {
          this.$message.success(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getCustomerList()
    },
    async handleClickAdd() {
      await this._getPublicKey()
      this.addDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addCustomerFormRef.validate(valid => {
        if (valid) {
          this._addCustomer()
        }
      })
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleConfirmDelete() {
      this._deleteCustomer()
    },
    handleClickBill(data) {
      this.current = data
      this.showBillPanel = true
    },
    handleChangePageSize() {
      this._getCustomerList()
    },
    hanldeChangeCurrentPage() {
      this._getCustomerList()
    },
    handleBack() {
      this.showBillPanel = false
      this.routingVisible = false
    },
    handleStatusChange(data) {
      this.current = data
      this._updateCustomerStatus()
    },
    handleClickRouting(data) {
      this.current = data
      this.routingVisible = true
    },
    handleSelectionChange(selection) {
      this.selectedCustomer = selection
    },
    handleClickTransfer() {
      if (this.selectedCustomer.length > 0) {
        this.transferDialogVisible = true
        this.loadOperator()
      } else {
        this.$alert(this.$t('popMessage.emptySelectError'))
      }
    },
    handleClickSubmitTransfer() {
      this._transferCustomer()
    },
    handleSearchRemote(searchKey) {
      this.operaotrSearchKey = searchKey
      this.operatorPages.pageNumber = 1
      this._getOperators()
    },
    handleCloseTransferDialog() {
      this.$refs.transferCustomerFormRef.resetFields()
    },
    handleSelectedClear() {
      this.operaotrSearchKey = ''
      this._getOperators()
    },

    // common
    loadOperator() {
      if (this.operatorPages.pageNumber < this.operatorPages.totalPages) {
        this.operatorPages.pageNumber++
        this._getOperators('infinite')
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.business-customer-wrapper {
  position: relative;
  .add-customer-dialog, .edit-customer-dialog, .transfer-customer-dialog {
    .el-form {
      width: 25vw;
    }
  }

  .transfer-customer-dialog {
    .customer-tags-wrapper {
      max-height: 100px;
      overflow: auto;

      .el-tag {
        margin-right: 8px;
      }

      .el-select {
        width: 100%;
      }
    }
  }
}
</style>
