<template>
  <el-container class="platform-license-wrapper">
    <el-card>
      <h1 class="license-title">免责条款</h1>
      <article class="license-body">
        <p class="article-intro">
          在访问和使用本平台服务前请务必阅读本声明并保证完全理解本声明所载明的一切条款。若您不认可本声明中的条款，可以选择立即停止使用本平台的所有服务。一旦您访问、使用了本平台，将视为您同意并接受了本声明的所有内容。
        </p>
        <p class="article-first">
          1.用户在使用本平台服务过程中须遵循以下内容：
        </p>
        <p class="article-second">
          (1) 遵守中华人民共和国有关的法律和法规；
        </p>
        <p class="article-second">
          (2) 遵守所有与本平台签订的协议、相关规定和程序，并提供真实、完整、有效的个人资料；
        </p>
        <p class="article-second">
          (3) 不得利用本平台服务进行任何可能对本平台的正常运转造成不利影响或对平台造成损失的行为；
        </p>
        <p class="article-second">
          (4) 不得利用本平台服务进行任何骚扰性的、中伤他人的、辱骂性的、恐吓性的、庸俗淫秽的或其他任何非法活动的行为；
        </p>
        <p class="article-second">
          (5) 不得利用本平台以任何方式侵犯公民个人信息，不能散布和传播反动、色情或其他违反国家法律的信息，不能传输获取任何教唆他人构成犯罪行为的资料，不能传输获取助长国内不利条件和涉及国家安全的资料，不能传输获取任何不符合中华人民共和国法律、法规、其他相关规定和国际法律的资料；
        </p>
        <p class="article-second">
          (6) 保证自身账户和密码的安全。如发现任何非法使用用户帐号或帐号出现安全漏洞的情况，应立即通告本平台。
        </p>
        <p class="article-first">
          如用户违反上述内容，本平台有权随时中断或终止部分或全部服务，对于所有服务的中断或终止造成的任何损失，平台无需对用户承担任何责任。用户对其自身行为承担一切法律责任。用户作出不当行为给本平台造成损失的，本平台保留追究其法律责任的权利。
        </p>
        <p class="article-first">
          2.鉴于本平台提供中立服务的性质，用户应对其使用检测样本的合法性来源及检测获取信息的合法性用途承担相应法律责任。本平台对用户行为的合法性概不负责，亦不承担任何法律责任。本平台对用户行为不作任何形式的、明示或默示的声明或担保。
        </p>
      </article>
    </el-card>
  </el-container>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang='scss' scoped>
.platform-license-wrapper {
  padding: 32px;
  .license-title {
    text-align: center;
  }

  .license-body {
    white-space: all;
    font-size: 14px;

    .article-intro {
      margin-left: 10px;
    }

    .article-first {
      margin-left: 10px;
    }

    .article-second {
      margin-left: 36px;
    }
  }
}
</style>
