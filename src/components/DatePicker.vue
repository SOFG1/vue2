<script setup lang="ts">
import VueDatePicker, { type ModelValue } from '@vuepic/vue-datepicker'

const model = defineModel<ModelValue>()
defineProps<{
  timePicker?: boolean
  minDate?: Date
}>()
</script>

<template>
  <VueDatePicker v-model="model" :enableTimePicker="timePicker" :minDate="minDate" class="date-picker"></VueDatePicker>
</template>

<style scoped lang="scss">
.date-picker {
  width: fit-content;
  margin-bottom: 20px;
}
</style>
