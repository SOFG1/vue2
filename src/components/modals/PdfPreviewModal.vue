<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import PdfPreview from '@/components/PdfPreview.vue'
import LoadingSvg from '@/assets/img/loading.svg'

withDefaults(
  defineProps<{
    pdfTitle: string
    pdfSource: string
    isLoading: boolean
  }>(),
  {
    pdfTitle: '',
    // either URL/ObjectURL, Base64, binary, or document proxy
    pdfSource: '',
    isLoading: false
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="emit('close')" />
    <div class="content">
      <h1>{{ pdfTitle }}</h1>
      <small> Dummy Text </small>
      <div class="thinking" v-if="isLoading">
        <LoadingSvg />
      </div>
      <pdf-preview v-else :pdf-source="pdfSource" :filename="pdfTitle"></pdf-preview>
    </div>
  </VueFinalModal>
</template>

<style lang="scss">
.content {
  height: 100%;
}

.final-modal-content {
  width: 100%;
  height: 100%;
  max-width: 60vw;
}

.thinking {
  width: 100%;
  display: flex;
  padding: 1rem;
  align-items: center;
  justify-content: center;
}
</style>
