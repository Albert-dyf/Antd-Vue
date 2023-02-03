<template>
  <!-- 每个数据单独分开展示 -->
  <el-row class="data-analysis-wrapper" :gutter="32">
    <el-col :span="6">
      <el-card>
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.amountDataSelf') + "（￥）" }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="parseMoney(amountDataSelf.orderAmount) || 0" :decimals="5" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.amountDataMerchant') + "（￥）" }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="parseMoney(amountDataTotal.orderAmountTotal) || 0" :decimals="5" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.orderDataSelf') }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="Number(orderDataSelf.orderCountMine) || 0" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.orderDataMerchant') }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="Number(orderDataTotal.orderCount) || 0" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>
  </el-row>

  <!-- 数据分个人、商户、平台三模块 -->
  <!-- <el-row class="data-analysis-wrapper" :gutter="32">
    <el-col :span="8">
      <el-card>
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.dailySelf') }}</div>
          <div class="value">
            <span class="left-label">{{ $t('dashboard.orderCount') }}</span>
            <count-to class="right-value" :start-val="0" :end-val="orderDataSelf.orderCountMine" :duration="3000" />
          </div>
          <div class="value">
            <span class="left-label">{{ $t('dashboard.amount') }}</span>
            <count-to class="right-value" :start-val="0" :end-val="parseMoney(amountDataSelf.orderAmount) || 0" :decimals="5" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.dailyMerchant') }}</div>
          <div class="value">
            <span class="left-label">{{ $t('dashboard.orderCount') }}</span>
            <count-to class="right-value" :start-val="0" :end-val="orderDataTotal.orderCount" :duration="3000" />
          </div>
          <div class="value">
            <span class="left-label">{{ $t('dashboard.amount') }}</span>
            <count-to class="right-value" :start-val="0" :end-val="parseMoney(amountDataTotal.orderAmountTotal) || 0" :decimals="5" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.dailyPlatform') }}</div>
          <div class="value">
            <span class="left-label">{{ $t('dashboard.orderCount') }}</span>
            <count-to class="right-value" :start-val="0" :end-val="orderDataTotal.orderCount" :duration="3000" />
          </div>
          <div class="value">
            <span class="left-label">{{ $t('dashboard.amount') }}</span>
            <count-to class="right-value" :start-val="0" :end-val="parseMoney(amountDataTotal.orderAmountTotal) || 0" :decimals="5" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>
  </el-row> -->
</template>

<script>
import CountTo from 'vue-count-to'
import { getSelfOrderAmount, getTotalOrderAmount, getSelfOrderCount, getTotalOrderCount, getMerchantOrderAmount, getMerchantOrderCount } from '@/api/user'
import { parseMoney } from '@/utils'

export default {
  name: 'DataAnalysis',
  components: {
    CountTo
  },
  data() {
    return {
      amountDataSelf: {},
      amountDataTotal: {},
      amountDataMerchant: {},
      orderDataSelf: {},
      orderDataTotal: {},
      orderDataMerchant: {}
    }
  },
  computed: {},
  watch: {},
  created() {
    this.init()
  },
  mounted() {},
  methods: {
    parseMoney,

    init() {
      this._getSelfOrderAmount()
      this._getTotalOrderAmount()
      // this._getMerchantOrderAmount()
      this._getSelfOrderCount()
      this._getTotalOrderCount()
      // this._getMerchantOrderCount()
    },

    _getSelfOrderAmount() {
      getSelfOrderAmount().then(res => {
        this.amountDataSelf = res.data
      })
    },
    _getSelfOrderCount() {
      getSelfOrderCount().then(res => {
        this.orderDataSelf = res.data
      })
    },
    _getTotalOrderAmount() {
      getTotalOrderAmount().then(res => {
        this.amountDataTotal = res.data
      })
    },
    _getTotalOrderCount() {
      getTotalOrderCount().then(res => {
        this.orderDataTotal = res.data
      })
    },
    _getMerchantOrderCount() {
      getMerchantOrderCount().then(res => {
        this.orderDataMerchant = res.data
      })
    },
    _getMerchantOrderAmount() {
      getMerchantOrderAmount().then(res => {
        this.amountDataMerchant = res.data
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.data-analysis-wrapper {
  margin-bottom: 32px;

  .el-card {
    .analysis-item {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .value {
        font-size: 24px;
        text-align: right;
      }

      // .title {
      //   font-size: 16px;
      //   margin-bottom: 10px;
      // }

      // .value {
      //   display: flex;
      //   flex-direction: row;
      //   justify-content: space-between;
      //   align-items: center;

      //   .right-value {
      //     font-size: 24px;
      //   }
      // }
    }
  }
}
</style>
