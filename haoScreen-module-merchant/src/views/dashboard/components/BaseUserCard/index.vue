<template>
  <Card class="user-info-card">
    <div slot="header">
      <span class="card-title">{{ $t('dashboard.userInfo') }}</span>
    </div>
    <div class="card-info">
      <div v-if="registerCustomerUrlQr || registerMerchantUrlQr" class="info-qr">
        <div
          v-if="registerCustomerUrlQr"
          class="qr-wrapper"
          :class="registerMerchantUrlQr ? 'half-scale' : ''"
        >
          <img
            :src="registerCustomerUrlQr"
          >
          <span>{{ $t('dashboard.scanInvitationCustomer') }}</span>
        </div>

        <div
          v-if="registerMerchantUrlQr"
          class="qr-wrapper"
          :class="registerCustomerUrlQr ? 'half-scale right-img' : ''"
        >
          <img
            :src="registerMerchantUrlQr"
          >
          <span>{{ $t('dashboard.scanInvitationMerchant') }}</span>
        </div>
      </div>
      <div class="info-row">
        <span class="info-label">{{ $t('dashboard.email') }}</span>
        <span class="info-value">{{ email }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ $t('dashboard.nickName') }}</span>
        <span class="info-value">{{ nickName }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">{{ $t('dashboard.merchantName') }}</span>
        <span class="info-value">{{ merchantName }}</span>
      </div>
      <div v-if="invitationCode" class="info-row">
        <span class="info-label">{{ $t('dashboard.invitationCode') }}</span>
        <span class="info-value">
          <el-button type="text" @click="handleClickCopy(invitationCode)">{{ invitationCode }} <i class="el-icon-document-copy"></i></el-button>
        </span>
      </div>
      <div v-if="registerCustomerUrl" class="info-row">
        <span class="info-label">{{ $t('dashboard.registerCustomerUrl') }}</span>
        <span class="info-value">
          <el-button type="text" @click="handleClickCopy(registerCustomerUrl)">{{ $t('dashboard.registerUrl') }} <i class="el-icon-document-copy"></i></el-button>
        </span>
      </div>
      <div v-if="registerMerchantUrl" class="info-row">
        <span class="info-label">{{ $t('dashboard.registerMerchantUrl') }}</span>
        <span class="info-value">
          <el-button type="text" @click="handleClickCopy(registerMerchantUrl)">{{ $t('dashboard.registerUrl') }} <i class="el-icon-document-copy"></i></el-button>
        </span>
      </div>
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
import { getInvitationCode } from '@/api/user'

export default {
  name: 'BaseUserCard',
  components: { Card, PwdModify },
  data() {
    return {
      pwdDialogVisible: false,
      registerMerchantUrlQr: '',
      registerMerchantUrl: '',
      registerCustomerUrlQr: '',
      registerCustomerUrl: '',
      invitationCode: ''
    }
  },
  computed: {
    ...mapGetters([
      'createTime',
      'email',
      'lastLoginTime',
      'nickName',
      'merchantName',
      'showTips'
    ])
  },
  watch: {},
  created() {
    this.$store.dispatch('user/getInfo')
    if (this.showTips) {
      this.$confirm(this.$t('popMessage.passwordChangeTip'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.toModify'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.pwdDialogVisible = true
      }).catch(() => {
        this.$store.dispatch('user/hideTips')
      })
    }
  },
  mounted() {
    this._getInvitationCode()
  },
  methods: {
    // request
    _getInvitationCode() {
      getInvitationCode().then(res => {
        if (res.code === 200) {
          this.invitationCode = res.data.invitationCode
          this.registerCustomerUrl = res.data.registerCustomerUrl
          // this.registerMerchantUrl = res.data.registerMerchantUrl
          this.registerCustomerUrlQr = res.data.registerCustomerUrlQr
          // this.registerMerchantUrlQr = res.data.registerMerchantUrlQr
        }
      })
    },

    // handler
    handleClickModify() {
      this.pwdDialogVisible = true
    },
    handleClickCopy(text) {
      const save = (e) => {
        e.clipboardData.setData('text/plain', text)
        e.preventDefault()
      }
      const once = {
        once: true
      }
      document.addEventListener('copy', save, once)
      document.execCommand('copy')
      this.$notify({
        title: this.$t('common.tips'),
        type: 'success',
        message: this.$t('popMessage.copySuccess')
      })
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
    max-height: 70vh;
    overflow: auto;

    .info-qr {
      display: flex;
      justify-content: center;

      .qr-wrapper {
        width: 100%;
        height: 100%;
        text-align: center;
      }

      img {
        width: 100%;
      }

      .right-img {
        margin-left: 20px;
      }

      .half-scale {
        width: 40%;
      }
    }
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

        .el-button--text {
          padding: 0;
        }
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
