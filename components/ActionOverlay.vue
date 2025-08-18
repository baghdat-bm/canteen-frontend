<template>
  <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-300 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
  >
    <div
        v-if="uiStore.isActionOverlayVisible"
        class="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-[9999]"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 flex items-center space-x-4">
        <BaseSpinnerMedium class="w-8 h-8" />
        <span class="text-lg text-gray-700">{{ uiStore.actionOverlayMessage }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui';
import BaseSpinnerMedium from '~/components/BaseSpinnerMedium.vue';

const uiStore = useUiStore();
</script>
