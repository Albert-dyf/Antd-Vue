<template>
  <el-container class="distributor-commission-wrapper common-container">
    <el-main class="distributor-commission-content common-body">
      <el-page-header :title="$t('common.back')" :content="$t('common.distributorCommission')" @back="handleBack" />

      <el-row class="distributor-commission-search">
        <el-form inline size="small">
          <starlink-date-picker :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
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
            v-for="attr in Object.keys(tableItemAttr)"
            :key="'commission' + attr"
            :label="$t('merchant.' + (tableItemAttr[attr].i18n || attr))"
            :prop="attr"
          >
            <template slot-scope="scope">
              <span v-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span>
              <span v-else-if="tableItemAttr[attr].type === 'money'">
                {{ parseMoney(scope.row[attr]) || '-' }}
              </span>
              <span v-else>{{ scope.row[attr] || '-' }}</span>
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
import { getCommissionList } from '@/api/merchant'
import { syncPages, parseEnumValue, parseMoney } from '@/utils'

export default {
  name: 'DistributorCommission',
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
        createTime: {
          i18n: 'orderTime'
        },
        totalCount: {},
        limitedAmount: {
          type: 'money'
        },
        orderSaleAmount: {
          type: 'money'
        },
        orderCommissionAmount: {
          type: 'money'
        },
        interfaceType: {
          type: 'enum',
          valueEnum: []
        },
        screenType: {
          type: 'enum',
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
        startTime: '',
        endTime: '',
        merchantId: '',
        searchKey: ''
      },
      isLoading: false,
      tableData: [],
      current: {}
    }
  },
  computed: {},
  watch: {},
  created() {
    this._getCommissionList()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getCommissionList() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      param.merchantId = this.distributorId
      await getCommissionList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.screenType.valueEnum = parseEnumValue(res.data.params.EnumScreenType)
          this.tableItemAttr.interfaceType.valueEnum = parseEnumValue(res.data.params.EnumScreenChannelType)
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },

    // handler
    handleClickSearch() {
      this._getCommissionList()
    },
    handleBack() {
      this.$emit('backToTable')
    },
    handleChangePageSize() {
      this._getCommissionList()
    },
    hanldeChangeCurrentPage() {
      this._getCommissionList()
    }
  }
}
</script>

<style lang='scss' scoped>
.distributor-commission-wrapper {
  position: absolute;
  width: 100%;
  min-height: 100%;
  left: 0;
  top: 0;
  z-index: 2;
  .distributor-commission-content {
    .distributor-commission-search {
      margin: 20px 0 0 0;
    }
  }
}
</style>
