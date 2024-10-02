<script setup lang="ts">
const props = withDefaults(defineProps<{
  color?: string,
  content: string
}>(), {
  color: '#D9D9D9'
})
</script>

<template>
  <div class="badge" :style="{ backgroundColor: color }">
    {{ content }}
  </div>
</template>

<style scoped lang="scss">
.badge {
  display: inline-block;
  color: var(--color-text-secondary);
  border-radius: 33px;
  font-weight: 500;
  padding: 2px 6px;
  border: 0;
  font-size: 0.85rem;
}
</style>