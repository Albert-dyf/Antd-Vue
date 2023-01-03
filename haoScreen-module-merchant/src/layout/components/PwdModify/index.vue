<template>
  <el-dialog
    :visible.sync="visible"
    :append-to-body="true"
    width="30vw"
    :title="$t('navbar.modifyPwd')"
  >
    <el-form
      ref="pwdForm"
      :model="pwdForm"
      class="pwd-form"
      :rules="pwdFormRules"
      size="small"
      label-width="120px"
      label-position="right"
    >
      <el-form-item prop="password" :label="$t('account.oldPwd')">
        <el-input v-model="pwdForm.password"></el-input>
      </el-form-item>
      <el-form-item prop="passwordNew" :label="$t('account.newPwd')">
        <el-input v-model="pwdForm.passwordNew"></el-input>
      </el-form-item>
      <el-form-item prop="passwordNewRepeat" :label="$t('account.confirmPwd')">
        <el-input v-model="pwdForm.passwordNewRepeat"></el-input>
      </el-form-item>
    </el-form>
    <el-footer slot="footer">
      <el-button @click="visible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleClickConfirm">{{ $t('common.confirm') }}</el-button>
    </el-footer>
  </el-dialog>
</template>

<script>
import JSEncrypt from 'jsencrypt'
import { getEncryptorPublicKey } from '@/api/commen-resource'
import { modifyPwd } from '@/api/user'

export default {
  name: 'PwdModify',
  props: {
    dialogVisible: {
      type: Boolean
    }
  },
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
      visible: false,
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
  watch: {
    dialogVisible(val) {
      this.visible = val
    },
    visible(val) {
      this.$emit('update:dialogVisible', val)
      if (!val) {
        this.$refs.pwdForm.resetFields()
      } else {
        this.getEncryptorPublicKey()
      }
    }
  },
  created() {
    this.getEncryptorPublicKey()
  },
  mounted() {},
  methods: {
    // request
    async getEncryptorPublicKey() {
      const res = await getEncryptorPublicKey()
      if (res.code === 200) {
        this.pwdForm.privateKeyId = res.data.privateKeyId
        this.publicKey = res.data.publicKey
      }
    },
    async updateUserPwd(data) {
      console.log(data)
      const res = await modifyPwd(data)
      console.log(res)
      if (res.code === 200) {
        this.$message.success(this.$t('popMessage.passwordChangeSuccess'))
        this.visible = false
        this.$refs.pwdForm.resetFields()
        this.$store.dispatch('user/logout')
      }
    },

    // handler
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
.el-form {
  width: 25vw;
}
</style>
