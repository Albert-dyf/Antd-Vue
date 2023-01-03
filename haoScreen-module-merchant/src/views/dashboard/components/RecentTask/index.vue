<template>
  <Card class="recent-task-wrapper" shadow="hover" @click.native="handleClickWrapper">
    <div slot="header">
      <span class="card-title">{{ $t('dashboard.recentTask') }}</span>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData"
      height="78vh"
    >
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
              :percentage="((scope.row.activatedCount / scope.row.availableCount).toFixed(3) * 100 || 0)"
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
          <section v-else>{{ scope.row[key] }}</section>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.option')">
        <template slot-scope="scope">
          <el-button v-if="scope.row.taskStatus === 3" type="text" @click.stop="handleClickDownload(scope.row.id)">{{ $t('common.download') }}</el-button>
          <el-button type="text" @click.stop="handleClickDownloadSource(scope.row.id)">{{ $t('detection.sourceFile') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </Card>
</template>

<script>
import { Card } from 'element-ui'
import StarlinkProgress from '@/components/StarlinkProgress'
import { getDetectMissionRecord, downloadTaskResultFile, downloadTaskSourceFile } from '@/api/detection'
import { parseBlob2File } from '@/utils/index'

export default {
  name: 'RecentTask',
  components: {
    Card,
    StarlinkProgress
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
      screenStartTime: {
        text: 'createTime',
        width: '180px',
        align: 'left'
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
    return {
      tableItemType: tableItemType,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        taskStatus: 3
      },
      tableData: [],
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
    initData() {
      this.getRecentDetection()
    },
    async getRecentDetection() {
      this.loading = true
      const res = await getDetectMissionRecord(this.searchParams)
      this.tableData = res.data.rows
      // for (let i = 0; i < 10; i++) {
      //   this.tableData = [...this.tableData, ...res.data.rows]
      // }
      this.loading = false
    },
    handleClickWrapper() {
      // console.log('click wrapper')
      this.$router.push('/detection/list')
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
    }
  }
}
</script>

<style lang='scss' scoped>
.recent-task-wrapper {
  cursor: pointer;

  .card-title {
    font-size: 18px;
    font-weight: bold;
  }
}

</style>
