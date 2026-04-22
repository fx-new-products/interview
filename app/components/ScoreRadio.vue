<template>
  <div class="q-score" role="radiogroup">
    <button
      v-for="n in 4"
      :key="n"
      type="button"
      class="q-score-circle"
      :class="{ active: modelValue === n }"
      :aria-checked="modelValue === n"
      role="radio"
      :title="`${n}点`"
      @click="$emit('update:modelValue', modelValue === n ? null : n)"
    >
      <span v-if="modelValue !== null && n <= modelValue" class="dot" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: number | null }>()
defineEmits<{ 'update:modelValue': [value: number | null] }>()
</script>

<style scoped>
.q-score {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-top: 3px;
}
.q-score-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s;
}
.q-score-circle:hover {
  border-color: #52b788;
}
.q-score-circle.active {
  border-color: #2d6a4f;
  background: #e8f5ee;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2d6a4f;
}
@media print {
  .q-score-circle {
    border-color: #999 !important;
    background: white !important;
  }
  .q-score-circle.active {
    background: #2d6a4f !important;
  }
  .q-score-circle.active .dot {
    background: white;
  }
}
</style>
