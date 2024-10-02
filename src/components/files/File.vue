<script setup lang="ts">
import PDFIcon from '@/assets/icons/pdf-icon.svg'
import PDFIconUrl from '@/assets/icons/pdf-icon.svg?url'
import { IndexingStatus, type FileUser } from '@/types'
import { Tippy } from 'vue-tippy'
import { useModal } from 'vue-final-modal'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { getData, storeData } from '@/utils/pdfIndexedDB'
import { useFilesStore } from '@/stores/files'
import MoveDirectoryModal from '@/components/modals/MoveDirectoryModal.vue'
import ActionButton from '@/components/ActionButton.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import NameModal from '@/components/modals/NameModal.vue'
import BadgeLabel from '@/components/BadgeLabel.vue'
import { useDraggableFilesUtils } from '@/composables/useDraggableFilesUtils'
import { formatDate } from '@vueuse/core'

const { t } = useI18n()

const props = defineProps<{ file: FileUser }>()

const { token } = useAuthStore()
const filesStore = useFilesStore()

const isDeleting = ref<boolean>(false)
const isLoading = ref<boolean>(false)

let tippyInstance: any

const { drag } = useDraggableFilesUtils()

const moveModal = useModal({
  component: MoveDirectoryModal,
  attrs: {
    title: 'Move file',
    text: 'Select location where you want to move the file.',
    parent_id: props.file.directory.id,
    onClose() {
      moveModal.close()
    },
    onMove(directory_id: string) {
      handleMove(directory_id)
      moveModal.close()
    }
  }
})

const openEditModal = () => {
  const editModal = useModal({
    component: NameModal,
    attrs: {
      title: t('files.files.edit_title'),
      label: t('files.files.edit_label'),
      placeholder: t('files.files.edit_placeholder'),
      buttonText: t('files.files.edit_btn'),
      initialValue: props.file.file_name,
      withDate: props.file.expires ? new Date(props.file.expires) : true,
      onClose() {
        editModal.close()
      },
      onSubmit(name: string, date?: Date) {
        isLoading.value = true
        editModal.close()
        filesStore.editFile(props.file.id, name, date).finally(() => {
          isLoading.value = false
        })
      }
    }
  })
  editModal.open()
}

const showConfirmDelete = async (file: FileUser) => {
  const modal = useModal({
    component: DeleteConfirmModal,
    attrs: {
      title: t('files.delete-modal.title'),
      text: t('files.delete-modal.description', { fileName: file.file_name }),
      processingMessage: t('files.delete-modal.processing'),
      isDeleting: isDeleting,
      onConfirm() {
        isDeleting.value = true
        filesStore
          .deleteFile(file.id)
          .then(() => {
            modal.close()
          })
          .catch((err) => {
            modal.close()
            toast(t('files.toasts.file-deletion-error'), {
              autoClose: 3000,
              type: 'error'
            })
          })
          .finally(() => {
            isDeleting.value = false
          })
      },
      onClose() {
        modal.close()
      }
    }
  })
  await modal.open()
}

