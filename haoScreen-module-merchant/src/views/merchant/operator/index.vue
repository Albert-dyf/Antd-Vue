<template>
  <el-container class="merchant-operator-wrapper common-container">
    <el-main class="merchant-operator-content common-body">
      <el-row>
        <el-form inline size="small" @submit.native.prevent>
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable @keyup.enter.native="handleClickSearch" /></el-form-item>
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
            :key="'operator' + attr"
            :prop="attr"
            :label="$t('merchant.' + (tableItemAttr[attr].i18n || attr ))"
          >
            <template slot-scope="scope">
              <el-switch
                v-if="tableItemAttr[attr].type === 'switch'"
                v-model="scope.row[attr]"
                :active-value="1"
                :inactive-value="0"
                :disabled="!scope.row.operatorId"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
              <span v-else-if="tableItemAttr[attr].type === 'money'">{{ $t('common.dollarChar') + ' ' + parseMoney(scope.row[attr]) }}</span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickSetAccount(scope.row)">{{ $t('common.setAccount') }}</el-button>
              <el-popconfirm
                :title="$t('popMessage.deleteTip')"
                :confirm-button-text="$t('common.confirm')"
                :cancel-button-text="$t('common.cancel')"
                @onConfirm="handleConfirmDelete"
              >
                <el-button slot="reference" class="delete-btn" type="text" @click="handleClickDelete(scope.row)">{{ $t('common.deleteAccount') }}</el-button>
              </el-popconfirm>
              <!-- <el-popconfirm
                :title="$t('popMessage.resetPwdTip')"
                :confirm-button-text="$t('common.confirm')"
                :cancel-button-text="$t('common.cancel')"
                @onConfirm="handleConfirmResetPwd"
              >
                <el-button slot="reference" class="delete-btn" type="text" @click="handleClickResetPwd(scope.row)">{{ $t('business.resetPwd') }}</el-button>
              </el-popconfirm> -->
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

    <!-- add -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('merchant.addOperator')"
      width="30vw"
      custom-class="add-operator-dialog"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item :label="$t('merchant.merchantName')" prop="merchantName"><el-input v-model="addForm.merchantName" disabled /></el-form-item>
        <el-form-item :label="$t('merchant.email')" prop="email"><el-input v-model="addForm.email" @keyup.enter.native="handleClickSubmit" /></el-form-item>
        <el-form-item :label="$t('merchant.nickName')" prop="nickName"><el-input v-model="addForm.nickName" @keyup.enter.native="handleClickSubmit" /></el-form-item>
        <el-form-item :label="$t('merchant.password')" prop="password"><el-input v-model="addForm.password" @keyup.enter.native="handleClickSubmit" /></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>
  </el-container>
</template>

<script>
import { getEncryptorPublicKey } from '@/api/commen-resource'
import { getOperators, addOperator, updateOperatorStatus, deleteOperator } from '@/api/merchant'
import { syncPages } from '@/utils'
import { isEmail, isPwd } from '@/utils/regex'
import JSEncrypt from 'jsencrypt'

export default {
  data() {
    const validateEmail = (rules, value, callback) => {
      if (!isEmail(value)) {
        return callback(this.$t('validator.isNotEmail'))
      }

      return callback()
    }

    const validatePwd = (rules, value, callback) => {
      if (!isPwd(value)) {
        return callback(this.$t('validator.isNotPwd'))
      }

      return callback()
    }
    return {
      // setup
      tableItemAttr: {
        merchantName: {},
        email: {},
        useStatus: {
          i18n: 'stateSwitch',
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
        searchKey: ''
      },
      isLoading: false,
      tableData: [],
      current: {},

      // add form data
      addDialogVisible: false,
      addForm: {
        merchantId: '',
        merchantName: '',
        email: '',
        nickName: '',
        password: '',
        privateKeyId: ''
      },
      addFormRules: {
        email: [
          { required: true, message: this.$t('merchant.email') + this.$t('validator.isRequired'), trigger: ['blur'] },
          { validator: validateEmail }
        ],
        nickName: [
          { required: true, message: this.$t('merchant.nickName') + this.$t('validator.isRequired'), trigger: ['blur'] }
        ],
        password: [
          { required: true, message: this.$t('merchant.password') + this.$t('validator.isRequired'), trigger: ['blur'] },
          { validator: validatePwd }
        ]
      },
      publicKey: ''
    }
  },
  computed: {},
  watch: {
    addDialogVisible(val) {
      if (val) {
        this._getPublickKey()
      } else {
        this.$refs.addFormRef.resetFields()
        this.current = {}
      }
    },
    current(val) {
      if (val) {
        this.addForm.merchantId = val.merchantId
        this.addForm.merchantName = val.merchantName
      } else {
        this.addForm.merchantId = null
        this.addForm.merchantName = null
      }
    }
  },
  created() {
    this._getOperators()
  },
  mounted() {},
  methods: {
    // request
    async _getOperators() {
      this.isLoading = true
      const param = { ...this.pages, ...this.searchForm }
      delete param.total
      await getOperators(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          syncPages(this.pages, res)
        }
      })
      this.isLoading = false
    },
    async _getPublickKey() {
      await getEncryptorPublicKey().then(res => {
        if (res.code === 200) {
          this.addForm.privateKeyId = res.data.privateKeyId
          this.publicKey = res.data.publicKey
        }
      })
    },
    async _addOperator() {
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(this.publicKey)
      const data = JSON.parse(JSON.stringify(this.addForm))
      delete data.merchantName
      data.password = encryptor.encrypt(this.addForm.password).toString()
      await addOperator(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addOperatorSuccess'))
          this.addDialogVisible = false
          this._getOperators()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _updateOperatorStatus() {
      await updateOperatorStatus(this.current.operatorId, this.current.useStatus).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.statusChangeSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
      this._getOperators()
    },
    async _deleteOperator() {
      await deleteOperator(this.current.operatorId).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
      this._getOperators()
    },

    // handler
    handleClickSearch() {
      this._getOperators()
    },
    handleClickSetAccount(data) {
      this.current = data
      this.addForm.merchantId = this.current.merchantId
      this.addForm.merchantName = this.current.merchantName
      this.addDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          this._addOperator()
        }
      })
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleConfirmDelete() {
      this._deleteOperator()
    },
    handleStatusChange(data) {
      this.current = data
      this._updateOperatorStatus()
    },
    handleChangePageSize() {
      this._getOperators()
    },
    hanldeChangeCurrentPage() {
      this._getOperators()
    }
  }
}
</script>

<style lang='scss' scoped>
.merchant-operator-wrapper {
  position: relative;

  .add-operator-dialog {
    .el-form {
      width: 25vw;

      .el-select {
        width: 100%;
      }
    }
  }
}
</style>
