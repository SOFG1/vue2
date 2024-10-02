<script setup lang="ts">
import DatePicker from '@/components/DatePicker.vue'
import type { ModelValue } from '@vuepic/vue-datepicker'
import { ref, watch } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  title: string
  label: string
  placeholder: string
  buttonText: string
  initialValue?: string
  withDate?: Date | true
  validator?: (val: string) => string | void // Validator function for value
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', v: string, d?: Date): void
}>()

const inputRef = ref()
const name = ref<string>(props.initialValue || '')
const date = ref<ModelValue | undefined>(props.withDate instanceof Date ? props.withDate : undefined)

const onSubmit = () => {
  if (!name.value.trim()) return
  const error = props.validator && props.validator(name.value.trim())
  if (error) {
    toast(error, {
      autoClose: 3000,
      type: 'error'
    })
    return
  }
  if (props.withDate && date.value) {
    emit('submit', name.value, date.value as Date)
    return
  }
  emit('submit', name.value)
  name.value = ''
}

watch(
  inputRef,
  () => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  },
  { immediate: true }
)
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="$emit('close')" />
    <div class="content">
      <h1 class="title">{{ title }}</h1>
      <div class="form-group">
        <label for="name">{{ label }}</label>
        <input
          ref="inputRef"
          :placeholder="placeholder"
          class="tsai-input"
          type="text"
          id="name"
          v-model="name"
          @keydown.enter="onSubmit"
        />
      </div>
      <DatePicker v-if="withDate" v-model="date" :timePicker="true" class="date-picker" :minDate="new Date()" />
      <button :disabled="!name.trim()" class="tsai-button" @click="onSubmit">{{ buttonText }}</button>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.title {
  min-width: 450px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

@media screen and (max-width: 786px) {
  .title {
    min-width: 0;
  }
  .content {
    max-width: 410px;
    width: 100vw;
  }
}

@media screen and (max-width: 520px) {
  .title {
    min-width: 0;
  }
}

@media screen and (max-width: 520px) {
  .content {
    max-width: 100%;
  }
}
</style>
