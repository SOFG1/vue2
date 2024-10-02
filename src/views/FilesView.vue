<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Folders from '@/components/files/Folders.vue'
import Files from '@/components/files/Files.vue'
import FilesDirectory from '@/components/files/FilesDirectory.vue'
import { useFilesStore } from '@/stores/files'
import TextInput from '@/components/form/TextInput.vue'
import LogoIconWithLoading from '@/components/LogoIconWithLoading.vue'

const { t } = useI18n()

const filesStore = useFilesStore()

const searchQuery = ref<string>('')
</script>

<template>
  <main class="tsai-view files-view">
    <div class="view-title">
      <LogoIconWithLoading />
      <h1>{{ t('files.title') }}</h1>
    </div>
    <p class="view-description">
      {{ t('files.description') }}
    </p>
    <TextInput class="search" v-model="searchQuery" :placeholder="t('files.search-placeholder')" />
    <FilesDirectory />
    <p v-if="filesStore.isFetchingDirectory">Loading...</p>
    <template v-if="!filesStore.isFetchingDirectory">
      <Folders :searchQuery="searchQuery" />
      <Files :searchQuery="searchQuery" />
    </template>
  </main>
</template>

<style scoped>
.tsai-view {
  /* max-width: 1230px; */
  margin-bottom: 45px;
}
.view-title {
  margin-bottom: 8px;
}

.view-description {
  margin-top: 0;
  margin-bottom: 40px;
}
.search {
  margin-bottom: 40px;
}
</style>
