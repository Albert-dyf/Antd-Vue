<template>
  <el-container class="merchant-distributor-wrapper common-container">
    <el-main class="merchant-distributor-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
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
            :key="'distributor' + attr"
            :prop="attr"
            :label="$t('merchant.' + (tableItemAttr[attr].i18n || attr ))"
          >
            <template slot-scope="scope">
              <el-switch
                v-if="tableItemAttr[attr].type === 'switch'"
                v-model="scope.row[attr]"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
              <span v-else-if="tableItemAttr[attr].type === 'money'">{{ parseMoney(scope.row[attr]) }}</span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickRoute(scope.row)">{{ $t('common.offerDetail') }}</el-button>
              <el-button type="text" @click="handleClickCommission(scope.row)">{{ $t('common.commission') }}</el-button>
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

    <!-- add -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('merchant.addDistributor')"
      width="30vw"
      custom-class="add-distributor-dialog"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item :label="$t('merchant.merchantName')" prop="merchantName"><el-input v-model="addForm.merchantName" /></el-form-item>
        <el-form-item :label="$t('merchant.operatorCountLimit')" prop="operatorCountLimit"><el-input v-model="addForm.operatorCountLimit" /></el-form-item>
        <el-form-item :label="$t('merchant.merchantDescribe')" prop="merchantDescribe"><el-input v-model="addForm.merchantDescribe" type="textarea" /></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <transition name="fade-transform" mode="out-in">
      <routing v-if="routingDetailVisible" :distributor="current" @backToTable="handleBack" />
    </transition>

    <transition name="fade-transform" mode="out-in">
      <distributor-commission v-if="commissionVisible" :distributor="current" @backToTable="handleBack" />
    </transition>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import Routing from './components/routing.vue'
import DistributorCommission from './components/commission.vue'
import { addDistributor, getDistributors, updateDistributor, deleteDistributor } from '@/api/merchant'
import { syncPages } from '@/utils'

export default {
  components: {
    StarlinkDatePicker,
    Routing,
    DistributorCommission
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        merchantName: {},
        level: {},
        operatorCountLimit: {},
        useStatus: {
          i18n: 'stateSwitch',
          type: 'switch'
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
        // startTime: '',
        // endTime: '',
        searchKey: '',
        useStatus: ''
      },
      isLoading: false,
      tableData: [],
      current: {},
      useStatus: [],

      // add distributor data
      addDialogVisible: false,
      addForm: {
        merchantName: '',
        merchantDescribe: '',
        operatorCountLimit: ''
      },
      addFormRules: {
        merchantName: [
          { required: true, message: this.$t('merchant.merchantName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        merchantDescribe: [
          { required: true, message: this.$t('merchant.merchantDescribe') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        operatorCountLimit: [
          { required: true, message: this.$t('merchant.operatorCountLimit') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // routing Detail
      routingDetailVisible: false,
      // commssion
      commissionVisible: false
    }
  },
  computed: {},
  watch: {
    addDialogVisible(val) {
      if (!val) {
        this.$refs.addFormRef.resetFields()
      }
    }
  },
  async created() {
    this._getDistributors()
  },
  mounted() {},
  methods: {
    // request
    async _getDistributors() {
      this.isLoading = true
      const param = { ...this.pages, ...this.searchForm }
      delete param.total
      await getDistributors(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          syncPages(this.pages, res)
        }
      })
      this.isLoading = false
    },
    async _addDistributor() {
      await addDistributor(this.addForm).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addDistributorSuccess'))
          this.addDialogVisible = false
          this._getDistributors()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _updateDistributor() {
      await updateDistributor(this.current.merchantId, this.current.useStatus).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.statusChangeSuccess'))
        } else {
          this.$message.error(res.msg)
          this.current.useStatus = this.current.useStatus === 1 ? 2 : 1
        }
      })
    },
    async _deleteDistributor() {
      await deleteDistributor(this.current.merchantId).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
          this._getDistributors()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getDistributors()
    },
    handleClickAdd() {
      this.addDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          this._addDistributor()
        }
      })
    },
    handleClickRoute(data) {
      this.current = data
      this.routingDetailVisible = true
    },
    handleClickCommission(data) {
      this.current = data
      this.commissionVisible = true
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleConfirmDelete() {
      this._deleteDistributor()
    },
    handleBack() {
      this.routingDetailVisible = false
      this.commissionVisible = false
    },
    handleChangePageSize() {
      this._getDistributors()
    },
    hanldeChangeCurrentPage() {
      this._getDistributors()
    },
    handleStatusChange(data) {
      this.current = data
      this._updateDistributor()
    }
  }
}
</script>

<style lang='scss' scoped>

.merchant-distributor-wrapper {
  position: relative;
  .add-distributor-dialog {
    .el-form {
      width: 25vw;

      .el-select {
        width: 100%;
      }
    }
  }
}
</style>
