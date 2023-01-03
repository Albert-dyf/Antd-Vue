<template>
  <el-container class="module-manage-wrapper common-container">
    <el-main class="module-manage-content common-body">
      <!-- 未提供搜索功能 -->
      <el-row v-if="false">
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" clearable placeholder="请输入菜单名搜索" /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.moduleType" clearable>
              <el-option v-for="(typeOption, i) in type" :key="'moduleType' + i" :label="typeOption.name" :value="typeOption.value" />
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
          row-key="id"
          :tree-props="{children: 'children'}"
          size="small"
          :default-expand-all="true"
        >
          <el-table-column
            v-for="(attr, i) in Object.keys(tableItemAttr)"
            :key="('moduleTableAttr' + i)"
            :prop="attr"
            :label="$t('super.' + tableItemAttr[attr].i18n)"
            :width="tableItemAttr[attr].width || ''"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'switch'">
                <el-switch v-model="scope.row.moduleShow" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)"></el-switch>
              </span>
              <span v-else-if="tableItemAttr[attr].type === 'enum'">
                <el-tag :type="scope.row[attr] === 1 ? 'success' : scope.row[attr] === 2 ? '' : 'info'">{{ tableItemAttr[attr].valueEnum[scope.row[attr]].name }}</el-tag>
              </span>
              <span v-else>{{ scope.row[attr] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')" width="120px">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickEdit(scope.row)">{{ $t('common.edit') }}</el-button>
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
    </el-main>

    <!-- add module dialog -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('super.addModule')"
      width="30vw"
      custom-class="add-module-dialog"
    >
      <el-form
        ref="addModuleFormRef"
        :model="addModuleForm"
        :rules="addModuleFormRules"
        label-width="100px"
        label-position="right"
      >
        <section v-for="key in Object.keys(addModuleForm)" :key="('addModuleAttr' + key)">
          <section v-if="selectAttr.includes(key)">
            <el-form-item v-if="key === 'moduleType'" :label="$t('super.' + key)" :prop="key">
              <el-select v-model="selectedModuleType">
                <el-option v-for="(typeOption, i) in type" :key="'moduleType' + i" :label="typeOption.name" :value="typeOption.value" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="(addModuleForm.moduleType > 1 && key === 'parentId')" :label="$t('super.' + key)" :prop="key">
              <el-select v-model="addModuleForm.parentId">
                <el-option v-for="parent in formatParentData" :key="('parentId' + parent.id)" :value="parent.id" :label="parent.moduleNameCn"></el-option>
              </el-select>
            </el-form-item>
          </section>
          <el-form-item v-else-if="key === 'moduleSort'" :label="$t('super.' + key)" :prop="key">
            <el-input v-model.number="addModuleForm[key]"></el-input>
          </el-form-item>
          <el-form-item v-else :label="$t('super.' + key)" :prop="key">
            <el-input v-model="addModuleForm[key]"></el-input>
          </el-form-item>
        </section>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- edit module dialog -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="$t('super.editModule')"
      width="30vw"
      custom-class="edit-module-dialog"
    >
      <el-form
        ref="editModuleFormRef"
        :model="editModuleForm"
        :rules="editModuleFormRules"
        label-width="100px"
        label-position="right"
      >
        <section v-for="key in Object.keys(editModuleForm)" :key="('addModuleAttr' + key)">
          <section v-if="selectAttr.includes(key)">
            <el-form-item v-if="key === 'moduleType'" :label="$t('super.' + key)" :prop="key">
              <el-select v-model="selectedModuleType">
                <el-option v-for="(typeOption, i) in type" :key="'moduleType' + i" :label="typeOption.name" :value="typeOption.value" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="(editModuleForm.moduleType > 1 && key === 'parentId')" :label="$t('super.' + key)" :prop="key">
              <el-select v-model="editModuleForm.parentId">
                <el-option v-for="parent in formatParentData" :key="('parentId' + parent.id)" :value="parent.id" :label="parent.moduleNameCn"></el-option>
              </el-select>
            </el-form-item>
          </section>
          <el-form-item v-else-if="key === 'moduleSort'" :label="$t('super.' + key)" :prop="key">
            <el-input v-model.number="editModuleForm[key]"></el-input>
          </el-form-item>
          <el-form-item v-else :label="$t('super.' + key)" :prop="key">
            <el-input v-model="editModuleForm[key]"></el-input>
          </el-form-item>
        </section>
      </el-form>
      <el-footer slot="footer">
        <el-button type="" @click="editDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitEdit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getMerchantModules, addMerchantModule, getMerchantModuleById, updateMerchantModule, deleteMerchantModule } from '@/api/super'

export default {
  components: {
    StarlinkDatePicker
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        moduleNameCn: {
          i18n: 'moduleNameCn',
          width: '300px'
        },
        moduleNameEn: {
          i18n: 'moduleNameEn',
          width: '180px'
        },
        moduleIcon: {
          i18n: 'moduleIcon',
          width: '100px'
        },
        moduleType: {
          i18n: 'moduleType',
          type: 'enum',
          valueEnum: [],
          width: '120px'
        },
        moduleSort: {
          i18n: 'moduleSort',
          width: '80px'
        },
        frondEndUrl: {
          i18n: 'frondEndUrl',
          width: '180px'
        },
        backEndUrl: {
          i18n: 'backEndUrl'
        }
      },

      // page data
      searchForm: {
        startTime: '',
        endTime: '',
        searchKey: '',
        moduleType: ''
      },
      type: [],
      tableData: [],
      current: {},
      isLoading: false,

      // add dialog
      addDialogVisible: false,
      addModuleForm: {
        moduleNameCn: '',
        moduleNameEn: '',
        moduleType: null,
        parentId: '',
        moduleSort: '',
        moduleIcon: '',
        frondEndUrl: '',
        backEndUrl: ''
      },
      addModuleFormRules: {
        moduleNameCn: [{ required: true, message: this.$t('validator.moduleNameCnRequired'), trigger: ['blur', 'change'] }],
        moduleNameEn: [{ required: true, message: this.$t('validator.moduleNameEnRequired'), trigger: ['blur', 'change'] }],
        moduleType: [{ required: true, message: this.$t('validator.moduleTypeRequired'), trigger: ['blur', 'change'] }],
        moduleSort: [
          { required: true, message: this.$t('validator.moduleSortRequired'), trigger: ['blur', 'change'] },
          { type: 'number', min: 0, message: this.$t('validator.moduleSortLessThan0'), trigger: 'change' }
        ],
        parentId: [{ required: true, message: this.$t('validator.parentIdRequired'), trigger: ['blur', 'change'] }]
      },
      selectAttr: ['moduleType', 'parentId'],

      // edit dialog
      editDialogVisible: false,
      editModuleForm: {
        moduleNameCn: '',
        moduleNameEn: '',
        moduleType: null,
        parentId: '',
        moduleSort: 0,
        moduleIcon: '',
        frondEndUrl: '',
        backEndUrl: ''
      },
      editModuleFormRules: {
        moduleNameCn: [{ required: true, message: this.$t('validator.moduleNameCnRequired'), trigger: ['blur', 'change'] }],
        moduleNameEn: [{ required: true, message: this.$t('validator.moduleNameEnRequired'), trigger: ['blur', 'change'] }],
        moduleType: [{ required: true, message: this.$t('validator.moduleTypeRequired'), trigger: ['blur', 'change'] }],
        moduleSort: [
          { required: true, message: this.$t('validator.moduleSortRequired'), trigger: ['blur', 'change'] },
          { type: 'number', min: 0, message: this.$t('validator.moduleSortLessThan0'), trigger: 'change' }
        ],
        parentId: [{ required: true, message: this.$t('validator.parentIdRequired'), trigger: ['blur', 'change'] }]
      },

      // common data
      selectedModuleType: null
    }
  },
  computed: {
    formatParentData() {
      let data = []
      switch (this.selectedModuleType) {
        case 2:
          data = this.tableData
          break
        case 3:
          this.tableData.forEach(item => {
            data = [...data, ...item.children]
          })
          break
        default: data = []
          break
      }
      return data
    }
  },
  watch: {
    addDialogVisible(val) {
      if (!val) {
        this.$refs.addModuleFormRef.resetFields()
        this.selectedModuleType = null
      }
    },
    editDialogVisible(val) {
      if (!val) {
        this.$refs.editModuleFormRef.resetFields()
        this.selectedModuleType = null
        this.current = {}
      }
    },
    selectedModuleType(val) {
      if (val) {
        if (this.addDialogVisible) {
          this.addModuleForm.moduleType = val
          this.addModuleForm.parentId = val === 1 ? '0' : null
        }

        if (this.editDialogVisible) {
          this.editModuleForm.moduleType = val
          this.editModuleForm.parentId = val === 1 ? '0' : null
        }
      }
    }
  },
  created() {
    this._getModules()
  },
  mounted() {},
  methods: {
    // request
    _addModule() {
      const data = { ...this.addModuleForm }
      addMerchantModule(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addModuleSuccess'))
          this.addDialogVisible = false
          this._getModules()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _deleteModule() {
      deleteMerchantModule(this.current.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
          this._getModules()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _getModules() {
      this.isLoading = true
      getMerchantModules().then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.type = res.data.params.EnumModuleType
          this.tableItemAttr.moduleType.valueEnum = this.type
          this.isLoading = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _getModuleById() {
      await getMerchantModuleById(this.current.id).then(res => {
        if (res.code === 200) {
          this.selectedModuleType = res.data.moduleType
          Object.keys(this.editModuleForm).forEach(key => {
            this.editModuleForm[key] = res.data[key]
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _updateModule() {
      const data = { ...this.editModuleForm }
      data.id = this.current.id
      updateMerchantModule(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.updateModuleSuccess'))
          this.editDialogVisible = false
          this._getModules()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getModules()
    },
    handleClickAdd() {
      this.addDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addModuleFormRef.validate(valid => {
        if (valid) {
          this._addModule()
        }
      })
    },
    handleClickSubmitEdit() {
      this.$refs.editModuleFormRef.validate(valid => {
        if (valid) {
          this._updateModule()
        }
      })
    },
    async handleClickEdit(data) {
      this.current = data
      await this._getModuleById()
      this.editDialogVisible = true
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleConfirmDelete() {
      this._deleteModule()
    },
    handleStatusChange(data) {
      this.current = data
    }
  }
}
</script>

<style lang='scss' scoped>

.module-manage-wrapper {

  .add-module-dialog, .edit-module-dialog {
    .el-form {
      width: 25vw;
    }
  }
}
</style>
