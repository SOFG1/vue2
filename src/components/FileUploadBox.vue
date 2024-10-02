<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useDropZone } from '@vueuse/core'
import UploadSvgIcon from '@/assets/icons/upload.svg'
import axios from 'axios'
import { useConversationsStore } from '@/stores/conversations'
import { useI18n } from 'vue-i18n'
import ActionButton from '@/components/ActionButton.vue'

const i18n = useI18n()
// Stores
useConversationsStore()

const selectedFiles = ref<{ file: File; name: string; size: number; uploaded: boolean }[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref<boolean>(false)

const { isOverDropZone } = useDropZone(window.document.body, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()

function openFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const fileList = (event.target as HTMLInputElement).files
  if (fileList) {
    for (let i = 0; i < fileList.length; i++) {
      selectedFiles.value.push({
        file: fileList[i],
        name: fileList[i].name,
        size: fileList[i].size,
        uploaded: false
      })
    }
  }
  // Reset the input value to allow selecting the same file again
  ;(event.target as HTMLInputElement).value = ''
}

function onDrop(files: File[] | null) {
  if (files) {
    for (let i = 0; i < files.length; i++) {
      selectedFiles.value.push({
        file: files[i],
        name: files[i].name,
        size: files[i].size,
        uploaded: false
      })
    }
  }
}

function formatFileSize(size: number) {
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }

  return `${size.toFixed(2)} ${units[index]}`
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
  updateFileInput()
}

function updateFileInput() {
  const dataTransfer = new DataTransfer()
  selectedFiles.value.forEach((fileData) => dataTransfer.items.add(fileData.file))
  if (fileInput.value) {
    fileInput.value.files = dataTransfer.files
  }
}

async function uploadFiles() {
  for (const fileData of selectedFiles.value) {
    try {
      uploading.value = true
      const formData = new FormData()
      formData.append('file', fileData.file)
      await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast(i18n.t('files.toasts.file-upload-success', { fileName: fileData.name }), {
        type: 'success',
        autoClose: 4000
      })
      fileData.uploaded = true
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Error occurred'
      toast(i18n.t('files.toasts.file-upload-error', { fileName: fileData.name, errorMsg: message }), {
        type: 'error',
        autoClose: 4000
      })
    } finally {
      uploading.value = false
      emit('close')
    }
  }
}
</script>

<template>
  <div class="file-input-box">
    <div class="wrapper-file-input">
      <div @click="openFileInput" :class="['input-box', isOverDropZone ? 'over-dropzone' : '']">
        <h4 class="flex items-center">
          <UploadSvgIcon style="width: 20px; margin-right: 8px" /> {{ $t('files.upload-modal.file-drop-area-label') }}
        </h4>
        <input
          ref="fileInput"
          accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          type="file"
          hidden
          @change="handleFileChange"
          multiple
        />
      </div>
      <small>
        {{ $t('files.upload-modal.restrictions-label-file-types') }}<br />
        {{ $t('files.upload-modal.restrictions-label-file-size') }}
      </small>
    </div>

    <div class="wrapper-file-section">
      <div class="selected-files" v-if="selectedFiles.length">
        <h5>{{ $t('files.upload-modal.selected-files-label') }}</h5>
        <ul class="file-list" :style="selectedFiles.length ? 'max-height:220px' : 'height:auto'">
          <transition-group name="fade">
            <li v-for="(f, index) in selectedFiles" :class="['item', f.uploaded ? 'uploaded' : '']" :key="f.name">
              <span class="name"> {{ f.name }} ({{ formatFileSize(f.size) }}) </span>

              <ActionButton icon="delete" @click="removeFile(index)" />
            </li>
          </transition-group>
        </ul>
      </div>
    </div>
    <div class="button-section">
      <button class="tsai-button secondary" @click="emit('close')" role="button">
        {{ $t('files.upload-modal.cancel-action') }}
      </button>
      <button
        class="tsai-button primary"
        @click="uploadFiles"
        role="button"
        :disabled="uploading || selectedFiles.length === 0"
      >
        {{ uploading ? $t('files.upload-modal.uploading-label') : $t('files.upload-modal.upload-label') }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 4px;
  height: 6px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
  background-color: var(--color-files-scrollbar);
  border-radius: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.file-input-box {
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-radius: 10px;
  margin-top: 16px;
  //box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.2);
  min-width: 600px;
  height: auto;
  background-color: var(--color-background);
  //padding: 10px;
}

.file-list {
  overflow-y: auto;
  list-style-type: none;
  padding: 0;
  transition: 0.3s all ease-in-out;
  margin: 0 0 8px 0;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-light-grey);
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
}

.uploaded {
  border-color: var(--color-file-uploaded);
}

.button-section {
  display: flex;
  gap: 12px;
  margin: 0.25rem 0 0 auto;
}

.input-box {
  padding: 20px;
  min-height: 16vh;
  display: grid;
  place-items: center;
  border: 2px dashed var(--color-light-grey);
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;

  &.over-dropzone {
    border: 3px dashed var(--color-dark-grey);
    background-color: #e1e1e1;
  }

  h4 {
    margin: 0;
  }
}

small {
  display: inline-block;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-files-size-grey);
  margin-top: 6px;
}

h5 {
  margin: 4px 0;
}

@media screen and (max-width: 700px) {
  .file-input-box {
    width: auto;
  }
}

@media screen and (max-width: 700px) {
  .button-section {
    margin: 0 auto !important;
  }
}
</style>
