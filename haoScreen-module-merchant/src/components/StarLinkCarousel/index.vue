<template>
  <section class="star-link-carousel">
    <ul class="carousel-container">
      <li
        v-for="(svg, index) in svgs"
        :key="index"
        class="carousel-item"
        :class="svg.show ? 'visible-svg' : 'hidden-svg'"
      >
        <svg-icon :icon-class="svg.url"></svg-icon>
      </li>
    </ul>
  </section>
</template>

<script>
import { nextTick } from 'process'

export default {
  name: 'StarLinkCarousel',
  props: {
    svgNames: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      svgs: []
    }
  },
  computed: {},
  watch: {},
  async created() {
    await this.svgNames.forEach(item => {
      const svg = {
        url: item,
        show: false
      }
      this.svgs.push(svg)
    })
    this.svgs[0].show = true
  },
  mounted() {
    nextTick(() => {
      setInterval(this.transitionInterval, 3000)
    })
  },
  destroy() {
    clearInterval(this.transitionInterval)
  },
  methods: {
    transitionInterval() {
      const svgLength = this.svgs.length
      const curIndex = this.svgs.findIndex(item => {
        return item.show
      })
      // console.log(curIndex)
      let nextIndex
      if (curIndex < svgLength - 1) {
        nextIndex = curIndex + 1
      } else {
        nextIndex = 0
      }
      this.svgs[curIndex].show = false
      this.svgs[nextIndex].show = true
    }
  }
}
</script>

<style lang='scss' scoped>
  .star-link-carousel {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .carousel-container {
      display: flex;
      flex-direction: row;
      position: relative;
      width: 100%;
      min-height: 40vh;
      max-height: 60vh;

      .carousel-item {
        width: 100%;
        height: 100%;
        transition: opacity 1.5s ease;
        list-style: none;
        position: absolute;
        svg {
          width: 100%;
          height: 100%;
        }
      }

      .visible-svg {
        opacity: 1;
      }

      .hidden-svg {
        opacity: 0;
      }
    }
  }
</style>
