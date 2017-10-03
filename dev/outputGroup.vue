<template>
  <transition-group name="output-list" tag="div" >
    <output-line v-for="text in texts" :key="text.key" :text="text.data" class="output-list-item"></output-line>
  </transition-group>
</template>

<script>
import outputLine from './outputLine.vue'

export default {
  name: 'app',
  props: ['texts'],
  data: function() {
    return {
      loopHandler: null
    }
  },
  watch: {
    texts: function(newTexts) {
      if (newTexts.length === 0) {
        clearInterval(this.loopHandler)
        this.loopHandler = null
      } else {
        if (this.loopHandler === null) {
          this.loopHandler = setInterval(() => {
            this.texts.pop()
          }, 10 * 1000)
        }
      }
      if (newTexts.length > 20) {
        this.texts.pop()
      }
      this.$nextTick(() => {
        this.$emit('change')
      })
    }
  },
  components: {
    'output-line': outputLine
  }
}

</script>

<style>
.output-list-item {
  transition: all 1s;
}

.output-list-leave-active {
  position: absolute;
}

.output-list-enter {
  opacity: 0;
  transform: translateY(-30px);
}

.output-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}





/* .output-list-move {
  transition: transform 0.3s;
} */
</style>