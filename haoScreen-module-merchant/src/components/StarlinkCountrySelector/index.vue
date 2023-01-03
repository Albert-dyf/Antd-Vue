<template>
  <section class="starlink-country-selector">
    <el-input
      ref="countrySearchInput"
      v-model="countryValue"
      v-popover:popover
      :placeholder="$t('detection.countrySelectPlaceholder')"
      clearable
      @focus="focusOnInput"
      @input="debounceSearch"
      @clear="handleClearInput"
    ></el-input>
    <el-popover
      ref="popover"
      placement="bottom-start"
      trigger="focus"
      popper-class="country-select-popover"
    >
      <div slog="content">
        <el-table
          ref="countryTable"
          v-infinite-scroll="loadCountry"
          v-loading="loading"
          class="country-select-table"
          :data="countryData"
          highlight-current-row
          :show-header="false"
          :fit="true"
          @current-change="handleSelect"
        >
          <el-table-column
            v-for="key in Object.keys(countryType)"
            :key="key"
            :label="key"
            :prop="key"
            min-width="80px"
          ></el-table-column>
        </el-table>
      </div>
    </el-popover>
  </section>
</template>

<script>
import _ from 'lodash'
import { getCountryList } from '@/api/commen-resource'

export default {
  name: 'StarlinkCountrySelector',
  props: {
    countryCode: {
      type: String,
      default: ''
    },
    country: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    const CountryType = {
      countryCode: {},
      countryNameZh: {},
      countryNameEn: {}
    }
    return {
      optionVisible: false,
      countryType: CountryType,
      countryData: [],
      current: null,
      countryValue: '',
      searchForm: {
        pageNumber: 1,
        pageSize: 10
      },
      totalPages: 0,
      isInputSearch: false,
      loading: false
    }
  },
  computed: {
    debounceSearch() {
      return _.debounce(this.searchCounrty, 300)
    },
    throttleSearch() {
      return _.throttle(this.searchCounrty, 300)
    }
  },
  watch: {
    current(val) {
      if (val) {
        this.countryValue = val.countryCode + '/' + val.countryNameZh + '/' + val.countryNameEn
        this.$emit('update:countryCode', val.countryCode)
        this.$emit('update:country', val)
      } else {
        this.countryValue = ''
        this.$emit('update:countryCode', '')
        this.$emit('update:country', {})
      }
    }
  },
  created() {
    this.getCountrys('')
  },
  mounted() {
  },
  methods: {
    handleSelect(val) {
      this.current = val
      this.$refs.popover.doClose()
    },
    focusOnInput() {
      this.$refs.countryTable.setCurrentRow(this.current)
    },
    loadCountry() {
      this.isInputSearch = false
      if (this.searchForm.pageNumber !== this.totalPages) {
        this.searchForm.pageNumber++
        this.getCountrys(this.countryValue)
      }
    },
    searchCounrty(e) {
      this.isInputSearch = true
      this.searchForm.pageNumber = 1
      // console.log('search country (): ------------')
      // console.log(e)
      this.getCountrys(e)
    },
    async getCountrys(searchKey) {
      this.loading = true
      const params = {
        ...this.searchForm,
        searchKey: searchKey
      }
      const res = await getCountryList(params)
      // console.log(res.data.rows)
      if (!this.isInputSearch) {
        this.countryData = [...this.countryData, ...res.data.rows]
      } else {
        this.countryData = res.data.rows
      }

      this.totalPages = res.data.totalPages
      this.loading = false
    },
    handleClearInput() {
      this.getCountrys('')
      this.searchForm.pageNumber = 1
      this.$refs.countrySearchInput.blur()
    },
    clearField() {
      this.current = null
      this.handleClearInput()
    }
  }
}
</script>

<style lang='scss' scoped>
.country-select-popover {
  .country-select-table {
    min-width: 480px;
    max-height: 274px;
    overflow: auto;
  }
}
</style>
