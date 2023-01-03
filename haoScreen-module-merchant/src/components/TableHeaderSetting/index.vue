<template>
  <div class="table-settings">
    <el-popover
      trigger="click"
      placement="right"
      width="200"
    >
      <div class="settings-wrapper">
        <el-row class="settings-all-reset" type="flex" justify="space-between">
          <el-checkbox v-model="selectAll" :indeterminate="isIndeterminate" @change="handleSelectAllChange">{{ $t('tableSetting.all') }}</el-checkbox>
          <span @click="changeDefaultSettings">{{ $t('tableSetting.default') }}</span>
        </el-row>
        <el-checkbox-group v-model="checkedList" @change="handleCheckedChange">
          <!-- <el-checkbox v-for="(head, key) in tableHeaders" :key="'checkbox'+key" :label="head">{{ CONST[head] }}</el-checkbox> -->
          <el-checkbox v-for="(head, key) in tableHeaders" :key="'checkbox'+key" :label="head">{{ $t('tableSetting.' + head) }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <el-button slot="reference" class="table-setting" size="small" round type="info">
        <i class="el-icon-setting"></i>
        <span>{{ $t('tableSetting.setting') }}</span>
      </el-button>
    </el-popover>
  </div>
</template>

<script>
import HEADER_CONST from '@/utils/headers'

export default {
  name: 'TableHeaderSetting',
  props: {
    tableHeaders: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectAll: false,
      isIndeterminate: true,
      checkedList: [],
      CONST: HEADER_CONST
    }
  },
  computed: {},
  watch: {
    checkedList() {
      this.$emit('changeHeader', this.checkedList)
    }
  },
  created() {
    this.changeDefaultSettings()
  },
  mounted() {
  },
  methods: {

    handleSelectAllChange(val) {
      this.checkedList = val ? this.tableHeaders : []
      this.isIndeterminate = false
    },
    handleCheckedChange(val) {
      const checkCount = val.length
      this.selectAll = checkCount === this.tableHeaders.length
      this.isIndeterminate = checkCount > 0 && checkCount < this.tableHeaders.length
    },
    changeDefaultSettings() {
      this.handleSelectAllChange(this.tableHeaders)
      this.selectAll = true
    }
  }
}
</script>

<style lang='scss' scoped>
.table-setting {
  margin-right: 10px;
}

.settings-wrapper {
  display: flex;
  flex-direction: column;

  .settings-all-reset {
    padding: 10px;
    border-bottom: 1px solid #dfe4ed;
    span {
      cursor: pointer;
      color: #1890FF;
    }
  }

  .el-checkbox-group {
    display: flex;
    flex-direction: column;
    height: 200px;
    overflow-y: auto;

    .el-checkbox {
      padding: 5px 10px;
    }

  }
}
</style>
