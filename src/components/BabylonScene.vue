<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { BoxNextEngine } from '../scripts/babylon/framework/BoxNextEngine';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let testScene: any = null;

onMounted(() => {
  if (canvasRef.value) {
    BoxNextEngine.instance.initialize(canvasRef.value);
  }
});

onBeforeUnmount(() => {
  if (testScene) {
    testScene.dispose();
    testScene = null;
  }
});
</script>

<template>
  <div class="scene-container">
    <canvas ref="canvasRef" class="scene-canvas"></canvas>
  </div>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scene-canvas {
  width: 100%;
  height: 100%;
  outline: none;
  touch-action: none;
}
</style> 