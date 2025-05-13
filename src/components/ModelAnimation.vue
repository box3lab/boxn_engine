<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Scene, AbstractMesh, AnimationGroup, SceneLoader } from '@babylonjs/core';
import { BoxNextEngine } from '../scripts/babylon/framework/BoxNextEngine';

const props = defineProps<{
  modelUrl: string;
  animationName?: string;
  loop?: boolean;
  speed?: number;
}>();

const emit = defineEmits<{
  (e: 'loaded', mesh: AbstractMesh): void;
  (e: 'animationEnd'): void;
}>();

let currentMesh: AbstractMesh | null = null;
let currentAnimation: AnimationGroup | null = null;

const loadModel = async () => {
  const scene = BoxNextEngine.instance.getEngine()?.scenes[0];
  if (!scene) return;

  try {
    // 加载模型
    const result = await SceneLoader.ImportMeshAsync("", "", props.modelUrl, scene);
    currentMesh = result.meshes[0];
    
    // 获取动画组
    if (props.animationName) {
      const animationGroups = result.animationGroups;
      currentAnimation = animationGroups.find((anim: AnimationGroup) => anim.name === props.animationName) || null;
      
      if (currentAnimation) {
        currentAnimation.loopAnimation = props.loop ?? true;
        currentAnimation.speedRatio = props.speed ?? 1;
        currentAnimation.play();
        
        if (!props.loop) {
          currentAnimation.onAnimationEndObservable.add(() => {
            emit('animationEnd');
          });
        }
      }
    }
    
    if (currentMesh) {
      emit('loaded', currentMesh);
    }
  } catch (error) {
    console.error('Failed to load model:', error);
  }
};

// 监听属性变化
watch(() => props.animationName, (newAnim) => {
  if (currentAnimation) {
    currentAnimation.stop();
  }
  if (newAnim && currentMesh) {
    const scene = BoxNextEngine.instance.getEngine()?.scenes[0];
    if (!scene) return;
    
    const animationGroups = scene.animationGroups;
    currentAnimation = animationGroups.find((anim: AnimationGroup) => anim.name === newAnim) || null;
    
    if (currentAnimation) {
      currentAnimation.loopAnimation = props.loop ?? true;
      currentAnimation.speedRatio = props.speed ?? 1;
      currentAnimation.play();
    }
  }
});

watch(() => props.speed, (newSpeed) => {
  if (currentAnimation && newSpeed) {
    currentAnimation.speedRatio = newSpeed;
  }
});

watch(() => props.loop, (newLoop) => {
  if (currentAnimation) {
    currentAnimation.loopAnimation = newLoop ?? true;
  }
});

onMounted(() => {
  loadModel();
});

onBeforeUnmount(() => {
  if (currentAnimation) {
    currentAnimation.stop();
    currentAnimation.dispose();
  }
  if (currentMesh) {
    currentMesh.dispose();
  }
});
</script>

<template>
  <div class="model-container">
    <!-- 模型将通过Babylon.js渲染到场景中 -->
  </div>
</template>

<style scoped>
.model-container {
  width: 100%;
  height: 100%;
}
</style> 