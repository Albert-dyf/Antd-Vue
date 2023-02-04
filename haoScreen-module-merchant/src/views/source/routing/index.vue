<template>
  <el-container class="source-routing-wrapper common-container">
    <el-main class="source-routing-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable @keyup.enter.native="handleClickSearch" /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.screenType" :placeholder="$t('select.screenTypePlaceholder')" clearable filterable>
              <el-option v-for="screenType in screenTypes" :key="screenType.value" :label="screenType.name" :value="screenType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.interfaceType" :placeholder="$t('select.interfaceTypePlaceholder')" clearable>
              <el-option v-for="interfaceType in interfaceTypes" :key="interfaceType.value" :label="interfaceType.name" :value="interfaceType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button>
          </el-form-item>
        </el-form>
      </el-row>

      <el-row class="table-tool-bar">
        <el-button type="primary" size="small" @click="handleClickSetAll">{{ $t('common.limitPriceAll') }}</el-button>
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
            :key="'routingTableAttr' + attr"
            :label="$t('source.' + (tableItemAttr[attr].i18n || attr))"
            :prop="attr"
          >
            <template slot-scope="scope">
              <el-switch
                v-if="tableItemAttr[attr].type === 'switch'"
                v-model="scope.row[attr]"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
              <span v-else-if="tableItemAttr[attr].type === 'enum'">
                <el-tag v-if="tableItemAttr[attr].colorEnum" :type="tableItemAttr[attr].colorEnum[scope.row[attr]]">
                  {{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}
                </el-tag>
                <span v-else>{{ tableItemAttr[attr].valueEnum[scope.row[attr]] ? tableItemAttr[attr].valueEnum[scope.row[attr]].name : '-' }}</span>
              </span><span v-else-if="tableItemAttr[attr].type === 'money'">
                {{ scope.row[attr] ? $t('common.dollarChar') + ' ' + parseMoney(Math.round(scope.row[attr])) : $t('common.noLimitedPrice') }}
              </span>
              <span v-else>{{ scope.row[attr] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleClickSetSingle(scope.row)">{{ $t('common.limitPrice') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-row class="table-pagination">
        <el-pagination
          :current-page.sync="pages.pageNumber"
          :page-size.sync="pages.pageSize"
          :total.sync="pages.total"
          layout="sizes, prev, pager, next, jumper, ->, total"
          @size-change="handleChangePageSize"
          @current-change="hanldeChangeCurrentPage"
        ></el-pagination>
      </el-row>
    </el-main>

    <!-- add -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="addForm.channelName ? $t('common.limitPrice') : $t('common.limitPriceAll')"
      width="30vw"
      custom-class="add-offer-dialog"
      :append-to-body="true"
      :modal-append-to-body="true"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
        label-position="right"
        @submit.native.prevent
      >
        <el-form-item v-if="addForm.channelName" :label="$t('business.channelId')"><el-input v-model="addForm.channelName" disabled /></el-form-item>
        <el-form-item :label="$t('source.earningsRate')" prop="earningsRate">
          <section class="slider-input-wrapper">
            <el-input v-model.number="addForm.earningsRate" @change="handleSliderChange" @keyup.enter.native="handleClickSubmit" />
            <el-slider v-model.number="addForm.earningsRate" @change="handleSliderChange" />
          </section>
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
import { getRoutingList, updateRoutingStatus, setAllRoutings, setSingleRouting } from '@/api/source'
import { syncPages, parseEnumValue, parseMoney } from '@/utils'

export default {
  components: {
    StarlinkDatePicker
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        channelName: {},
        interfaceType: {
          type: 'enum',
          valueEnum: []
        },
        screenType: {
          type: 'enum',
          valueEnum: []
        },
        priceCost: {
          type: 'money'
        },
        priceLimit: {
          i18n: 'priceBase',
          type: 'money'
        },
        rateLimit: {},
        useStatus: {
          type: 'enum',
          colorEnum: ['danger', 'success', 'warning', 'danger'],
          valueEnum: []
        },
        handleMinSize: {},
        handleMaxSize: {},
        lastUpdateTime: {}
      },

      // page data
      pages: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      searchForm: {
        searchKey: '',
        screenType: '',
        interfaceType: ''
      },
      isLoading: false,
      tableData: [],
      current: {},
      screenTypes: [],
      interfaceTypes: [],

      // add dialog
      addDialogVisible: false,
      addForm: {
        earningsRate: 0
      },
      addFormRules: {
        earningsRate: [
          { required: true, message: this.$t('source.earningsRate') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  computed: {},
  watch: {
    addDialogVisible(val) {
      if (!val) {
        this.$refs.addFormRef.resetFields()
      }
    }
  },
  async created() {
    await this._getRoutingList()
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
      await getRoutingList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.screenType.valueEnum = parseEnumValue(res.data.params.EnumScreenType)
          this.screenTypes = res.data.params.EnumScreenType
          this.tableItemAttr.interfaceType.valueEnum = parseEnumValue(res.data.params.EnumScreenChannelType)
          this.interfaceTypes = res.data.params.EnumScreenChannelType
          this.tableItemAttr.useStatus.valueEnum = parseEnumValue(res.data.params.EnumUseStatus)
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },
    async _updateRoutingStatus() {
      await updateRoutingStatus(this.current.id, this.current.useStatus).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.statusChangeSuccess'))
        } else {
          this.$message.error(res.msg)
          this.current.useStatus = this.current.useStatus === 1 ? 2 : 1
        }
      })
    },
    _setAllRoutings() {
      const data = {
        earningsRate: this.addForm.earningsRate
      }
      setAllRoutings(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addLimitPriceSuccess'))
          this.$refs.addFormRef.resetFields()
          this.addDialogVisible = false
          this._getRoutingList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    _setSingleRouting() {
      const data = {
        quotationId: this.current.quotationId,
        earningsRate: this.addForm.earningsRate
      }
      setSingleRouting(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addLimitPriceSuccess'))
          this.$refs.addFormRef.resetFields()
          this.addDialogVisible = false
          this._getRoutingList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getRoutingList()
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
    hanleWaiterSelectVisible(val) {
      if (val) {
        this._getOperatorList()
      }
    },
    handleClickSetAll() {
      this.current = {}
      this.addForm = {
        earningsRate: 0
      }
      this.addDialogVisible = true
    },
    handleClickSetSingle(data) {
      this.current = data
      this.addForm.channelName = this.current.channelName
      this.addDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          if (this.addForm.channelName) {
            this._setSingleRouting()
          } else {
            this._setAllRoutings()
          }
        }
      })
    },
    handleSliderChange(val) {
      this.addForm.earningsRate = Math.round(val)
    }
  }
}
</script>

<style lang='scss' scoped>
.add-offer-dialog {
  .el-form {
    width: 25vw;

    .el-select {
      width: 100%;
    }

    .slider-input-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;

      ::v-deep.el-input {
        width: 50%;
      }

      .el-slider {
        width: 40%;
      }
    }
  }
}
</style>
