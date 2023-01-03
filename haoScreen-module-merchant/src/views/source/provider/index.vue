<template>
  <el-container class="source-provider-wrapper common-container">
    <el-main class="source-provider-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')"></el-input></el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button>
          </el-form-item>
        </el-form>
      </el-row>

      <el-row class="table-tool-bar">
        <el-button type="primary" size="small" @click="handleClickAdd">{{ '+ ' + $t('common.add') }}</el-button>
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
            :label="$t('source.' + attr)"
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'money'">{{ parseMoney(scope.row[attr]) }}</span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickEdit(scope.row)">{{ $t('common.edit') }}</el-button>
              <el-button type="text" @click="handleClickModifySecret(scope.row)">{{ $t('source.modifyAppSecret') }}</el-button>
              <el-button type="text" @click="handleClickBill(scope.row)">{{ $t('common.bill') }}</el-button>
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
          :total.sync="pages.total"
          layout="sizes, prev, pager, next, jumper, ->, total"
          @size-change="handleChangePageSize"
          @current-change="hanldeChangeCurrentPage"
        ></el-pagination>
      </el-row>
    </el-main>

    <!-- add provider dialog -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('source.addProvider')"
      custom-class="add-provider-dialog"
      width="30vw"
    >
      <el-form
        ref="addProviderFormRef"
        :model="addProviderForm"
        :rules="addProviderFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item
          v-for="attr in Object.keys(addProviderForm)"
          :key="'addProvider' + attr"
          :prop="attr"
          :label="$t('source.' + attr)"
        >
          <template>
            <el-input v-model="addProviderForm[attr]"></el-input>
          </template>
        </el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- edit provider dialog -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="$t('source.editProvider')"
      custom-class="edit-provider-dialog"
      width="30vw"
    >
      <el-form
        ref="editProviderFormRef"
        :model="editProviderForm"
        :rules="editProviderFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item
          v-for="attr in Object.keys(editProviderForm)"
          :key="'editProvider' + attr"
          :prop="attr"
          :label="$t('source.' + attr)"
        >
          <el-input v-model="editProviderForm[attr]"></el-input>
        </el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="editDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitEdit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- app secret dialog -->
    <el-dialog
      :visible.sync="secretDialogVisible"
      :title="$t('source.modifyAppSecret')"
      custom-class="app-secret-dialog"
      width="30vw"
    >
      <el-form
        ref="secretFormRef"
        :model="secretForm"
        :rules="secretFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item
          v-for="attr in Object.keys(secretForm)"
          :key="'editProvider' + attr"
          :prop="attr"
          :label="$t('source.' + attr)"
        >
          <el-input v-model="secretForm[attr]"></el-input>
        </el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="secretDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitAppSecret">{{ $t('common.submit') }}</el-button>
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
import { getProviderList, addProvider, getProviderById, updateProvider, updateProviderAppSecret, deleteProvider } from '@/api/source'
import { parseMoney, reverseMoney, syncPages } from '@/utils'

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
        appId: {},
        balanceLocal: {
          type: 'money'
        },
        balanceRemote: {
          type: 'money'
        },
        balanceWarningThreshold: {
          type: 'money'
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
        searchKey: ''
      },
      isLoading: false,
      tableData: [],
      current: {},

      // add provider data
      addDialogVisible: false,
      addProviderForm: {
        providerName: '',
        providerCode: '',
        balanceWarningThreshold: '',
        appId: '',
        appSecret: ''
      },
      addProviderFormRules: {
        providerName: [
          { required: true, message: this.$t('source.providerName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        providerCode: [
          { required: true, message: this.$t('source.providerCode') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        balanceWarningThreshold: [
          { required: true, message: this.$t('source.balanceWarningThreshold') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // edit provider data
      editDialogVisible: false,
      editProviderForm: {
        providerName: '',
        balanceWarningThreshold: ''
      },
      editProviderFormRules: {
        providerName: [
          { required: true, message: this.$t('source.providerName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        providerCode: [
          { required: true, message: this.$t('source.providerCode') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        balanceWarningThreshold: [
          { required: true, message: this.$t('source.balanceWarningThreshold') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // app secret data
      secretDialogVisible: false,
      secretForm: {
        appId: '',
        appSecret: ''
      },
      secretFormRules: {
        appId: [
          { required: true, message: this.$t('source.appId') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        appSecret: [
          { required: true, message: this.$t('source.appSecret') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // bill panel
      showBillPanel: false
    }
  },
  computed: {},
  watch: {},
  created() {
    this._getProviderList()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getProviderList() {
      this.isLoading = true
      const param = { ...this.pages, ...this.searchForm }
      delete param.total
      await getProviderList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          syncPages(this.pages, res)
        }
      })
      this.isLoading = false
    },
    async _getProviderById() {
      await getProviderById(this.current.id).then(res => {
        if (res.code === 200) {
          Object.keys(this.editProviderForm).forEach(key => {
            if (key === 'balanceWarningThreshold') {
              this.editProviderForm[key] = parseMoney(res.data.object[key])
            } else {
              this.editProviderForm[key] = res.data.object[key]
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _addProvider() {
      const data = { ...this.addProviderForm }
      data.balanceWarningThreshold = reverseMoney(this.addProviderForm.balanceWarningThreshold)
      await addProvider(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addProviderSuccess'))
          this.addDialogVisible = false
          this._getProviderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _updateProvider() {
      const data = { ...this.editProviderForm }
      data.providerId = this.current.id
      data.balanceWarningThreshold = reverseMoney(this.editProviderForm.balanceWarningThreshold)
      updateProvider(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.updateProviderSuccess'))
          this.editDialogVisible = false
          this._getProviderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _updateProviderAppSecret() {
      const data = {
        ...this.secretForm,
        providerId: this.current.id
      }
      updateProviderAppSecret(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.updateAppSecretSuccess'))
          this.secretDialogVisible = false
          this._getProviderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _deleteProvider() {
      deleteProvider(this.current.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
          this._getProviderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getProviderList()
    },
    handleClickAdd() {
      this.addDialogVisible = true
    },
    async handleClickEdit(data) {
      this.current = data
      await this._getProviderById()
      this.editDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addProviderFormRef.validate(valid => {
        if (valid) {
          this._addProvider()
        }
      })
    },
    async handleClickSubmitEdit() {
      this.$refs.editProviderFormRef.validate(valid => {
        if (valid) {
          this._updateProvider()
        }
      })
    },
    handleClickModifySecret(data) {
      this.current = data
      this.secretDialogVisible = true
    },
    async handleClickSubmitAppSecret() {
      this.$refs.secretFormRef.validate(valid => {
        if (valid) {
          this._updateProviderAppSecret()
        }
      })
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleConfirmDelete() {
      this._deleteProvider()
    },
    handleClickBill(data) {
      this.current = data
      this.showBillPanel = true
    },
    handleChangePageSize() {
      this._getProviderList()
    },
    hanldeChangeCurrentPage() {
      this._getProviderList()
    },
    handleBack() {
      this.showBillPanel = false
    }
  }
}
</script>

<style lang='scss' scoped>
.source-provider-wrapper {
  position: relative;
  .add-provider-dialog, .edit-provider-dialog, .app-secret-dialog {
    .el-form {
      width: 25vw;
    }
  }
}
</style>
