<template>
  <el-row class="data-analysis-wrapper" :gutter="32">
    <el-col :span="6">
      <el-card>
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.amountDataSelf') }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="parseMoney(amountDataSelf.amount) || 0" :decimals="5" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.amountDataTotal') }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="parseMoney(amountDataTotal.amount) || 0" :decimals="5" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.orderDataSelf') }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="orderDataSelf.num" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="analysis-item">
        <section class="analysis-item">
          <div class="title">{{ $t('dashboard.orderDataTotal') }}</div>
          <div class="value">
            <count-to :start-val="0" :end-val="orderDataTotal.num" :duration="3000" />
          </div>
        </section>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { getSelfOrderAmount, getTotalOrderAmount, getSelfOrderCount, getTotalOrderCount } from '@/api/user'
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
      orderDataSelf: {},
      orderDataTotal: {}
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
      this._getSelfOrderCount()
      this._getTotalOrderCount()
    },

    async _getSelfOrderAmount() {
      await getSelfOrderAmount().then(res => {
        this.amountDataSelf = res.data
      })
    },
    async _getTotalOrderAmount() {
      await getTotalOrderAmount().then(res => {
        this.amountDataTotal = res.data
      })
    },
    async _getSelfOrderCount() {
      await getSelfOrderCount().then(res => {
        this.orderDataSelf = res.data
      })
    },
    async _getTotalOrderCount() {
      await getTotalOrderCount().then(res => {
        this.orderDataTotal = res.data
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
    }
  }
}
</style>
