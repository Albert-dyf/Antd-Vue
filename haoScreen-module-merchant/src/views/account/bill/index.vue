<template>
  <el-container class="account-bill-wrapper">
    <el-header class="account-bill-header">
      <el-form class="bill-search-form" :model="searchForm" :inline="true" size="small">
        <starlink-date-picker
          :begin-time.sync="searchForm.startTime"
          :end-time.sync="searchForm.endTime"
          :reset.sync="isReset"
        />
        <el-form-item>
          <el-select v-model="searchForm.changeType" :placeholder="$t('account.billType')" clearable>
            <el-option :label="$t('account.billType1')" :value="1"></el-option>
            <el-option :label="$t('account.billType2')" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button>
        </el-form-item>
      </el-form>
    </el-header>

    <el-main class="account-bill-table">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
      >
        <el-table-column
          v-for="key in Object.keys(billType)"
          :key="'bill-' + key"
          :label="$t('account.' + billType[key].text)"
          :prop="key"
          :align="billType[key].align"
        >
          <template slot-scope="scope">
            <div v-if="billType[key].render">
              <div v-if="billType[key].render.type === 'enums'">
                <el-tag v-if="key=== 'changeType'" :type="billType[key].render.valueEnums[scope.row[key]].type">
                  {{ billType[key].render.valueEnums[scope.row[key]].text }}
                </el-tag>
                <span v-if="key === 'changeValue'">
                  <span :class="'bill-type-' + scope.row.changeType">
                    {{ $t('common.dollarChar') + ' ' + parseMoney(scope.row[key]) }}
                  </span>
                </span>
              </div>
            </div>
            <div v-else-if="key === 'changeAfterValue'">
              {{ $t('common.dollarChar') + ' ' + parseMoney(scope.row[key]) }}
            </div>
            <div v-else>{{ scope.row[key] }}</div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="bill-pagination"
        layout="sizes, prev, pager, next, jumper, ->, total"
        :total="pages.total"
        :current-page.sync="pages.pageNumber"
        :page-size.sync="pages.pageSize"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      ></el-pagination>
    </el-main>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getBillRecord } from '@/api/account'
import { parseMoney } from '@/utils'

export default {
  components: {
    StarlinkDatePicker
  },
  data() {
    const billType = {
      changeType: {
        text: 'billType',
        render: {
          type: 'enums',
          valueEnums: [
            {
              text: this.$t('account.billType0'),
              type: 'info'
            },
            {
              text: this.$t('account.billType1'),
              type: 'danger'
            },
            {
              text: this.$t('account.billType2'),
              type: 'success'
            }
          ]
        }
      },
      changeValue: {
        text: 'billPrice',
        align: 'center',
        render: {
          type: 'enums',
          valueEnums: [
            '',
            '+',
            '-'
          ]
        }
      },
      changeAfterValue: {
        text: 'balance',
        align: 'center'
      },
      createTime: {
        text: 'createTime'
      }
    }
    return {
      searchForm: {
        startTime: '',
        endTime: '',
        changeType: null
      },
      pages: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      billType: billType,
      tableData: [],
      isReset: false,
      loading: false
    }
  },
  computed: {},
  watch: {},
  created() {
    this.initData()
  },
  mounted() {},
  methods: {
    parseMoney,
    initData() {
      this.getBills()
    },
    async getBills() {
      this.loading = true
      const params = { ...this.pages, ...this.searchForm }
      delete params.total
      const res = await getBillRecord(params)
      this.tableData = res.data.rows
      this.pages = {
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        total: res.data.totalRows
      }
      this.loading = false
    },
    handleClickSearch() {
      this.getBills()
    },
    handlePageChange() {
      this.getBills()
    },
    handlePageSizeChange() {
      this.getBills()
    }
  }
}
</script>

<style lang='scss' scoped>
$success: #67C23A;
$danger: #f45c6c;
.account-bill-wrapper {
  padding: 32px;

  .account-bill-header, .account-bill-table {
    padding: 20px;
    padding-bottom: 0;
    background-color: white;
    height: fit-content !important;
  }

  .account-bill-header {
    .bill-search-form {
      .el-form-item {
        margin-bottom: 0 !important;
      }
    }
  }

  .account-bill-table {
    padding-bottom: 20px;

    .bill-type-0 {}
    .bill-type-1 {
      color: $danger;
    }
    .bill-type-2 {
      color: $success;
    }
  }

  .bill-pagination {
    padding: 20px 0;

    ::v-deep .el-select {
      .el-input {
        margin: 0;
      }
    }
  }

}
</style>
