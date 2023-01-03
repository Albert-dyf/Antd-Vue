<template>
  <el-container class="role-manage-wrapper common-container">
    <el-main class="role-manage-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" clearable :placeholder="$t('search.searchKeyPlaceholder')" /></el-form-item>
          <!-- <el-form-item>
            <el-select v-model="searchForm.roleStatus" clearable>
              <el-option v-for="(stateOption, i) in status" :key="'state' + i" :label="stateOption" :value="i" />
            </el-select>
          </el-form-item> -->
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
            v-for="(attr, i) in tableItemAttr"
            :key="('roleAttr' + i)"
            :prop="attr.code"
            :label="$t('super.' + attr.i18n)"
          >
            <template slot-scope="scope">
              <span v-if="attr.type === 'switch'">
                <el-switch v-model="scope.row.roleStatus" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)"></el-switch>
              </span>
              <span v-else>{{ scope.row[attr.code] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickEdit(scope.row)">{{ $t('common.edit') }}</el-button>
              <el-button type="text" @click="handleClickMenuConfig(scope.row)">{{ $t('common.authorized') }}</el-button>
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
        ></el-pagination>
      </el-row>
    </el-main>

    <!-- add role dialog -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('super.addRole')"
      width="30vw"
      custom-class="add-role-dialog"
    >
      <el-form
        ref="addRoleRef"
        :model="addRoleForm"
        :rules="addRoleFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item prop="roleName" :label="$t('super.roleName')"><el-input v-model="addRoleForm.roleName" /></el-form-item>
        <el-form-item prop="roleDescribe" :label="$t('super.roleDescribe')"><el-input v-model="addRoleForm.roleDescribe" /></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- edit role dialog -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="$t('super.editRole')"
      width="30vw"
      custom-class="edit-role-dialog"
    >
      <el-form
        :model="editRoleForm"
        label-width="100px"
        label-position="right"
      >
        <el-form-item prop="roleName" :label="$t('super.roleName')"><el-input v-model="editRoleForm.roleName" /></el-form-item>
        <el-form-item prop="roleDescribe" :label="$t('super.roleDescribe')"><el-input v-model="editRoleForm.roleDescribe" /></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="editDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitEdit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- menu config dialog -->
    <el-dialog
      :visible.sync="moduleConfigDialogVisible"
      :title="$t('common.authorized')"
      width="30vw"
      custom-class="module-config-dialog"
    >
      <div class="module-tree-wrapper">
        <el-tree
          :data="moduleTree"
          :props="moduleTreeProps"
          :default-checked-keys="moduleAuthorized"
          :default-expand-all="true"
          :expand-on-click-node="false"
          node-key="id"
        >
          <span slot-scope="{node, data}" class="module-tree-content">
            <span>{{ node.label }}</span>
            <span>
              <el-switch v-model="data.authorized" :active-value="1" :inactive-value="0" @change="handleChangeModuleAuthorized(data)"></el-switch>
            </span>
          </span>
        </el-tree>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import {
  getMerchantRoles,
  addMerchantRole,
  getMerchantRoleById,
  updateMerchantRole,
  deleteMerchantRole,
  getMerchantRoleModuleConfig,
  updateMerchantRoleModuleAuthorized
} from '@/api/super'
import { syncPages } from '@/utils'

export default {
  components: {
    StarlinkDatePicker
  },
  data() {
    return {
      // setup
      tableItemAttr: [
        {
          i18n: 'roleName',
          code: 'roleName'
        },
        {
          i18n: 'roleDescribe',
          code: 'roleDescribe'
        }
      ],

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
        roleStatus: ''
      },
      status: ['禁用', '启用'],
      tableData: [],
      current: {},
      isLoading: false,

      // add role data
      addDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDescribe: ''
      },
      addRoleFormRules: {
        roleName: [
          { required: true, message: this.$t('validator.roleNameRequired'), trigger: ['blur', 'change'] }
        ],
        roleDescribe: [
          { required: true, message: this.$t('validator.roleDescribeRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // edit role data
      editDialogVisible: false,
      editRoleForm: {
        id: '',
        roleName: '',
        roleDescribe: '',
        useStatus: null
      },

      // menu config data
      moduleConfigDialogVisible: false,
      moduleTree: [],
      moduleTreeProps: {
        children: 'children',
        label: 'moduleNameCn'
      }
    }
  },
  computed: {
    moduleAuthorized() {
      const data = this.formatCheckedNode(this.moduleTree)
      return data
    }
  },
  watch: {
    addDialogVisible(val) {
      if (!val) {
        this.$refs.addRoleRef.resetFields()
      }
    },
    editDialogVisible(val) {
      if (val) {
        this._getRoleInfoById()
      } else {
        this.current = {}
      }
    },
    moduleConfigDialogVisible(val) {
      if (!val) {
        this.current = {}
      }
    }
  },
  async created() {
    await this._getMerchantRoles()
  },
  mounted() {},
  methods: {
    // request
    _getMerchantRoles() {
      this.isLoading = true
      this.tableData = []
      const params = { ...this.pages, ...this.searchForm }
      delete params.total
      getMerchantRoles(params).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          syncPages(this.pages, res)
          this.isLoading = false
        } else {
          this.isLoading = false
        }
      })
    },
    _getRoleInfoById() {
      getMerchantRoleById(this.current.id).then(res => {
        if (res.code === 200) {
          this.editRoleForm = { ...res.data }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _getMenuConfigByRole() {
      await getMerchantRoleModuleConfig(this.current.id).then(res => {
        if (res.code === 200) {
          this.moduleTree = res.data
        }
      })
    },
    _addRole() {
      const data = { ...this.addRoleForm }
      addMerchantRole(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addRoleSuccess'))
          this.addDialogVisible = false
          this._getMerchantRoles()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _updateRole() {
      const data = { ...this.editRoleForm }
      delete data.useStatus
      updateMerchantRole(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.updateRoleSuccess'))
          this.editDialogVisible = false
          this._getMerchantRoles()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _updateRoleModuleAuthorized(moduleItem) {
      const data = {
        roleId: this.current.id,
        moduleId: moduleItem.id,
        authorized: moduleItem.authorized
      }
      updateMerchantRoleModuleAuthorized(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.authorizedSuccess'))
        } else {
          moduleItem.authorized = moduleItem.authorized === 0 ? 1 : 0
          this.$message.error(res.msg)
        }
      })
    },
    _deleteRole() {
      deleteMerchantRole(this.current.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
          this._getMerchantRoles()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getMerchantRoles()
    },
    handleClickAdd() {
      this.addDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addRoleRef.validate(valid => {
        if (valid) {
          this._addRole()
        }
      })
    },
    handleClickEdit(data) {
      this.current = data
      this.editDialogVisible = true
    },
    handleClickSubmitEdit() {
      this._updateRole()
    },
    async handleClickMenuConfig(data) {
      this.current = data
      await this._getMenuConfigByRole()
      this.moduleConfigDialogVisible = true
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleConfirmDelete() {
      this._deleteRole()
    },
    handleStatusChange(data) {
      this.current = data
    },
    handleChangeModuleAuthorized(data) {
      this._updateRoleModuleAuthorized(data)
    },

    // format
    formatCheckedNode(arr) {
      let newArr = []
      arr.forEach(item => {
        if (item.authorized === 1) {
          newArr.push(item.id)
        }

        if (item.children !== null) {
          const child = this.formatCheckedNode(item.children)
          newArr = [...newArr, ...child]
        }
      })
      return newArr
    }
  }
}
</script>

<style lang='scss' scoped>
.role-manage-wrapper {

  .add-role-dialog, .edit-role-dialog {
    .el-form {
      width: 25vw;
    }
  }

  .module-config-dialog {
    .module-tree-wrapper {
      height: 40vh;
      overflow: auto;

      .el-tree-node__content {
        width: 100%;
      }

      .module-tree-content {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}
</style>
