<template>
  <el-card>
    <div class="chart-wrapper">
      <div id="chart" class="chart"></div>
    </div>
  </el-card>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../mixins/resize'
import { getOrderListAll, getOrderListMine } from '@/api/user'
import { parseMoney } from '@/utils'

const animationDuration = 1000

export default {
  mixins: [resize],
  data() {
    return {
      chart: null,
      xDataAxis: [],
      seriesItem: {
        name: '',
        type: 'bar',
        barWidth: '10%',
        data: [],
        animationDuration
      },
      series: []
    }
  },
  async mounted() {
    await this.initData()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    async initData() {
      await this._getOrderData()
      await this._getOrderListMine()
      this.series.sort((a, b) => { return a.yAxisIndex - b.yAxisIndex })
      this.initChart()
    },
    initChart() {
      this.chart = echarts.init(document.getElementById('chart'), 'macarons')
      this.chart.setOption({
        title: {
          show: true,
          text: this.$t('dashboard.orderAnalysis')
        },
        legend: {
          show: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'cross' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        grid: {
          top: 100,
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: this.xDataAxis,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [
          {
            name: this.$t('dashboard.orderCount'),
            type: 'value',
            position: 'left',
            axisTick: {
              show: false
            },
            boundaryGap: ['3%', '3%']
          },
          {
            name: this.$t('dashboard.orderAmount'),
            type: 'value',
            position: 'right',
            axisTick: {
              show: true
            },
            boundaryGap: ['3%', '3%'],
            splitLine: {
              show: false
            },
            splitArea: {
              show: false
            }
          }
        ],
        series: this.series
      })
    },

    // request
    async _getOrderData() {
      await getOrderListAll().then(res => {
        if (res.code === 200) {
          this.series = [...this.series, ...this.formatChartData(res.data, 'merchant')]
        }
      })
    },
    async _getOrderListMine() {
      await getOrderListMine().then(res => {
        if (res.code === 200) {
          this.series = [...this.series, ...this.formatChartData(res.data, 'mine')]
        }
      })
    },

    // format
    formatChartData(arr, type) {
      const reverseArr = arr.reverse()
      const count = JSON.parse(JSON.stringify(this.seriesItem))
      const amount = JSON.parse(JSON.stringify(this.seriesItem))
      const date = []
      count.name = this.$t('dashboard.' + type + 'Count')
      count.yAxisIndex = 0
      amount.name = this.$t('dashboard.' + type + 'Amount')
      amount.type = 'line'
      amount.yAxisIndex = 1
      reverseArr.forEach(daily => {
        date.push(daily.reportDate)
        count.data.push(daily.orderCount)
        amount.data.push(parseMoney(daily.orderAmount))
      })
      const xAxis = [...this.xDataAxis, ...new Set(date)]
      this.xDataAxis = [...new Set(xAxis)]
      return [count, amount]
    }
  }
}
</script>

<style lang='scss' scoped>
.chart-wrapper {
  flex-direction: row;
  justify-content: flex-end;
}
.chart {
  width: 100%;
  height: 70vh;
}
</style>
