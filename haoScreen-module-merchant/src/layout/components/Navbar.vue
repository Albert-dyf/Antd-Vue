<template>
  <div class="navbar">
    <!-- <breadcrumb class="breadcrumb-container" /> -->
    <div>
      <hamburger v-if="device === 'mobile'" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
      <h2 class="sys-logo-title">{{ $t('common.title') }}</h2>
    </div>

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <lang-select class="right-menu-item hover-effect" />

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <!-- <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"> -->
          <i class="el-icon-user"></i>
          <span>{{ nickName || email }}</span>
          <!-- <i class="el-icon-caret-bottom" /> -->
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item @click.native="handleClickPwdModify">
            <span style="display:block;">{{ $t('navbar.modifyPwd') }}</span>
          </el-dropdown-item>
          <!-- <router-link to="/account/setting">
            <el-dropdown-item>
              {{ $t('navbar.profile') }}
            </el-dropdown-item>
          </router-link> -->
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <pwd-modify :dialog-visible.sync="pwdDialogVisible" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
// import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
// import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import PwdModify from './PwdModify'

export default {
  components: {
    // Breadcrumb,
    // Hamburger,
    Screenfull,
    // SizeSelect,
    LangSelect,
    PwdModify
  },
  data() {
    return {
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      pwdDialogVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'device',
      'language',
      'nickName',
      'email'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout', this.$router.fullPath)
    },
    handleClickPwdModify() {
      this.pwdDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
$TopHeaderBg: #001529;
// $blue_black_gradiet: linear-gradient(45deg, #9198e5, #001528); // 蓝黑
// $black_blue_gradiet: linear-gradient(45deg, #001528, #9198e5); // 黑蓝

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: $TopHeaderBg;
  // background-image: $black_blue_gradiet;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .sys-logo-title {
    margin-left: 20px;
    color: white;
    width: 20vw;
  }

  .hamburger-container {
    width: 54px;
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.25)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #ffffff;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(255, 255, 255, .1)
        }
      }
    }

    .api-item {
      font-size: 12px;
      font-weight: bold;
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        position: relative;
        font-size: 12px;
        display: flex;
        align-items: center;

        .el-icon-user {
          font-size: 20px;
          margin-right: 6px;
        }

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
