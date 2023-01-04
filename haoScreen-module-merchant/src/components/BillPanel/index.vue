<template>
  <el-container class="bill-panel-wrapper common-container">
    <el-main class="bill-panel-content common-body">
      <el-page-header :title="$t('common.back')" :content="customer !== {} ? $t('common.customerBillDetail') + ' - ' + customer.nickName : $t('common.providerBillDetail')" @back="handleBack" />

      <el-row class="bill-panel-search">
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.balanceChangeType" :placeholder="$t('select.changeTypePlaceholder')" clearable>
              <el-option v-for="changeType in changeTypes" :key="changeType.value" :label="changeType.name" :value="changeType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item><el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button></el-form-item>
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
            v-for="(attr, i) in Object.keys(tableItemAttr)"
            :key="('customerBillAttr' + i)"
            :prop="attr"
            :label="$t('business.' + (tableItemAttr[attr].i18n || attr))"
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'money'">
                {{ parseMoney(scope.row[attr]) }}
              </span>
              <span v-else-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span>
              <span v-else>{{ scope.row[attr] }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="false" :label="$t('common.option')">
            <template slot-scope="scope">
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
          :total="pages.total"
          layout="sizes, prev, pager, next, jumper, ->, total"
          @size-change="handleChangePageSize"
          @current-change="hanldeChangeCurrentPage"
        ></el-pagination>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getProviderBillList } from '@/api/commen-resource'
import { getCustomerBillList } from '@/api/business'
import { parseEnumValue, parseMoney, syncPages } from '@/utils'

export default {
  name: 'BillPanel',
  components: {
    StarlinkDatePicker
  },
  props: {
    customer: {
      type: Object,
      default: () => {
        return {}
      }
    },
    provider: {
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
        createTime: {
          i18n: 'billCreateTime'
        },
        changeType: {
          type: 'enum',
          valueEnum: [],
          colorEnum: [null, 'danger', 'success', '']
        },
        changeValue: {
          type: 'money'
        },
        changeAfterValue: {
          type: 'money'
        },
        feeDigest: {}
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
        balanceChangeType: ''
      },
      isLoading: false,
      tableData: [],
      current: {},
      changeTypes: []
    }
  },
  computed: {},
  watch: {},
  async created() {
    await this.searchData()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,
    async searchData() {
      if (this.customer.customerId) {
        await this._getCustomerBillList()
      }
      if (this.provider.providerId) {
        await this._getProviderBillList()
      }
    },

    // request
    async _getCustomerBillList() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      param.customerId = this.customer.customerId
      await getCustomerBillList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.changeType.valueEnum = parseEnumValue(res.data.params.EnumBalanceChangeType)
          this.changeTypes = res.data.params.EnumBalanceChangeType
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },
    async _getProviderBillList() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      param.providerId = this.provider.providerId
      await getProviderBillList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.changeType.valueEnum = parseEnumValue(res.data.params.EnumBalanceChangeType)
          this.changeTypes = res.data.params.EnumBalanceChangeType
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
      this.searchData()
    },
    handleChangePageSize() {
      this.searchData()
    },
    hanldeChangeCurrentPage() {
      this.searchData()
    }
  }
}
</script>

<style lang='scss' scoped>
.bill-panel-wrapper {
  position: absolute;
  width: 100%;
  min-height: 100%;
  left: 0;
  top: 0;
  z-index: 2;

  .bill-panel-content {
    .bill-panel-search {
      margin: 20px 0;
    }
  }
}
</style>
