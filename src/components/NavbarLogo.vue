<script setup lang="ts">
import logoUrl from '@/assets/img/logo.svg?url'
import { useConversationsStore } from '@/stores/conversations';

const conversationsStore = useConversationsStore()


</script>

<template>
  <button class="logo" @click="conversationsStore.resetActiveConversation">
    <img :src="logoUrl" alt="logo" />
  </button>
</template>

<style scoped>
.logo {
  padding: 0;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  padding-left: 50px;
}

@media screen and (max-width: 786px) {
  .logo {
    display: none;
  }
}
</style>
