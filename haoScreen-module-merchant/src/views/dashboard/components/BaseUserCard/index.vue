<template>
  <Card class="user-info-card">
    <div slot="header">
      <span class="card-title">{{ $t('dashboard.userInfo') }}</span>
    </div>
    <div class="card-info">
      <div class="info-row">
        <span class="info-label">{{ $t('dashboard.email') }}</span>
        <span class="info-value">{{ email }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ $t('dashboard.nickName') }}</span>
        <span class="info-value">{{ nickName }}</span>
      </div>
      <!-- <div class="info-row">
        <span class="info-label">{{ $t('dashboard.mobile') }}</span>
        <span class="info-value">{{ mobile }}</span>
      </div> -->
      <!-- <div class="info-row">
        <span class="info-label">{{ $t('dashboard.balance') }}</span>
        <span class="info-value">{{ balance }}</span>
      </div> -->
      <div class="info-row">
        <span class="info-label">{{ $t('dashboard.createTime') }}</span>
        <span class="info-value">{{ createTime }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ $t('dashboard.lastLoginTime') }}</span>
        <span class="info-value">{{ lastLoginTime }}</span>
      </div>
    </div>
    <div class="card-footer">
      <el-button size="small" type="primary" @click="handleClickModify">{{ $t('account.modifyPwd') }}</el-button>
    </div>

    <pwd-modify :dialog-visible.sync="pwdDialogVisible" />
  </Card>
</template>

<script>
import { Card } from 'element-ui'
import { mapGetters } from 'vuex'
import PwdModify from '@/layout/components/PwdModify'

export default {
  name: 'BaseUserCard',
  components: { Card, PwdModify },
  data() {
    return {
      pwdDialogVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'createTime',
      'email',
      'lastLoginTime',
      'nickName'
    ])
  },
  watch: {},
  async created() {
    await this.$store.dispatch('user/getInfo')
  },
  mounted() {},
  methods: {
    handleClickModify() {
      this.pwdDialogVisible = true
    }
  }
}
</script>

<style lang='scss' scoped>
.user-info-card {
  margin-bottom: 32px;

  .card-title {
    font-size: 18px;
    font-weight: bold;
  }

  .card-info {
    height: 20vh;
    overflow: auto;
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 15px 0;

      .info-label {
        font-weight: 600;
        font-size: 14px;
      }

      .info-value {
        color: rgba(0,0,0,.65);
        font-size: 14px;
      }
    }
  }

  .card-footer {
    text-align: center;

    .el-button {
      width: 100%;
    }
  }
}
</style>
