<script setup lang="ts">
import InTitleAddButton from '@/components/InTitleAddButton.vue'
import LogoIconWithLoading from '@/components/LogoIconWithLoading.vue'
import ChatbotsList from '@/components/ChatbotsList.vue'
import type { Chatbot } from '@/types'
import { useRouter } from 'vue-router'
import { useChatbotsStore } from '@/stores/chatbots'
import { useUtilsStore } from '@/stores/utils'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useConversationsStore } from '@/stores/conversations'

const router = useRouter()

// Stores
const utilsStore = useUtilsStore()
const chatbotsStore = useChatbotsStore()
const conversationsStore = useConversationsStore()

const { ownChatbots, sharedChatbots }: { ownChatbots: Chatbot[]; sharedChatbots: Chatbot[] } =
  storeToRefs(chatbotsStore)

onMounted(async () => {
  utilsStore.isLoading = true
  await chatbotsStore.fetchChatbots()
  await chatbotsStore.fetchSharedChatbots()
  utilsStore.isLoading = false
})

function prepareChatbot(chatbot: Chatbot) {
  router.push({ name: 'home' })
  conversationsStore.prepareNewConversation(chatbot)
}
</script>
<template>
  <main class="tsai-view chatbots-view">
    <div class="tsai-view-header">
      <div class="view-title">
        <LogoIconWithLoading />
        <h1>{{ $t('chatbot.title') }}</h1>
        <InTitleAddButton @click="router.push({ name: 'chatbots-create' })" />
      </div>
      <p class="view-description">
        {{ $t('chatbot.description') }}
      </p>
    </div>

    <ChatbotsList @select="prepareChatbot" :is-loading="utilsStore.isLoading" :chatbots="ownChatbots" />

    <template v-if="sharedChatbots.length">
      <h2 style="margin-top: 32px">{{ $t('chatbot.shared-title') }}</h2>
      <p class="view-description">
        {{ $t('chatbot.shared-intro') }}
      </p>
      <div class="chatbot-selection">
        <ChatbotsList @select="prepareChatbot" :chatbots="sharedChatbots" :is-loading="utilsStore.isLoading" />
      </div>
    </template>
  </main>
</template>

<style scoped lang="scss">
.chatbots-view {
  max-width: 986px;
}

.chatbots-list {
  margin: 28px 0 0 0;
}
</style>
