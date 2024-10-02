<script setup lang="ts">
import { computed } from 'vue'
import { useFilesStore } from '@/stores/files'
import type { FilesDirectory } from '@/types'
import { escapeRegExp } from '@/utils/escapeRegExp'
import Folder from '@/components/files/Folder.vue'

const props = defineProps<{ searchQuery: string }>()

const filesStore = useFilesStore()

const foldersList = computed<FilesDirectory[]>(() => {
  const query = escapeRegExp(props.searchQuery)
  return filesStore.currentDirectory?.children?.filter((f) => f.name.match(query)) || []
})
</script>

<template>
  <div v-if="foldersList.length" class="folders-list">
    <Folder v-for="folder in foldersList" :folder="folder" />
  </div>
</template>

<style scoped>
.folders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(252px, 1fr));
  gap: 16px 28px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--color-border-grey);
  margin-bottom: 24px;
}
</style>
