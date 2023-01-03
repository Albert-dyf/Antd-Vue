<template>
  <el-container class="account-setting-wrapper">
    <el-card class="setting-card">
      <el-tabs v-model="activeTab" tab-position="left">
        <el-tab-pane :label="$t('account.modifyPwd')" name="pwd">
          <el-form ref="pwdForm" :model="pwdForm" class="pwd-form" :rules="pwdFormRules">
            <el-form-item prop="password" :label="$t('account.oldPwd')">
              <el-input v-model="pwdForm.password"></el-input>
            </el-form-item>
            <el-form-item prop="passwordNew" :label="$t('account.newPwd')">
              <el-input v-model="pwdForm.passwordNew"></el-input>
            </el-form-item>
            <el-form-item prop="passwordNewRepeat" :label="$t('account.confirmPwd')">
              <el-input v-model="pwdForm.passwordNewRepeat"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleClickConfirm">{{ $t('common.confirm') }}</el-button>
              <el-button>{{ $t('common.cancel') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </el-container>
</template>

<script>
import JSEncrypt from 'jsencrypt'
import { getEncryptorPublicKey } from '@/api/commen-resource'
import { modifyUserPwd } from '@/api/account'
import { removeToken } from '@/utils/auth'

export default {
  data() {
    const pwdRegx = /^[a-zA-Z0-9~!@#$%^,._-]{6,18}$/
    const validatePwdN = (rule, value, callback) => {
      if (!pwdRegx.test(value)) {
        return callback(this.$t('account.pwdFormatError'))
      }

      if (value === this.pwdForm.password) {
        return callback(this.$t('account.pwdNSameAsOld'))
      }
      callback()
    }
    const validateConfirmPwd = (rule, value, callback) => {
      if (value !== this.pwdForm.passwordNew) {
        return callback(this.$t('account.pwdCNotSameAsNew'))
      }

      callback()
    }
    return {
      activeTab: 'pwd',
      pwdForm: {
        password: '',
        passwordNew: '',
        passwordNewRepeat: '',
        privateKeyId: ''
      },
      pwdFormRules: {
        password: [
          { required: true, message: this.$t('account.pwdRequired'), blur }
        ],
        passwordNew: [
          { required: true, message: this.$t('account.pwdNRequired'), blur },
          { validator: validatePwdN }
        ],
        passwordNewRepeat: [
          { required: true, message: this.$t('account.pwdCRequired'), blur },
          { validator: validateConfirmPwd }
        ]
      },
      publicKey: ''
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getEncryptorPublicKey()
  },
  mounted() {},
  methods: {
    async getEncryptorPublicKey() {
      const res = await getEncryptorPublicKey()
      if (res.code === 200) {
        this.pwdForm.privateKeyId = res.data.privateKeyId
        this.publicKey = res.data.publicKey
      }
    },
    async updateUserPwd(data) {
      console.log(data)
      const res = await modifyUserPwd(data)
      console.log(res)
      if (res.code === 200) {
        this.$message.success(this.$t('popMessage.passwordChangeSuccess'))
        this.$refs.pwdForm.resetFields()
        removeToken()
        this.$router.push('/')
      }
    },
    handleClickConfirm() {
      this.$refs.pwdForm.validate(valid => {
        if (valid) {
          const encryptor = new JSEncrypt()
          encryptor.setPublicKey(this.publicKey)
          const data = { ...this.pwdForm }
          data.password = encryptor.encrypt(this.pwdForm.password).toString()
          data.passwordNew = encryptor.encrypt(this.pwdForm.passwordNew).toString()
          data.passwordNewRepeat = encryptor.encrypt(this.pwdForm.passwordNewRepeat).toString()
          this.updateUserPwd(data)
        }
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.account-setting-wrapper {
  padding: 32px;
  .setting-card {
    background-color: white;
    width: 100%;

    .pwd-form {
      width: 20%;
      margin-left: 20px;
    }
  }
}
</style>
