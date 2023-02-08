<template>
  <el-container class="empty-detection-container">
    <el-header class="empty-detection-header">
      <el-form class="header-search-form" inline size="small" :model="searchForm">
        <starlink-date-picker
          :begin-time.sync="searchForm.startTime"
          :end-time.sync="searchForm.endTime"
          :reset.sync="isReset"
        />
        <el-form-item>
          <starlink-country-selector :country-code.sync="searchForm.countryCode" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.screenTypeId" :placeholder="$t('detection.typeFilter')" clearable>
            <el-option v-for="typeItem in screenTypes" :key="typeItem.id" :value="typeItem.id" :label="typeItem.typeName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.taskStatus" :placeholder="$t('detection.status')" clearable>
            <el-option value="0" :label="$t('common.all')">{{ $t('common.all') }}</el-option>
            <el-option value="1" :label="$t('common.ready')">{{ $t('common.ready') }}</el-option>
            <el-option value="2" :label="$t('common.doing')">{{ $t('common.doing') }}</el-option>
            <el-option value="3" :label="$t('common.done')">{{ $t('common.done') }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loadingTable" type="primary" @click="handleClickSearch">{{ $t('common.search') }}</el-button>
        </el-form-item>
      </el-form>
    </el-header>

    <el-main class="empty-detection-table">
      <el-button class="add-mission-btn" type="primary" size="small" @click="handleClickAdd">{{ $t('common.add') }}</el-button>
      <el-table v-loading="loadingTable" :data="tableData" stripe border>
        <el-table-column
          v-for="key in Object.keys(tableItemType)"
          :key="key"
          :prop="key"
          :label="$t('detection.' + tableItemType[key].text)"
          :align="tableItemType[key].align || 'center'"
          :width="tableItemType[key].width"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <section v-if="tableItemType[key].render">
              <starlink-progress
                v-if="tableItemType[key].render.type === 'process'"
                :text-inside="true"
                :show-text="true"
                :stroke-width="26"
                :percentage="(scope.row.activatedCount / scope.row.availableCount).toFixed(3) * 100 || 0"
                :text="scope.row.activatedCount + ' / ' + scope.row.availableCount"
              >
              </starlink-progress>
              <el-tag
                v-if="tableItemType[key].render.type === 'enums'"
                :type="tableItemType[key].render.valueEnums[scope.row.taskStatus]
                  ? tableItemType[key].render.valueEnums[scope.row.taskStatus].type : 'info'"
              >
                {{ tableItemType[key].render.valueEnums[scope.row.taskStatus]
                  ? tableItemType[key].render.valueEnums[scope.row.taskStatus].text
                  : $t('common.unknown') }}
              </el-tag>
            </section>
            <section v-else-if="key === 'amount'">{{ $t('common.dollarChar') + ' ' + parseMoney(scope.row[key]) }}</section>
            <section v-else>{{ scope.row[key] }}</section>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.option')" width="180px">
          <template slot-scope="scope">
            <el-button v-if="scope.row.taskStatus === 3" type="text" @click="handleClickDownload(scope.row.id)">{{ $t('common.download') }}</el-button>
            <el-button type="text" @click="handleClickDownloadSource(scope.row.id)">{{ $t('detection.sourceFile') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="detection-pagination"
        layout="sizes, prev, pager, next, jumper, ->, total"
        :total="pages.total"
        :current-page.sync="pages.pageNumber"
        :page-size.sync="pages.pageSize"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      ></el-pagination>
    </el-main>

    <el-dialog
      :visible.sync="addDialogVisible"
      :title="$t('detection.addMission')"
      custom-class="mission-dialog"
    >
      <el-form
        ref="missionForm"
        class="new-mission-form"
        label-width="80px"
        label-position="right"
        :model="missionForm"
        size="small"
        :rules="missionFormRules"
      >

        <!-- 选择国家进行文件上传 -->
        <!-- <el-form-item :label="$t('detection.countryFilter')" prop="countryCode">
          <starlink-country-selector ref="countrySelector" :country-code.sync="missionForm.countryCode" :country.sync="activeCountry" />
        </el-form-item> -->
        <!-- <el-form-item v-if="missionForm.countryCode" :label="$t('common.uploadFile')" prop="sourceFilePath">
          <el-upload
            ref="fileUploader"
            action="/prod-api/customer/api/haoScreen/module/customer/screen/manage/screen/task/upload"
            accept=".txt"
            :data="{
              countryCode: missionForm.countryCode
            }"
            :auto-upload="true"
            :multiple="false"
            :file-list="fileList"
            :limit="1"
            :on-success="uploadSuccess"
            :on-remove="removeFile"
            :before-upload="validateFileSize"
          >
            <el-button size="small" type="primary">{{ $t('common.chooseFile') }}</el-button>
            <div slot="tip">{{ $t('common.uploadTypeTip') + '，' + $t('common.fileSizeLimit10M') }}</div>
          </el-upload>
        </el-form-item> -->

        <!-- 上传文件之后，选择国家进行提交 -->
        <el-form-item :label="$t('common.uploadFile')" prop="sourceFilePath">
          <el-upload
            ref="fileUploader"
            action="/prod-api/customer/api/haoScreen/module/customer/screen/manage/screen/task/upload"
            accept=".txt"
            :auto-upload="true"
            :multiple="false"
            :limit="1"
            :on-success="uploadSuccess"
            :on-remove="removeFile"
            :before-upload="validateFileSize"
          >
            <el-button size="small" type="primary">{{ $t('common.chooseFile') }}</el-button>
            <div slot="tip">{{ $t('common.uploadTypeTip') + '，' + $t('common.fileSizeLimit10M') }}</div>
          </el-upload>
        </el-form-item>
        <el-form-item
          v-if="missionForm.sourceFilePath"
          v-loading="filtering"
          :element-loading-text="$t('detection.filtering')"
          element-loading-spinner="el-icon-loading"
          :label="$t('detection.countryFilter')"
          prop="countryCode"
          required
        >
          <el-tag
            v-for="country in countryFilter"
            :key="country.countryCode"
            effect="plain"
            class="country-filter-tags"
            @click="chooseCountryTag(country)"
          >
            <span>{{ country.countryNameZh + '(' + country.countryCode + ')' }}</span>{{ ' ' }}
            <i v-if="country.countryCode === activeCountry.countryCode" class="el-icon-circle-check"></i>
          </el-tag>
          <span v-show="(countryFilter.length === 0 && !filtering)" :style="{color: '#F56C6C'}">{{ $t('detection.countryFilterIsEmpty') }}</span>
          <span v-show="(countryFilter.length === 0 && filtering)" :style="{color: '#409EFF'}">{{ $t('detection.filtering') }}</span>
        </el-form-item>
        <el-form-item v-if="countryFilter.length > 0" :label="$t('detection.effective')" prop="availableCount">
          <el-input v-model="missionForm.availableCount" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('detection.typeFilter')" prop="screenTypeId" required>
          <el-select v-model="selectedType" class="form-type-select">
            <el-option
              v-for="option in screenTypes"
              :key="option.id"
              :value="option"
              :label="option.typeName"
              class="type-price-option"
            >
              <span class="option-text">{{ option.typeName }}</span>
              <span class="option-price">{{ $t('detection.price') + ' : ' + parseMoney(option.screenPrice) }}</span>
            </el-option>
          </el-select>
          <!-- <el-popover
            v-if="selectedType"
            placement="top"
            trigger="hover"
            :width="240"
          >
            <div class="type-price-detail">
              <span>{{ $t('detection.phoneCountRange') }}</span>
              <span>{{ $t('detection.price') }}</span>
            </div>
            <div v-for="(priceItem, index) of selectedType.prices" :key="'price' + index" class="type-price-detail">
              <span>[{{ priceItem.min + '-' + priceItem.max }}]</span>
              <span>{{ priceItem.price }}</span>
            </div>
            <i slot="reference" class="el-icon-info"></i>
          </el-popover> -->
          <span>{{ $t('detection.expectFee') }}</span> : <span :style="{color: '#F56C6C'}">{{ expectPrice || '-' }}</span>
        </el-form-item>
        <!-- <el-form-item :label="$t('common.remark')" prop="remark">
          <el-input v-model="missionForm.remark"></el-input>
        </el-form-item> -->
      </el-form>
      <el-row slot="footer">
        <el-button @click="addDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitMission">{{ $t('common.submit') }}</el-button>
      </el-row>
    </el-dialog>

    <el-dialog
      :title="$t('detection.missionNotice')"
      :visible.sync="noticeVisible"
      custom-class="notice-dialog"
    >
      <el-row>
        <el-col>
          <span>{{ $t('detection.countryFilter') }}：</span> <span>{{ activeCountry.countryNameZh }}</span>
        </el-col>
        <el-col>
          <span>{{ $t('detection.effective') }}：</span> <span>{{ missionForm.availableCount }}</span>
        </el-col>
        <el-col>
          <span>{{ $t('detection.expectFee') }}：</span> <span>{{ expectPrice }}</span>
        </el-col>
      </el-row>
      <el-row slot="footer">
        <el-button @click="noticeVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleConfirmNotice">{{ $t('common.submit') }}</el-button>
      </el-row>
    </el-dialog>
  </el-container>
</template>

<script>
import StarlinkDatePicker from '@/components/StarlinkDatePicker'
import StarlinkProgress from '@/components/StarlinkProgress'
import StarlinkCountrySelector from '@/components/StarlinkCountrySelector'
import { removeArrEmptyItem, parseMoney, parseBlob2File } from '@/utils/index'
import { formatCountryAndPhoneNumber } from './filter'
import { getDetectMissionRecord, addDetectMission, downloadTaskResultFile, downloadTaskSourceFile } from '@/api/detection'
import { getScreenType } from '@/api/commen-resource'

export default {
  components: {
    StarlinkDatePicker,
    StarlinkProgress,
    StarlinkCountrySelector
  },
  data() {
    const tableItemType = {
      countryNameZh: {
        text: 'country',
        width: '200px',
        align: 'left'
      },
      typeName: {
        text: 'typeFilter',
        align: 'left'
      },
      activatedCount: {
        text: 'effectiveAvailble',
        render: {
          type: 'process'
        },
        align: 'left'
      },
      amount: {
        text: 'amount',
        width: '180px'
      },
      createTime: {
        text: 'createTime',
        align: 'left',
        width: '180px'
      },
      taskStatus: {
        text: 'status',
        width: '180px',
        render: {
          type: 'enums',
          valueEnums: [
            {
              text: this.$t('common.unknown'),
              type: 'danger'
            },
            {
              text: this.$t('common.ready'),
              type: 'info'
            },
            {
              text: this.$t('common.doing'),
              type: ''
            },
            {
              text: this.$t('common.done'),
              type: 'success'
            }
          ]
        }
      }
    }

    const typeFilter = [
      {
        id: '1',
        text: '银河数据检测',
        prices: [
          {
            min: 0,
            max: 500000,
            price: 0.0028
          },
          {
            min: 500001,
            max: 2000000,
            price: 0.0026
          },
          {
            min: 2000001,
            max: 5000000,
            price: 0.0024
          }
        ]
      }
    ]

    return {
      // table atrr
      tableItemType: tableItemType,
      tableData: [],
      searchForm: {
        startTime: '',
        endTime: '',
        countryCode: '',
        taskStatus: null,
        screenTypeId: ''
      },
      pages: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      screenTypes: [],
      isReset: false,
      loadingTable: false,

      // dialog atrr
      missionForm: {
        sourceFilePath: '',
        countryCode: '',
        screenTypeId: '',
        availableCount: 0
      },
      missionFormRules: {
        countryCode: [
          { required: true, message: this.$t('detection.countryRequired'), trigger: ['blur', 'change'] }
        ],
        sourceFilePath: [
          { required: true, message: this.$t('detection.fileRequired'), trigger: ['blur', 'change'] }
        ],
        screenTypeId: [
          { required: true, message: this.$t('detection.typeRequired'), trigger: 'change' }
        ],
        availableCount: [
          { type: 'number', min: 1, message: this.$t('detection.effectiveError'), trigger: 'change' }
        ]
      },
      countryFilter: [],
      activeCountry: {},
      typeOption: typeFilter,
      selectedType: null,
      addDialogVisible: false,
      noticeVisible: false,
      fileSizeError: false,
      filtering: false
    }
  },
  computed: {
    expectPrice() {
      // if (this.activeCountry) {
      //   let amount = 0
      //   const effective = this.activeCountry.effective || 0
      //   const price = this.getRangePrice()
      //   amount = (price * effective).toFixed(4)
      //   return amount
      // } else {
      //   return null
      // }
      if (this.selectedType) {
        return parseMoney(this.selectedType.screenPrice * this.missionForm.availableCount)
      } else {
        return null
      }
    }
  },
  watch: {
    selectedType(val) {
      if (val) {
        this.missionForm.screenTypeId = val.id
      }
    },
    addDialogVisible(val) {
      if (!val) {
        this.$refs.missionForm.resetFields()
        this.$refs.fileUploader.clearFiles()
        // this.$refs.countrySelector.clearField()
        this.selectedType = null
        this.countryFilter = []
      }
    },
    countryFilter(val) {
      if (val.length > 0) {
        this.activeCountry = val[0]
      } else {
        this.activeCountry = {}
      }
    },
    activeCountry(val, pre) {
      // console.log('val', val)
      // console.log('pre', pre)
      // if (pre.countryCode && val !== pre) {
      //   this.$refs.fileUploader.clearFiles()
      //   this.removeFile()
      // } else {
      if (val.countryCode) {
        this.missionForm.countryCode = val.countryCode
        this.missionForm.availableCount = val.availableCount
      } else {
        this.missionForm.countryCode = null
        this.missionForm.availableCount = 0
      }
      // }
    }
  },
  async created() {
    await this.initData()
  },
  mounted() {},
  methods: {
    parseMoney,
    initData() {
      this.getDetectTask()
      this.getScreenTypes()
    },
    async getDetectTask() {
      this.loadingTable = true
      const params = {
        ...this.pages,
        ...this.searchForm
      }
      delete params.total
      await getDetectMissionRecord(params).then(res => {
        // console.log(res)
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.pages = {
            pageNumber: res.data.pageNumber,
            pageSize: res.data.pageSize,
            total: res.data.totalRows
          }
        } else {
          this.tableData = []
          this.resetPages()
        }
      })

      this.loadingTable = false
    },
    async getScreenTypes() {
      const res = await getScreenType()
      this.screenTypes = res.data
    },
    async addDetectTask() {
      const data = { ...this.missionForm }
      await addDetectMission(data).then(res => {
        // console.log(res)
        if (res.code === 200) {
          this.noticeVisible = false
          this.addDialogVisible = false
          this.$message.success(res.msg)
          this.getDetectTask()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleClickSearch() {
      this.getDetectTask()
    },
    handleClickAdd() {
      this.addDialogVisible = true
    },
    handleSubmitMission() {
      this.$refs['missionForm'].validate(valid => {
        if (valid) {
          this.noticeVisible = true
        }
      })
    },
    handleConfirmNotice() {
      this.addDetectTask()
    },
    async handleClickDownload(taskId) {
      // console.log('click download')
      await downloadTaskResultFile(taskId).then(res => {
        parseBlob2File(res)
      })
    },
    async handleClickDownloadSource(taskId) {
      // console.log('click download source')
      await downloadTaskSourceFile(taskId).then(res => {
        parseBlob2File(res)
      })
    },
    handlePageChange() {
      this.getDetectTask()
    },
    handlePageSizeChange() {
      this.getDetectTask()
    },
    chooseCountryTag(country) {
      this.activeCountry = country
      this.$refs.missionForm.validateField('countryCode')
    },
    uploadSuccess(res, file) {
      // console.log(res)
      if (res.code === 200) {
        this.missionForm.sourceFilePath = res.data.fileName
        this.$refs.missionForm.validateField('sourceFilePath')
        this.fileChange(file)
      } else {
        this.removeFile()
        this.$message(res.msg)
      }
    },
    fileChange(file) {
      this.filtering = true
      console.log(file)
      // this.filtering = true
      const that = this
      // this.missionForm.file = file
      // console.log(file)
      // this.$refs.missionForm.validateField('file', error => {
      // console.log(error)
      // if (!error) {
      const reader = new FileReader()
      reader.readAsText(file.raw)
      reader.onload = (e) => {
        let feedStr = '' // 换行符
        if (e.target.result.search('\r') !== -1) { // Mac/Windows txt文件 换行都有\r
          if (e.target.result.search('\n')) { // 仅有Windows txt文件 换行为\r\n
            feedStr = '\r\n' // Windows
          } else {
            feedStr = '\r' // Mac
          }
        } else {
          feedStr = '\n' // Unix/Linux
        }
        const fileArr = removeArrEmptyItem(e.target.result.split(feedStr))
        const noRepeatArr = new Set(fileArr)
        // console.log(typeof fileArr)
        // console.log(fileArr)
        // console.log(noRepeatArr)
        that.countryFilter = formatCountryAndPhoneNumber([...noRepeatArr])
        that.filtering = false
      }
      // }
      // })
    },
    removeFile() {
      this.missionForm.sourceFilePath = ''
      this.countryFilter = []
    },
    getRangePrice() {
      const effective = this.activeCountry.availableCount
      let price = 0
      if (this.selectedType) {
        this.selectedType.prices.forEach(priceItem => {
          if (effective >= priceItem.min && effective <= priceItem.max) {
            price = priceItem.price
            return price
          }
        })
      }
      return price
    },
    resetPages() {
      this.pages = {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      }
    },
    validateFileSize(file) {
      const size = 10
      if (file.size === 0) {
        this.$message.error(this.$t('detection.fileContentEmpty'))
        return false
      }
      if (file.size > 1024 * 1024 * size) {
        this.$message.error(this.$t('detection.fileSizeError'))
        return false
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.empty-detection-container{
  padding: 32px;
  position: relative;

  .empty-detection-header, .empty-detection-table {
    padding: 20px;
    padding-bottom: 0;
    background-color: white;
    height: fit-content !important;
  }

  .empty-detection-header {
    .header-search-form {
      .el-form-item {
        margin-bottom: 0 !important;
      }
    }
  }

  .empty-detection-table {
    padding-bottom: 20px;
    .el-table .cell {
      section {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .add-mission-btn {
      margin-bottom: 10px;
    }

    .detection-pagination {
      padding: 20px 0;

      ::v-deep .el-select {
        .el-input {
          margin: 0;
        }
      }
    }
  }

  ::v-deep .el-dialog.mission-dialog {
    width: 45% !important;
  }
  ::v-deep .el-dialog.notice-dialog {
    width: 20% !important;
    margin-top: 30vh !important;
  }

  .new-mission-form {
    width: 70%;
    .form-type-select {
      width: 100%;
    }

    .country-filter-tags {
      margin: 0 8px;
      cursor: pointer;

      .el-icon-circle-check {
        color: #67C23A;
        font-size: 14px;
      }
    }

    .el-icon-info {
      color: #409EFF;
      cursor: pointer;
      margin-right: 5px;
    }
  }

}
.el-select-dropdown{
  .type-price-option {
    display: flex;
    justify-content: space-between;
    .option-text {
      font-weight: 600;
    }

    .option-price {
      color: #F56C6C;
    }
  }
}

.el-popper {
  .type-price-detail {
      display: flex;
      justify-content: space-between;
    }
}
</style>
