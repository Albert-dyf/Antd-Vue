<template>
  <el-container class="business-customer-wrapper common-container">
    <el-main class="business-customer-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :star-time="searchForm.startTime" :end-time="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item><el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button></el-form-item>
        </el-form>
      </el-row>

      <el-row class="table-tool-bar">
        <el-button type="primary" size="small" @click="handleClickAdd">+ {{ $t('common.add') }}</el-button>
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
                {{ parseMoney(scope.row[attr]) }}
              </span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickBill(scope.row)">{{ $t('common.bill') }}</el-button>
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
        <el-form-item :label="$t('business.email')" prop="email"><el-input v-model="addCustomerForm.email"></el-input></el-form-item>
        <el-form-item :label="$t('business.customerPwd')" prop="password"><el-input v-model="addCustomerForm.password"></el-input></el-form-item>
        <el-form-item :label="$t('business.nickName')" prop="nickName"><el-input v-model="addCustomerForm.nickName"></el-input></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <transition name="fade-transform" mode="out-in">
      <bill-panel v-if="showBillPanel" :customer="current" @backToTable="handleBack" />
    </transition>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import BillPanel from '@/components/BillPanel'
import { getCustomerList, addCustomer, deleteCustomer, updateCustomerStatus } from '@/api/business'
import { getEncryptorPublicKey } from '@/api/commen-resource'
import JSEncrypt from 'jsencrypt'
import { parseMoney, syncPages } from '@/utils'
import { isEmail, isPwd } from '@/utils/regex'

export default {
  components: {
    StarlinkDatePicker,
    BillPanel
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

      // bill panel
      showBillPanel: false
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
      this._getRoutingList()
    },
    hanldeChangeCurrentPage() {
      this._getRoutingList()
    },
    handleBack() {
      this.showBillPanel = false
    },
    handleStatusChange(data) {
      this.current = data
      this._updateCustomerStatus()
    }
  }
}
</script>

<style lang='scss' scoped>
.business-customer-wrapper {
  position: relative;
  .add-customer-dialog, .edit-customer-dialog {
    .el-form {
      width: 25vw;
    }
  }
}
</style>