const viewFile = async (fileUser: FileUser) => {
  isLoading.value = true
  const data = await getData(fileUser.id)
  //Show cached file if it exists
  if (data) {
    const documentUrl = URL.createObjectURL(data.blob)
    window.open(documentUrl, '_blank')
    URL.revokeObjectURL(documentUrl)
    isLoading.value = false
    return
  }
  //Fetch, cache and show the file if it doesn't exists
  const response = await axios.get(`/api/files/download/${fileUser.id}/${fileUser.file_name}`, {
    responseType: 'arraybuffer',
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const documentUrl = URL.createObjectURL(blob)
  window.open(documentUrl, '_blank')
  URL.revokeObjectURL(documentUrl)
  isLoading.value = false
  await storeData(fileUser.id, blob)
}

const reIndexFile = (file: FileUser) => {
  axios
    .patch(import.meta.env.VITE_TXAI_BACKEND_URL + '/api/files/' + file.id + '/reindex')
    .then((resp) => {
      toast(t('files.toasts.file-reindex-success', { fileName: file.file_name }), {
        autoClose: 3000,
        type: 'success'
      })
    })
    .catch((err) => {
      toast(t('files.toasts.file-reindex-error', { fileName: file.file_name }), {
        autoClose: 3000,
        type: 'error'
      })
      console.error(err)
    })
}

const handleMove = (directory_id: string) => {
  isLoading.value = true
  filesStore.moveFile(props.file.id, directory_id).finally(() => (isLoading.value = false))
}

const expireDate = computed(() => {
  return props.file.expires && formatDate(new Date(props.file.expires), 'YYYY-MM-DD h:mm A')
})
</script>

<template>
  <div class="file" :draggable="true" @dragstart="(e) => drag(e, props.file.id, 'move-file', props.file.directory.id)">
    <div class="file-header">
      <PDFIcon class="icon" />
      <p v-if="!isLoading" class="name">{{ file.file_name }}</p>
      <p v-if="isLoading" class="name">{{ t('files.files.loading') }}</p>
      <Tippy
        class="menu-wrapper"
        placement="bottom-start"
        :duration="0"
        :interactive="true"
        trigger="click"
        @create="tippyInstance = $event"
      >
        <button class="menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <template #content>
          <div class="menu-content" @click="tippyInstance.hide()">
            <ActionButton icon="preview" class="menu-btn" :text="t('files.files.preview')" @click="viewFile(file)" />
            <ActionButton icon="edit" class="menu-btn" :text="t('files.files.edit')" @click="openEditModal" />
            <ActionButton
              v-if="file.file?.indexing_status === IndexingStatus.FAILED"
              class="menu-btn"
              icon="redo"
              :text="t('files.files.reindex')"
              @click="reIndexFile(file)"
            />
            <ActionButton class="menu-btn" icon="move" text="Move" @click="moveModal.open" />
            <ActionButton
              icon="delete"
              class="menu-btn"
              :text="t('files.files.delete')"
              @click="() => showConfirmDelete(file)"
            />
          </div>
        </template>
      </Tippy>
    </div>
    <div class="logo" @click="viewFile(file)">
      <img :src="PDFIconUrl" alt="pdf icon" />
      <p v-if="file.expires" class="date">{{ expireDate }}</p>
      <BadgeLabel
        v-if="file.file?.indexing_status === IndexingStatus.INDEXED"
        class="status"
        :content="t('files.files.ready')"
        color="#27D175"
      />
      <BadgeLabel
        v-if="file.file?.indexing_status === IndexingStatus.PENDING"
        :content="t('files.files.indexing')"
        class="status"
        color="#FFA257"
      />
      <BadgeLabel
        v-if="file.file?.indexing_status === IndexingStatus.FAILED"
        :content="t('files.files.failed')"
        class="status"
        color="#E52B50"
      />
    </div>
  </div>
</template>

<style scoped>
.file {
  border-radius: 8px;
  padding: 10px 16px 16px;
  cursor: move;
  background: var(--color-folder-bg);
}

.file-header {
  display: flex;
  align-items: center;
  height: 32px;
  gap: 13px;
  margin-bottom: 10px;
  padding: 0 2px;
}

.icon {
  flex-shrink: 0;
}

.name {
  font-family: 'Mulish', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input {
  display: block;
  flex-grow: 1;
  min-width: 0;
  outline: 0;
}

.menu-wrapper {
  margin-left: auto;
}

.menu {
  height: 24px;
  width: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  padding: 3px 0;
}

.menu span {
  height: 4px;
  width: 4px;
  border-radius: 50%;
  background-color: var(--color-light-grey);
}

.menu-content {
  background-color: var(--color-background);
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 0 20px rgb(0, 0, 0, 0.2);
}

.menu-btn {
  display: flex;
  margin-bottom: 23px;
}

.menu-btn:last-child {
  margin-bottom: 0;
}

.logo {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 153px;
  background-color: var(--color-background);
  border-radius: 6px;
}

.status {
  position: absolute;
  right: 10px;
  bottom: 8px;
}

.date {
  color: var(--color-text-02);
  font-size: 10px;
  font-family: Mulish, sans-serif;
  position: absolute;
  font-size: 14px;
  left: 12px;
  bottom: 8px;
  margin: 0;
}

.logo img {
  height: 50px;
  width: 50px;
}
</style>
