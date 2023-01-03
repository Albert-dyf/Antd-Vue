<template>
  <el-container class="source-channel-wrapper common-container">
    <el-main class="source-channel-content common-body">
      <el-row>
        <el-form inline size="small">
          <starlink-date-picker v-if="false" :start-time.sync="searchForm.startTime" :end-time.sync="searchForm.endTime" />
          <el-form-item><el-input v-model="searchForm.searchKey" :placeholder="$t('search.searchKeyPlaceholder')" clearable /></el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.screenType" :placeholder="$t('select.screenTypePlaceholder')" clearable>
              <el-option v-for="screenType in screenTypes" :key="screenType.value" :label="screenType.name" :value="screenType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.interfaceType" :placeholder="$t('select.interfaceTypePlaceholder')" clearable>
              <el-option v-for="interfaceType in interfaceTypes" :key="interfaceType.value" :label="interfaceType.name" :value="interfaceType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item><el-button type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button></el-form-item>
        </el-form>
      </el-row>

      <el-row class="table-tool-bar">
        <el-button type="primary" size="small" @click="handleClickAdd">{{ '+ ' + $t('common.add') }}</el-button>
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
            :key="'channel' + attr"
            :prop="attr"
            :label="$t('source.' + attr)"
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
                {{ tableItemAttr[attr].valueEnum[scope.row[attr]].name }}
              </span><span v-else-if="tableItemAttr[attr].type === 'money'">
                {{ parseMoney(scope.row[attr]) }}
              </span>
              <span v-else>{{ scope.row[attr] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.option')">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClickEdit(scope.row)">{{ $t('common.edit') }}</el-button>
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
      :title="$t('source.addChannel')"
      width="40vw"
      custom-class="add-channel-dialog"
    >
      <el-form
        ref="addChannelFormRef"
        :model="addChannelForm"
        :rules="addChannelFormRules"
        label-width="120px"
        label-position="right"
      >
        <section v-for="attr in Object.keys(addChannelForm)" :key="'channelForm' + attr" class="form-item-wrapper">
          <el-form-item v-if="attr === 'screenType'" :label="$t('source.' + attr)" :prop="attr">
            <el-select v-model="addChannelForm.screenType" :placeholder="$t('select.screenTypePlaceholder')" clearable>
              <el-option v-for="screenType in screenTypes" :key="screenType.value" :label="screenType.name" :value="screenType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-else-if="attr === 'interfaceType'" :label="$t('source.' + attr)" :prop="attr">
            <el-select v-model="addChannelForm.interfaceType" :placeholder="$t('select.interfaceTypePlaceholder')" clearable>
              <el-option v-for="interfaceType in interfaceTypes" :key="interfaceType.value" :label="interfaceType.name" :value="interfaceType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-else-if="attr === 'providerId'" :label="$t('source.' + attr)" :prop="attr">
            <el-select v-model="addChannelForm.providerId">
              <el-option v-for="provider in providers" :key="provider.id" :label="provider.providerName" :value="provider.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-else :label="$t('source.' + attr)" :prop="attr">
            <el-input v-model="addChannelForm[attr]"></el-input>
          </el-form-item>
        </section>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>

    <!-- edit -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="$t('source.editChannel')"
      width="40vw"
      custom-class="edit-channel-dialog"
    >
      <el-form
        ref="editChannelFormRef"
        :model="editChannelForm"
        :rules="editChannelFormRules"
        label-width="120px"
        label-position="right"
      >
        <section v-for="attr in Object.keys(editChannelForm)" :key="'channelForm' + attr" class="form-item-wrapper">
          <el-form-item v-if="attr === 'screenType'" :label="$t('source.' + attr)" :prop="attr">
            <el-select v-model="editChannelForm.screenType" :placeholder="$t('select.screenTypePlaceholder')" clearable>
              <el-option v-for="screenType in screenTypes" :key="screenType.value" :label="screenType.name" :value="screenType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-else-if="attr === 'interfaceType'" :label="$t('source.' + attr)" :prop="attr">
            <el-select v-model="editChannelForm.interfaceType" :placeholder="$t('select.interfaceTypePlaceholder')" clearable>
              <el-option v-for="interfaceType in interfaceTypes" :key="interfaceType.value" :label="interfaceType.name" :value="interfaceType.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-else-if="attr === 'providerId'" :label="$t('source.' + attr)" :prop="attr">
            <el-select v-model="editChannelForm.providerId">
              <el-option v-for="provider in providers" :key="provider.id" :label="provider.providerName" :value="provider.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-else :label="$t('source.' + attr)" :prop="attr">
            <el-input v-model="editChannelForm[attr]"></el-input>
          </el-form-item>
        </section>
      </el-form>
      <el-footer slot="footer">
        <el-button @click="editDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleClickSubmitEdit">{{ $t('common.submit') }}</el-button>
      </el-footer>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import { getChannelList, getProviderList, addChannel, getChannelById, updateChannel, deleteChannel, updateChannelStatus } from '@/api/source'
import { syncPages, parseEnumValue, parseMoney, reverseMoney } from '@/utils'

export default {
  components: {
    StarlinkDatePicker
  },
  data() {
    return {
      // setup
      tableItemAttr: {
        channelName: {},
        screenType: {
          type: 'enum',
          valueEnum: []
        },
        providerName: {},
        priceCost: {
          type: 'money'
        },
        priceBase: {
          type: 'money'
        },
        interfaceType: {
          type: 'enum',
          valueEnum: []
        },
        useStatus: {
          type: 'switch'
        },
        handleMinSize: {},
        handleMaxSize: {},
        createTime: {}
      },

      // page data
      pages: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      searchForm: {
        interfaceType: '',
        screenType: '',
        searchKey: '',
        providerId: ''
      },
      isLoading: false,
      tableData: [],
      current: {},

      // add channel data
      addDialogVisible: false,
      addChannelForm: {
        channelName: '',
        providerId: '',
        interfaceType: null,
        screenType: null,
        priceCost: null,
        priceBase: null,
        handleMinSize: null,
        handleMaxSize: null,
        url: ''
      },
      addChannelFormRules: {
        channelName: [
          { required: true, message: this.$t('source.channelName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        providerId: [
          { required: true, message: this.$t('source.providerId') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        interfaceType: [
          { required: true, message: this.$t('source.interfaceType') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        screenType: [
          { required: true, message: this.$t('source.screenType') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        priceCost: [
          { required: true, message: this.$t('source.priceCost') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        priceBase: [
          { required: true, message: this.$t('source.priceBase') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        handleMinSize: [
          { required: true, message: this.$t('source.handleMinSize') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        handleMaxSize: [
          { required: true, message: this.$t('source.handleMaxSize') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        url: [
          { required: true, message: this.$t('source.url') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // edit channel data
      editDialogVisible: false,
      editChannelForm: {
        channelName: '',
        providerId: '',
        interfaceType: null,
        screenType: null,
        priceCost: null,
        priceBase: null,
        handleMinSize: null,
        handleMaxSize: null,
        url: ''
      },
      editChannelFormRules: {
        channelName: [
          { required: true, message: this.$t('source.channelName') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        providerId: [
          { required: true, message: this.$t('source.providerId') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        interfaceType: [
          { required: true, message: this.$t('source.interfaceType') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        screenType: [
          { required: true, message: this.$t('source.screenType') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        priceCost: [
          { required: true, message: this.$t('source.priceCost') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        priceBase: [
          { required: true, message: this.$t('source.priceBase') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        handleMinSize: [
          { required: true, message: this.$t('source.handleMinSize') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        handleMaxSize: [
          { required: true, message: this.$t('source.handleMaxSize') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ],
        url: [
          { required: true, message: this.$t('source.url') + this.$t('validator.isRequired'), trigger: ['blur', 'change'] }
        ]
      },

      // common data
      screenTypes: [],
      interfaceTypes: [],
      providers: []
    }
  },
  computed: {},
  watch: {
    addDialogVisible(val) {
      if (!val) {
        this.$refs.addChannelFormRef.resetFields()
      }
    }
  },
  async created() {
    await this._getChannelList()
  },
  mounted() {},
  methods: {
    // util
    parseMoney,

    // request
    async _getChannelList() {
      this.isLoading = true
      const param = {
        ...this.pages,
        ...this.searchForm
      }
      delete param.total
      await getChannelList(param).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.tableItemAttr.screenType.valueEnum = parseEnumValue(res.data.params.EnumScreenType)
          this.screenTypes = res.data.params.EnumScreenType
          this.tableItemAttr.interfaceType.valueEnum = parseEnumValue(res.data.params.EnumScreenChannelType)
          this.interfaceTypes = res.data.params.EnumScreenChannelType
          syncPages(this.pages, res)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.isLoading = false
    },
    async _getProviderList() {
      const param = {
        pageNumber: 1,
        pageSize: 100
      }
      getProviderList(param).then(res => {
        if (res.code === 200) {
          this.providers = res.data.rows
        }
      })
    },
    async _getChannelById() {
      getChannelById(this.current.id).then(res => {
        if (res.code === 200) {
          const data = res.data.object

          Object.keys(this.editChannelForm).forEach(key => {
            if (key === 'priceBase' || key === 'priceCost') {
              this.editChannelForm[key] = parseMoney(data[key])
            } else {
              this.editChannelForm[key] = data[key]
            }
          })
        }
      })
    },
    async _addChannel() {
      const data = { ...this.addChannelForm }
      data.priceBase = reverseMoney(this.addChannelForm.priceBase)
      data.priceCost = reverseMoney(this.addChannelForm.priceCost)
      addChannel(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.addChannelSuccess'))
          this.addDialogVisible = false
          this._getChannelList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _updateChannel() {
      const data = {
        ...this.editChannelForm,
        channelId: this.current.id
      }
      data.priceBase = reverseMoney(this.editChannelForm.priceBase)
      data.priceCost = reverseMoney(this.editChannelForm.priceCost)
      updateChannel(data).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.updateChannelSuccess'))
          this.editDialogVisible = false
          this._getChannelList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async _updateChannelStatus() {
      updateChannelStatus(this.current.id, this.current.useStatus).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.statusChangeSuccess'))
        } else {
          this.$message.error(res.msg)
          this.current.useStatus = this.current.useStatus === 1 ? 2 : 1
        }
      })
    },
    async _deleteChannel() {
      deleteChannel(this.current.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('popMessage.deleteSuccess'))
          this._getChannelList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // handler
    handleClickSearch() {
      this._getChannelList()
    },
    async handleClickAdd() {
      await this._getProviderList()
      this.addDialogVisible = true
    },
    async handleClickEdit(data) {
      this.current = data
      await this._getProviderList()
      await this._getChannelById()
      this.editDialogVisible = true
    },
    handleClickSubmit() {
      this.$refs.addChannelFormRef.validate(valid => {
        if (valid) {
          this._addChannel()
        }
      })
    },
    handleClickSubmitEdit() {
      this.$refs.editChannelFormRef.validate(valid => {
        if (valid) {
          this._updateChannel()
        }
      })
    },
    handleClickDelete(data) {
      this.current = data
    },
    handleConfirmDelete() {
      this._deleteChannel()
    },
    handleChangePageSize() {
      this._getChannelList()
    },
    hanldeChangeCurrentPage() {
      this._getChannelList()
    },
    handleStatusChange(data) {
      this.current = data
      this._updateChannelStatus()
    }
  }
}
</script>

<style lang='scss' scoped>
.source-channel-wrapper {

  .add-channel-dialog, .edit-channel-dialog {
    .el-form {
      width: 35vw;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .form-item-wrapper {
        width: 50%;
      }

      .el-form-item {
        .el-select {
          width: 100%;
        }
      }
    }
  }
}
</style>
