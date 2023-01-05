<template>
  <el-row class="dashboard-container" :gutter="32">
    <el-col :span="19">
      <data-analysis />
      <!-- <charts /> -->
    </el-col>
    <el-col :span="5">
      <base-user-card />
    </el-col>
  </el-row>
</template>

<script>
import BaseUserCard from './components/BaseUserCard'
import DataAnalysis from './components/DataAnalysis'
// import Charts from './components/Charts'

export default {
  name: 'Dashboard',
  components: {
    BaseUserCard,
    DataAnalysis
    // Charts
  },
  data() {
    return {
      userInfo: {}
    }
  },
  computed: {
  },
  created() {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 32px 0 32px 32px;
  background-color: rgb(240, 242, 245);
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
}
</style>
