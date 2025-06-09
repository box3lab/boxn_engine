<script setup lang="ts">
import BabylonScene from './components/BabylonScene.vue'
</script>

<template>
  <div class="app-container">
    <BabylonScene />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  user-select: none;
}

/* 全局禁止选择样式 */
* {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

/* 禁止高亮选择 */
::selection {
  background: transparent;
}

::-moz-selection {
  background: transparent;
}
</style>
