<template>
  <el-container class="operator-manage-wrapper common-container">
    <el-main class="operator-manage-content common-body">
      <el-row class="operator-manage search-form">
        <el-form :inline="true" size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" clearable :placeholder="$t('search.searchKeyPlaceholder')" @keyup.enter.native="handleClickSearch" /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.useStatus" clearable :placeholder="$t('select.useStatusPlaceholder')">
              <el-option v-for="(stateOption, i) in status" :key="'state' + i" :label="stateOption.name" :value="stateOption.value" />
            </el-select>
          </el-form-item>
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
          size="small"
          stripe
        >
          <el-table-column
            v-for="attr in Object.keys(tableItemAttr)"
            :key="('userAttr' + attr)"
            :prop="attr"
            :label="$t('super.' + tableItemAttr[attr].i18n)"
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'enum'">
                <el-switch
                  v-model="scope.row[attr]"
                  :active-value="1"
                  :inactive-value="2"
                  @change="handleStatusChange(scope.row)"
                ></el-switch>
              </span>
              <span v-else>{{ scope.row[attr] === null ? '-' : scope.row[attr] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <!-- <el-button type="text" @click="handleClickEdit(scope.row)">{{ $t('common.edit') }}</el-button> -->
              <el-button type="text" @click="handleClickRoleConfig(scope.row)">{{ $t('common.authorized') }}</el-button>
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

    <!-- add user dialog -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('super.addUser')"
      width="30vw"
      custom-class="add-user-dialog"
    >
      <el-form
        ref="addUserRef"
        :model="addUserForm"
        :rules="addUserFormRules"
        size="small"
        label-position="right"
        label-width="100px"
      >
        <el-form-item :label="$t('super.email')" prop="email"><el-input v-model="addUserForm.email" @keyup.enter.native="handleClickSubmitAdd" /></el-form-item>
        <el-form-item :label="$t('super.password')" prop="password"><el-input v-model="addUserForm.password" @keyup.enter.native="handleClickSubmitAdd" /></el-form-item>
        <el-form-item :label="$t('super.nickname')" prop="nickName"><el-input v-model="addUserForm.nickName" @keyup.enter.native="handleClickSubmitAdd" /></el-form-item>
      </el-form>
      <el-footer slot="footer" align="right">
        <el-button type="" @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitAdd">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- edit user dialog -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="$t('super.editUser')"
      width="30vw"
      custom-class="edit-user-dialog"
    >
      <el-form
        :model="editUserForm"
        :rules="editUserFormRules"
        size="small"
        label-position="right"
        label-width="100px"
      >
        <el-form-item :label="$t('super.username')" prop="userName"><el-input v-model="editUserForm.userName" @keyup.enter.native="handleClickSubmitEdit" /></el-form-item>
        <el-form-item :label="$t('super.nickname')" prop="nickname"><el-input v-model="editUserForm.nickname" @keyup.enter.native="handleClickSubmitEdit" /></el-form-item>
        <el-form-item :label="$t('super.remark')" prop="remark"><el-input v-model="editUserForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <el-footer slot="footer" align="right">
        <el-button type="" @click="editDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitEdit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- user role dialog -->
    <el-dialog
      :visible.sync="roleDialogVisible"
      :title="$t('common.authorized')"
      width="35vw"
      custom-class="role-config-dialog"
    >
      <el-table
        :data="roleData"
        :show-header="false"
        height="30vh"
      >
        <el-table-column prop="roleName"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.authorized" :active-value="1" :inactive-value="0" @change="handleChangeRoleAuthorized(scope.row)"></el-switch>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getOperators, addOperator, deleteOperator, updateOperator, getOperatorRolesById, updateOperatorRoleAuthorized } from '@/api/super'
import { getEncryptorPublicKey } from '@/api/commen-resource'
import JSEncrypt from 'jsencrypt'
import { syncPages } from '@/utils'
import { isEmail, isPwd } from '@/utils/regex'

export default {
  components: {
    StarlinkDatePicker
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
        email: {
          i18n: 'email'
        },
        nickName: {
          i18n: 'nickname'
        },
        useStatus: {
          i18n: 'useStatus',
          type: 'enum',
          valueEnum: []
        },
        createTime: {
          i18n: 'createTime'
        },
        lastLoginTime: {
          i18n: 'lastLoginTime'
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
        searchKey: '',
        useStatus: null
      },
      status: [],
      tableData: [],
      current: {},
      isLoading: false,

      // new user data
      addDialogVisible: false,
      addUserForm: {
        email: '',
        password: '',
        nickName: '',
        privateKeyId: ''
      },
      addUserFormRules: {
        email: [
          { required: true, message: this.$t('validator.emailRequired'), trigger: ['blur', 'change'] },
          { validator: validateEmail, trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: this.$t('validator.pwdRequired'), trigger: ['blur', 'change'] },
          { validator: validatePwd, trigger: ['blur', 'change'] }
        ],
        nickName: [
          { required: true, message: this.$t('validator.nicknameRequired'), trigger: ['blur', 'change'] }
        ]
      },
      privateKeyId: '',
      publicKey: '',

      // edit user data
      editDialogVisible: false,
      editUserForm: {
        userName: '',
        nickname: '',
        remark: ''
      },
      editUserFormRules: {},

      // role config data
      roleDialogVisible: false,
      roleData: []
    }
  },
  computed: {},
  watch: {
    addDialogVisible(val) {
      if (val) {
        this._getPublicKey()
      } else {
        this.$refs.addUserRef.resetFields()
      }
    },
    editDialogVisible(val) {
      if (val) {
        this._getCurrentUserInfo()
      } else {
        this.current = {}
      }
    },
    roleDialogVisible(val) {
      if (!val) {
        this.current = {}
      }
    }
  },
  async created() {
    await this._getOperators()
  },
  mounted() {},
  methods: {
    // request
    _getPublicKey() {
      getEncryptorPublicKey().then(res => {
        this.privateKeyId = res.data.privateKeyId
        this.publicKey = res.data.publicKey
      })
    },
    async _getOperators() {
      this.isLoading = true
      this.tableData = []
      const params = { ...this.pages, ...this.searchForm }
      delete params.total
      await getOperators(params).then(res => {
        this.tableData = res.data.rows
        this.status = res.data.params.EnumUseStatus
        this.status.pop(3)
        this.tableItemAttr.useStatus.valueEnum = this.status
        syncPages(this.pages, res)
        this.isLoading = false
      })
    },
    _getCurrentUserInfo() {
      // todo complete interface data
      this.editUserForm = this.current
    },
    async _getOperatorRoles() {
      await getOperatorRolesById(this.current.operatorId).then(res => {
        if (res.code === 200) {
          this.roleData = res.data
        }
      })
    },
    _addUser() {
      this.$refs.addUserRef.validate(async valid => {
        if (valid) {
          const encryptor = new JSEncrypt()
          encryptor.setPublicKey(this.publicKey)
          this.addUserForm.privateKeyId = this.privateKeyId
          const data = { ...this.addUserForm }
          data.password = encryptor.encrypt(this.addUserForm.password).toString()
          await addOperator(data).then(res => {
            if (res.code === 200) {
              this.$message.success(this.$t('popMessage.addUserSuccess'))
              this.addDialogVisible = false
              this._getOperators()
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    _deleteUser() {
      deleteOperator(this.current.operatorId).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
          this._getOperators()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _changeUserStatus() {
      updateOperator(this.current.operatorId, this.current.useStatus).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.statusChangeSuccess'))
        } else {
          this.$message.error(res.msg)
          this.current.status = this.current.status === 1 ? 2 : 1
        }
        // this.getOperators()
      })
    },
    _updateOperatorRole(roleItem) {
      const data = {
        operatorId: this.current.operatorId,
        roleId: roleItem.id,
        authorized: roleItem.authorized
      }
      updateOperatorRoleAuthorized(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.authorizedSuccess'))
        } else {
          roleItem.authorized = roleItem.authorized === 0 ? 1 : 0
          this.$message.error(res.msg)
        }
      })
    },

    // click handler
    handleClickSearch() {
      this._getOperators()
    },
    handleClickAdd() {
      this.addDialogVisible = true
    },
    handleClickEdit(data) {
      this.current = data
      this.editDialogVisible = true
    },
    async handleClickRoleConfig(data) {
      this.current = data
      await this._getOperatorRoles()
      this.roleDialogVisible = true
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleClickSubmitAdd() {
      this._addUser()
    },
    handleClickSubmitEdit() {
      this.editDialogVisible = false
    },
    handleConfirmDelete() {
      this._deleteUser()
    },
    handleStatusChange(data) {
      this.current = data
      this._changeUserStatus()
    },
    handleChangePageSize() {
      this._getOperators()
    },
    hanldeChangeCurrentPage() {
      this._getOperators()
    },
    handleChangeRoleAuthorized(data) {
      this._updateOperatorRole(data)
    }
  }
}
</script>

<style lang='scss' scoped>
.operator-manage-wrapper {

  .add-user-dialog, .edit-user-dialog {
    .el-form {
      width: 25vw;
    }
  }
}
</style>
