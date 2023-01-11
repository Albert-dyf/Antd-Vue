<template>
  <el-container class="customer-routing-wrapper common-container">
    <el-main class="customer-routing-content common-body">
      <el-page-header :title="$t('common.back')" :content="$t('common.offerDetail') + ' - ' + customer.nickName" @back="handleBack" />

      <el-row class="customer-routing-search">
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.screenType" :placeholder="$t('select.screenTypePlaceholder')" clearable>
              <el-option v-for="screenType in screenTypes" :key="screenType.value" :label="screenType.name" :value="screenType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.channelType" :placeholder="$t('select.interfaceTypePlaceholder')" clearable>
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
                :disabled="scope.row.quotationId === null"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
              <span v-else-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span>
              <span v-else-if="tableItemAttr[attr].type === 'money'">
                {{ scope.row[attr] ? $t('common.dollarChar') + ' ' + parseMoney(Math.round(scope.row[attr])) : $t('business.noOffer') }}
              </span>
              <!-- <span v-else-if="attr === 'earningsRate'">
                {{ scope.row.salePrice ? Math.round((scope.row.salePrice - scope.row.limitedPrice) / scope.row.limitedPrice * 100) : '-' }}
              </span> -->
              <span v-else>{{ scope.row[attr] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="false" :label="$t('common.option')">
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
          <el-slider v-model="addOfferForm.earningsRate" show-input @change="handleSliderChange" />
        </el-form-item>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getCustomerRouting } from '@/api/service'
import { syncPages, parseEnumValue, parseMoney } from '@/utils'

export default {
  name: 'Routing',
  components: {
    StarlinkDatePicker
  },
  props: {
    customer: {
      type: Object,
      default: () => {
        return {}
      }
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
        priceSale: {
          type: 'money'
        },
        merchantRateSale: {},
        rateSale: {
          i18n: 'earningsRate'
        },
        lastUpdateTime: {
          i18n: 'offerTime'
        },
        useStatus: {
          type: 'enum',
          valueEnum: [],
          colorEnum: ['danger', 'success', 'warning', 'danger']
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
        channelType: '',
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
      param.customerId = this.customer.id
      await getCustomerRouting(param).then(res => {
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
            this._updateCustomerRouting()
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
    handleStatusChange(data) {
      this.current = data
      this._updateRoutingStatus()
    },
    handleSliderChange(val) {
      this.addOfferForm.earningsRate = Math.round(val)
    }
  }
}
</script>

<style lang='scss' scoped>
.customer-routing-wrapper {
  position: absolute;
  width: 100%;
  min-height: 100%;
  left: 0;
  top: 0;
  z-index: 2;

  .customer-routing-content {
    .customer-routing-search {
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
