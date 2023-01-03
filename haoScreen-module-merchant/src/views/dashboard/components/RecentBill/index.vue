<template>
  <Card class="recent-bill-wrapper" shadow="hover" @click.native="handleClickWrapper">
    <div slot="header" class="bill-title-header">
      <span class="card-title">{{ $t('dashboard.recentBill') }}</span>
      <div class="bill-balance">
        <span class="bill-balance-label">{{ $t('account.balance') }}</span>
        <span class="bill-balance-value">{{ $t('common.dollarChar') + ' ' + parseMoney(balance) }}</span>
      </div>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData"
      :show-header="false"
      height="42vh"
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
          <div v-else>{{ scope.row[key] }}</div>
        </template>
      </el-table-column>
    </el-table>
  </Card>
</template>

<script>
import { Card } from 'element-ui'
import { getBillRecord } from '@/api/account'
import { mapGetters } from 'vuex'
import { parseMoney } from '@/utils'

export default {
  name: 'RecentBill',
  components: { Card },
  data() {
    const billType = {
      createTime: {
        text: 'createTime'
      },
      changeType: {
        text: 'billType',
        align: 'center',
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
        align: 'right',
        render: {
          type: 'enums',
          valueEnums: [
            '',
            '+',
            '-'
          ]
        }
      }
    }
    return {
      params: {
        pageNumber: 1,
        pageSize: 10
      },
      billType: billType,
      tableData: [],
      loading: false
    }
  },
  computed: {
    ...mapGetters([
      'balance'
    ])
  },
  watch: {},
  created() {
    this.initData()
  },
  mounted() { },
  methods: {
    parseMoney,
    initData() {
      this.getBills()
    },
    async getBills() {
      this.loading = true
      const res = await getBillRecord(this.params)
      this.tableData = res.data.rows
      this.loading = false
    },
    handleClickWrapper() {
      this.$router.push('/account/bill')
    }
  }
}
</script>

<style lang='scss' scoped>
$success: #67C23A;
$danger: #f45c6c;
.recent-bill-wrapper {
  cursor: pointer;

  .bill-title-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .bill-balance {
      display: flex;
      flex-direction: column;
      align-items: center;

      .bill-balance-label {}
      .bill-balance-value {
        font-size: 18px;
      }
    }
  }

  .card-title {
    font-size: 18px;
    font-weight: bold;
  }

  .bill-type-0 {}
  .bill-type-1 {
    color: $danger;
  }
  .bill-type-2 {
    color: $success;
  }
}
</style>
