<template>
  <el-container class="merchant-routing-wrapper common-container">
    <el-main class="merchant-routing-content common-body">
      <el-page-header :title="$t('common.back')" :content="$t('common.distributorRouting')" @back="handleBack" />

      <el-row class="merchant-routing-search">
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

      <el-row class="table-tool-bar">
        <el-button type="primary" size="small" @click="handleClickSetAll">{{ $t('common.setAllRouting') }}</el-button>
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
              <span v-else-if="attr === 'earningsRate'">
                {{ scope.row.limitedPrice ? Math.round((scope.row.limitedPrice - scope.row.priceCost) / scope.row.priceCost * 100) : '-' }}
              </span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleClickSetSingle(scope.row)">{{ $t('common.offer') }}</el-button>
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
      :title="addOfferForm.channelName ? $t('business.addOffer') : $t('common.setAllRouting')"
      width="30vw"
      custom-class="add-offer-dialog"
      :append-to-body="true"
      :modal-append-to-body="true"
    >
      <el-form
        ref="addOfferFormRef"
        :model="addOfferForm"
        :rules="addOfferFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item v-if="addOfferForm.channelName" :label="$t('business.channelId')"><el-input v-model="addOfferForm.channelName" disabled /></el-form-item>
        <el-form-item :label="$t('merchant.earningsRate')" prop="earningsRate">
          <el-slider v-model="addOfferForm.earningsRate" show-input />
        </el-form-item>
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
import { getDistributorRoutings, updateDistributorRouting, updateDistributorRoutingAll } from '@/api/merchant'
import { getRoutingById } from '@/api/business'
import { syncPages, parseEnumValue, parseMoney } from '@/utils'

export default {
  name: 'Routing',
  components: {
    StarlinkDatePicker
  },
  props: {
    distributorId: {
      type: String,
      default: ''
    }
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
        priceCost: {
          type: 'money'
        },
        priceBase: {
          type: 'money'
        },
        limitedPrice: {
          type: 'money'
        },
        earningsRate: {},
        lastUpdateTime: {
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
        merchantId: '',
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
        earningsRate: 0
      },
      addOfferFormRules: {
        earningsRate: [
          { required: true, message: this.$t('merchant.earningsRate') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
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
  created() {
    this._getRoutingList()
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
      param.merchantId = this.distributorId
      await getDistributorRoutings(param).then(res => {
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
    async _updateDistributorRouting() {
      const data = {
        channelId: this.current.channelId,
        earningsRate: this.addOfferForm.earningsRate,
        merchantId: this.distributorId
      }
      updateDistributorRouting(data).then(res => {
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
    async _updateAllRouting() {
      const data = {
        earningsRate: this.addOfferForm.earningsRate,
        merchantId: this.distributorId
      }
      updateDistributorRoutingAll(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.updateRoutingSuccess'))
          this.addDialogVisible = false
          this._getRoutingList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleBack() {
      this.$emit('backToTable')
    },
    handleClickSearch() {
      this._getRoutingList()
    },
    handleClickSetAll() {
      this.current = {}
      this.addOfferForm = {}
      this.addDialogVisible = true
    },
    handleClickSetSingle(data) {
      this.current = data
      this.addOfferForm.channelName = this.current.channelName
      this.addDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addOfferFormRef.validate(valid => {
        if (valid) {
          if (this.addOfferForm.channelName) {
            this._updateDistributorRouting()
          } else {
            this._updateAllRouting()
          }
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
.merchant-routing-wrapper {
  position: absolute;
  width: 100%;
  min-height: 100%;
  left: 0;
  top: 0;
  z-index: 2;

  .merchant-routing-content {
    .merchant-routing-search {
      margin: 20px 0 0 0;
    }
  }
}
.add-offer-dialog, .edit-offer-dialog {
  .el-form {
    width: 25vw;

    .el-select {
      width: 100%;
    }
  }
}
</style>
