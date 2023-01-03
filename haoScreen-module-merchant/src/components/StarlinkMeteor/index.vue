<template>
  <div class="starlink-meteor">
    <div
      v-for="(star, index) in stars"
      :key="('star' + index)"
      class="meteor-item"
      :style="{
        height: star.length + 'px',
        top: star.position.top + 'px',
        left: star.position.left + 'px'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'StarlinkMeteor',
  data() {
    const minLength = 30
    const maxLength = 100
    const starCount = 8
    const viewWidth = window.visualViewport.width
    const viewHeight = window.visualViewport.height
    const viewHeightRate = 0.5

    const starItemAttr = {
      length: '',
      position: {
        top: '',
        left: ''
      }
    }
    const stars = []
    for (let i = 1; i <= starCount; i++) {
      const star = JSON.parse(JSON.stringify(starItemAttr))
      star.length = Math.floor(Math.random() * maxLength) + minLength
      star.position = {
        top: Math.floor(Math.random() * viewHeight * viewHeightRate),
        left: Math.floor(Math.random() * viewWidth)
      }
      stars.push(star)
    }
    return {
      stars: stars
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang='scss' scoped>
.starlink-meteor {
  position: absolute;
  height: 100vh;
  width: 100vw;
  z-index: 0;

  .meteor-item {
    width: 1px;
    height: 85px;
    background: linear-gradient(white, white .1, transparent 100%);
    position: absolute;
    top: 200px;
    left: 200px;
    transform: rotate(110deg);

    &::after {
      content: ' ';
      position: absolute;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      box-shadow: 0 0 30px 5px white;
      background: white;
      top: -5px;
      transform: translate(-1px);
    }
  }
}
</style>
