<template>
  <section class="starlink-date-picker">
    <el-form-item>
      <el-radio-group v-model="isDaySearch" class="search-date-type" size="small" @change="handleTypeChange">
        <el-radio-button :label="true">{{ $t('common.daySearch') }}</el-radio-button>
        <el-radio-button :label="false">{{ $t('common.rangeSearch') }}</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-show="isDaySearch">
      <el-date-picker
        v-model="searchDayDate"
        class="search-day-date"
        type="date"
        :placeholder="$t('common.searchDay')"
        value-format="yyyy-MM-dd"
        format="yyyy-MM-dd"
        :picker-options="pickerOptionsByDay"
      >
      </el-date-picker>
    </el-form-item>
    <el-form-item v-show="!isDaySearch" prop="searchStartTime">
      <el-date-picker
        v-model="searchRangeDate"
        class="search-range-date"
        type="datetimerange"
        :start-placeholder="$t('common.startTime')"
        :end-placeholder="$t('common.endTime')"
        value-format="yyyy-MM-dd HH:mm:ss"
        format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptionsByRange"
      >
      </el-date-picker>
    </el-form-item>
  </section>
</template>

<script>
import { parseDayStart } from '@/utils'

export default {
  name: 'StarlinkDatePicker',
  props: {
    startTime: {
      type: String,
      default: ''
    },
    endTime: {
      type: String,
      default: ''
    },
    reset: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isDaySearch: true,
      start: '',
      end: '',
      searchDayDate: '',
      searchRangeDate: ['', ''],
      pickeOneDate: '',
      pickerOptionsByDay: {
        disabledDate(date) {
          return date.getTime() > Date.now()
        }
      },
      pickerOptionsByRange: {
        onPick: ({ minDate, maxDate }) => {
          this.pickeOneDate = parseDayStart(minDate)
        },
        disabledDate(date) {
          return date.getTime() > Date.now()
        },
        shortcuts: [
          {
            text: this.$t('datePicker.last3Days'),
            onClick(picker) {
              const start = new Date()
              const end = new Date()
              start.setTime(start.getTime() - 3 * 24 * 3600 * 1000)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: this.$t('datePicker.last5Days'),
            onClick(picker) {
              const start = new Date()
              const end = new Date()
              start.setTime(start.getTime() - 5 * 24 * 3600 * 1000)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: this.$t('datePicker.last7Days'),
            onClick(picker) {
              const start = new Date()
              const end = new Date()
              start.setTime(start.getTime() - 7 * 24 * 3600 * 1000)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  computed: {},
  watch: {
    reset(value) {
      if (value) {
        this.searchDayDate = null
        this.searchRangeDate = null
        this.pickeOneDate = null
        this.$emit('update:reset', false)
      }
    },
    searchDayDate(value) {
      if (value) {
        this.$emit('update:startTime', value + ' 00:00:00')
        this.$emit('update:endTime', value + ' 23:59:59')
      } else {
        this.$emit('update:startTime', '')
        this.$emit('update:endTime', '')
      }
    },
    searchRangeDate(value) {
      if (value) {
        this.$emit('update:startTime', value[0])
        this.$emit('update:endTime', value[1])
      } else {
        this.$emit('update:startTime', '')
        this.$emit('update:endTime', '')
        this.pickeOneDate = null
      }
    },
    pickeOneDate(value) {
      if (value) {
        const day = 30 * 24 * 3600 * 1000
        const max = this.pickeOneDate + day - 1000
        const min = this.pickeOneDate - day + 24 * 3600 * 1000
        this.pickerOptionsByRange.disabledDate = (date) => {
          return date.getTime() > max || date.getTime() < min || date.getTime() > Date.now()
        }
      } else {
        this.pickerOptionsByRange.disabledDate = (date) => {
          return date.getTime() > Date.now()
        }
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleTypeChange() {
      this.searchDayDate = null
      this.searchRangeDate = null
    }
  }
}
</script>

<style lang='scss' scoped>
.starlink-date-picker {
  display: inline-block;
  .search-date-type {
    ::v-deep.el-radio-button__inner{
      width: 90px;
    }
  }

  .search-range-date {
    width: 370px;
  }
}
</style>

<style lang="scss">
.el-picker-panel {
  .el-picker-panel__link-btn.el-button--text {
    display: none;
  }
}
</style>

