<template>
  <el-container class="business-offer-wrapper common-container">
    <el-main class="business-offer-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.screenType" :placeholder="$t('select.screenTypePlaceholder')" clearable>
              <el-option v-for="screenType in screenTypes" :key="screenType.value" :label="screenType.name" :value="screenType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.interfaceType" :placeholder="$t('select.interfaceTypePlaceholder')" clearable>
              <el-option v-for="interfaceType in interfaceTypes" :key="interfaceType.value" :label="interfaceType.name" :value="interfaceType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.useStatus" :placeholder="$t('select.useStatusPlaceholder')" clearable>
              <el-option v-for="useStatus in useStatusList" :key="useStatus.value" :label="useStatus.name" :value="useStatus.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item><el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button></el-form-item>
        </el-form>
      </el-row>

      <el-row v-if="false" class="table-tool-bar">
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
            :key="'offerTableAttr' + attr"
            :label="$t('business.' + (tableItemAttr[attr].i18n || attr))"
            :prop="attr"
          >
            <template slot-scope="scope">
              <el-switch
                v-if="tableItemAttr[attr].type === 'switch'"
                v-model="scope.row[attr]"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
              <span v-else-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span>
              <span v-else-if="tableItemAttr[attr].type === 'money'">
                {{ parseMoney(scope.row[attr]) || $t('business.noOffer') }}
              </span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button v-if="!scope.row.priceSale" type="text" size="small" @click="handleClickAdd(scope.row)">{{ $t('common.offer') }}</el-button>
              <span v-else>
                <el-button type="text" @click="handleClickEdit(scope.row)">{{ $t('common.edit') }}</el-button>
                <el-popconfirm
                  :title="$t('popMessage.undoOfferTip')"
                  :confirm-button-text="$t('common.confirm')"
                  :cancel-button-text="$t('common.cancel')"
                  @onConfirm="handleConfirmUndo"
                >
                  <el-button slot="reference" class="delete-btn" type="text" @click="handleClickUndo(scope.row)">{{ $t('common.undo') }}</el-button>
                </el-popconfirm>
              </span>
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
      :title="$t('business.addOffer')"
      width="30vw"
      custom-class="add-offer-dialog"
    >
      <el-form
        ref="addOfferFormRef"
        :model="addOfferForm"
        :rules="addOfferFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item :label="$t('business.channelId')"><el-input v-model="addOfferForm.channelName" disabled /></el-form-item>
        <el-form-item :label="$t('business.priceSale')" prop="priceSale"><el-input v-model="addOfferForm.priceSale" /></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- edit -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="$t('business.editOffer')"
      width="30vw"
      custom-class="edit-offer-dialog"
    >
      <el-form
        ref="editOfferFormRef"
        :model="editOfferForm"
        :rules="editOfferFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item :label="$t('business.channelId')"><el-input v-model="editOfferForm.channelName" disabled /></el-form-item>
        <el-form-item :label="$t('business.priceSale')" prop="priceSale"><el-input v-model="editOfferForm.priceSale" /></el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="editDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitEdit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getRoutingList, addRouting, getRoutingById, undoRouting, updateRouting } from '@/api/business'
import { syncPages, parseEnumValue, reverseMoney, parseMoney } from '@/utils'

export default {
  components: {
    StarlinkDatePicker
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        channelName: {},
        screenType: {
          type: 'enum',
          valueEnum: []
        },
        interfaceType: {
          type: 'enum',
          valueEnum: []
        },
        priceBase: {
          type: 'money'
        },
        priceSale: {
          type: 'money'
        },
        createTime: {
          i18n: 'offerTime'
        },
        useStatus: {
          type: 'enum',
          colorEnum: ['danger', 'success', 'warning', 'danger'],
          valueEnum: []
        }
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
        interfaceType: '',
        searchKey: '',
        screenType: '',
        useStatus: ''
      },
      isLoading: false,
      tableData: [],
      current: {},

      // add offer data
      addDialogVisible: false,
      addOfferForm: {
        priceSale: ''
      },
      addOfferFormRules: {
        priceSale: [
          { required: true, message: this.$t('business.priceSale') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // edit offer data
      editDialogVisible: false,
      editOfferForm: {
        channelName: '',
        priceSale: ''
      },
      editOfferFormRules: {
        priceSale: [
          { required: true, message: this.$t('business.priceSale') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // common data
      screenTypes: [],
      interfaceTypes: [],
      useStatusList: []
    }
  },
  computed: {},
  watch: {
    addDialogVisible(val) {
      if (!val) {
        this.$refs.addOfferFormRef.resetFields()
        this.current = {}
      }
    },
    editDialogVisible(val) {
      if (!val) {
        this.$refs.editOfferFormRef.resetFields()
        this.current = {}
      }
    }
  },
  async created() {
    await this._getRoutingList()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getRoutingList() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      await getRoutingList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.screenType.valueEnum = parseEnumValue(res.data.params.EnumScreenType)
          this.screenTypes = res.data.params.EnumScreenType
          this.tableItemAttr.interfaceType.valueEnum = parseEnumValue(res.data.params.EnumScreenChannelType)
          this.interfaceTypes = res.data.params.EnumScreenChannelType
          this.tableItemAttr.useStatus.valueEnum = parseEnumValue(res.data.params.EnumUseStatus)
          this.useStatusList = res.data.params.EnumUseStatus
          this.useStatusList.pop()
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },
    async _addRouting() {
      const data = {
        channelId: this.current.channelId,
        priceSale: reverseMoney(this.addOfferForm.priceSale)
      }
      addRouting(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addRoutingSuccess'))
          this.addDialogVisible = false
          this._getRoutingList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _getRoutingById() {
      await getRoutingById(this.current.routingId).then(res => {
        if (res.code === 200) {
          Object.keys(this.editOfferForm).forEach(key => {
            this.editOfferForm[key] = res.data.object[key]
          })
          this.editOfferForm.priceSale = parseMoney(res.data.object.priceSale)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _undoRouting() {
      await undoRouting(this.current.routingId).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.undoSuccess'))
          this._getRoutingList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _updateRouting() {
      const data = {
        priceSale: reverseMoney(this.editOfferForm.priceSale),
        routingId: this.current.routingId
      }
      await updateRouting(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.updateRoutingSuccess'))
          this.editDialogVisible = false
          this._getRoutingList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getRoutingList()
    },
    handleClickAdd(data) {
      this.current = data
      this.addOfferForm.channelName = data.channelName
      this.addDialogVisible = true
    },
    async handleClickEdit(data) {
      this.current = data
      await this._getRoutingById()
      this.editDialogVisible = true
    },
    handleClickUndo(data) {
      this.current = data
    },
    handleConfirmUndo() {
      this._undoRouting()
    },
    handleClickSubmit() {
      this.$refs.addOfferFormRef.validate(valid => {
        if (valid) {
          this._addRouting()
        }
      })
    },
    handleClickSubmitEdit() {
      this.$refs.editOfferFormRef.validate(valid => {
        if (valid) {
          this._updateRouting()
        }
      })
    },
    handleChangePageSize() {
      this._getRoutingList()
    },
    hanldeChangeCurrentPage() {
      this._getRoutingList()
    },
    handleStatusChange() {}
  }
}
</script>

<style lang='scss' scoped>
.business-offer-wrapper {
  .add-offer-dialog, .edit-offer-dialog {
    .el-form {
      width: 25vw;

      .el-select {
        width: 100%;
      }
    }
  }
}
</style>
