<template>
  <div class="login-container">
    <starlink-meteor v-if="false" />
    <div class="login-center-block">
      <div class="login-img" src="">
        <span class="title">银河数据检测</span>
        <span class="sub-title">商户端</span>
        <template v-if="false">
          <div class="circle-1"></div>
          <div class="circle-2"></div>
          <div class="circle-3"></div>
          <div class="circle-4"></div>
        </template>
        <svg-icon class="login-svg" icon-class="online_test"></svg-icon>
      </div>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

        <div class="title-container">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <lang-select class="set-language" />
        </div>

        <el-form-item prop="userName">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            ref="username"
            v-model="loginForm.userName"
            :placeholder="$t('login.username')"
            name="username"
            type="text"
            tabindex="1"
            auto-complete="on"
          />
        </el-form-item>

        <el-form-item prop="userPassword">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.userPassword"
            :type="passwordType"
            :placeholder="$t('login.password')"
            name="password"
            tabindex="2"
            auto-complete="off"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>

        <el-form-item prop="checkCode">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="checkCode"
            v-model="loginForm.checkCode"
            :placeholder="$t('login.checkCode')"
            tabindex="2"
            auto-complete="off"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="handleClickCheckCode">
            <img :src="checkCodeImg">
          </span>
        </el-form-item>

        <el-button
          :loading="loading"
          type="primary"
          style="width:100%;margin-bottom:30px;"
          :disabled="!isValidated"
          @click.native.prevent="handleLogin"
        >{{ $t('login.login') }}</el-button>

      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import LangSelect from '@/components/LangSelect'
import StarlinkMeteor from '@/components/StarlinkMeteor'
import { getCheckCode, getEncryptorPublicKey } from '@/api/commen-resource'
import JSEncrypt from 'jsencrypt'

export default {
  name: 'Login',
  components: {
    LangSelect,
    StarlinkMeteor
  },
  data() {
    return {
      loginForm: {
        userName: '',
        userPassword: '',
        checkCode: '',
        checkCodeId: '',
        privateKeyId: ''
      },
      loginRules: {
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      svgs: ['multitasking', 'content_team', 'team_up'],
      base64Pre: 'data:image/png;base64,',
      checkCodeBase64: '',
      publicKey: ''
    }
  },
  computed: {
    ...mapState({
      device: state => state.app.device
    }),
    isValidated() {
      return this.loginForm.userName !== '' && this.loginForm.userPassword !== '' && this.loginForm.checkCode !== ''
    },
    checkCodeImg() {
      return this.base64Pre + this.checkCodeBase64
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.formatCheckCode()
    this.getEncryptorPublicKey()
  },
  methods: {
    async formatCheckCode() {
      const res = await getCheckCode()
      // console.log(res)
      this.checkCodeBase64 = res.data.checkCodeBase64
      this.loginForm.checkCodeId = res.data.checkCodeId
    },
    async getEncryptorPublicKey() {
      const res = await getEncryptorPublicKey()
      this.loginForm.privateKeyId = res.data.privateKeyId
      this.publicKey = res.data.publicKey
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      if (this.isValidated) {
        const encryptor = new JSEncrypt()
        encryptor.setPublicKey(this.publicKey)
        this.loading = true
        console.log(this.loginForm)
        const params = { ...this.loginForm }
        params.userPassword = encryptor.encrypt(this.loginForm.userPassword).toString()
        this.$store.dispatch('user/login', params).then(() => {
          // validate password if need modify
          this.$store.dispatch('user/validatePwdNeedModify')
          this.$router.push({ path: '/' })
          this.loading = false
        }).catch(() => {
          this.loading = false
          this.formatCheckCode()
        })
      }
    },
    handleClickCheckCode() {
      this.formatCheckCode()
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#fff;
$light_gray:#889aa4;
$cursor: #000;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      // -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid $light_gray;
    background: white;
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#010D29;
$bg_mid: #001529;
$bg_bot: #5a5e66;
$dark_gray:#889aa4;
$light_gray:#5a5e66;
$red_blue_gradient: linear-gradient(45deg, #e66465, #9198e5); // 红蓝
$black_blue_gradiet: linear-gradient(45deg, #001528, #9198e5); // 黑蓝
$blue_black_gradiet: linear-gradient(45deg, #9198e5, #001528); // 蓝黑

.login-container {
  min-height: 100%;
  width: 100%;
  background: #F9F8F6;
  // background-image: $blue_black_gradiet;
  overflow: hidden;

  .login-center-block {
    border-radius: 10px;
    box-shadow: 0 0 10px 0px #ddddde;
    overflow: hidden;
    width: 40%;
    height: 100%;
    transform: translate(80%, 40%);
    display: flex;

    .login-img {
      position: relative;
      width:50%;
      // background-image: $red_blue_gradient;
      // background-image: $black_blue_gradiet;
      background-image: $blue_black_gradiet;

      .title, .sub-title {
        position: absolute;
        font-size: 20px;
        font-weight: bold;
        color: white;
      }

      .title {
        top: 20px;
        left: 10%;
      }

      .sub-title {
        bottom: 20px;
        right: 10%;
      }

      .login-svg {
        position: absolute;
        width: 56%;
        height: 200px;
        margin: 0 22%;
        top: 30%;
      }

      .circle-1, .circle-2, .circle-3, .circle-4 {
        position: absolute;
        width: 120px;
        height: 120px;
        top: 40px;
        left: 40px;
        border-radius: 50%;
        // box-shadow: 5px 5px 50px 0px #ddddde;
        background-image: $red_blue_gradient;
        // background-image: $black_blue_gradiet;
        // background-image: $blue_black_gradiet;
      }

      .circle-2 {
        width: 80px;
        height: 80px;
        top: 120px;
        left: 170px;
      }

      .circle-3 {
        width: 50px;
        height: 50px;
        top: 220px;
        left: 220px;
      }

      .circle-4 {
        width: 20px;
        height: 20px;
        top: 300px;
        left: 210px;
      }
    }
  }

  .login-form {
    background-color: white;
    padding: 45px;
    height: fit-content;
    width: 25vw;
    // border: 1px solid $dark_gray;
    border-radius: 0 10px 10px 0;
    // margin-top: 18vh;
    // box-shadow: 0 0 10px 0 white;
    z-index: 2;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #5a5e66;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
