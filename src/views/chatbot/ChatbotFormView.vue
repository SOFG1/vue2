<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LogoIcon from '@/assets/icons/logo-icon.svg'
import ChatbotPreviewBox from '@/components/ChatbotPreviewBox.vue'
import TxaiColorPicker from '@/components/form/TsaiColorPicker.vue'
import { useModal, type UseModalReturnType } from 'vue-final-modal'
import FileSelectorModal from '@/components/modals/FileSelectorModal.vue'
import { useChatbotsStore } from '@/stores/chatbots'
import type { Chatbot } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import TsaiCheckbox from '@/components/form/TsaiCheckbox.vue'
import { useI18n } from 'vue-i18n'
import { generateRandomColor } from '@/utils/generateRandomColor'
import ShareChatbot from '@/components/ShareChatbot.vue'

const { t } = useI18n()
// Stores & Router
const chatbotStore = useChatbotsStore()
const router = useRouter()
const route = useRoute()

// Form state
const chatbotId = ref<string>('')
const chatbotName = ref<string>('')
const description = ref<string>('')
const systemPrompt = ref<string>('')
const files = ref<string[] | File[]>([])
const color = ref<string>(generateRandomColor())
const citationMode = ref<boolean>(false)
// const icon = ref<string>('')

const isEditMode = computed(() => !!route.params.id)
const i18n = useI18n()
let modal: UseModalReturnType<any>

console.log(isEditMode.value)

onMounted(async () => {
  if (isEditMode.value) {
    chatbotId.value = route.params.id as string
    try {
      const chatbot = await chatbotStore.getChatbotById(chatbotId.value)
      if (chatbot) {
        chatbotName.value = chatbot.name
        description.value = chatbot.description
        systemPrompt.value = chatbot.system_prompt
        files.value = chatbot.files.map((f) => (typeof f === 'string' ? f : f.id))
        color.value = chatbot.color
        citationMode.value = chatbot.citations_mode
        // Set other fields as needed
      }
    } catch (error) {
      console.error('Failed to fetch chatbot:', error)
      // Handle error (e.g., show error message, redirect)
    }
  }
  modal = useModal({
    component: FileSelectorModal,
    attrs: {
      title: computed(() => i18n.t('chatbot.form.file-modal.title')),
      preselectedFiles: files.value as string[],
      onConfirm(selectedFiles) {
        files.value = selectedFiles
        modal.close()
      },
      onClose() {
        modal.close()
      }
    },
    slots: {
      default: '<small>' + i18n.t('chatbot.form.file-modal.description') + '</small>'
    }
  })
})

const isFormValid = computed(() => {
  return chatbotName.value && description.value && systemPrompt.value
})

// Function to handle form submission
const handleSubmit = async (event: Event) => {
  event.preventDefault()
  if (isFormValid.value) {
    const chatbot: Chatbot = {
      id: chatbotId.value,
      name: chatbotName.value,
      description: description.value,
      system_prompt: systemPrompt.value,
      files: files.value as string[],
      color: color.value,
      citations_mode: citationMode.value,
      icon: 'default'
    }

    try {
      if (isEditMode.value) {
        await chatbotStore.updateChatbot(chatbot)
      } else {
        await chatbotStore.createChatBot(chatbot)
      }
      await router.push({ name: 'chatbots-list' })
    } catch (error) {
      console.error(`Failed to ${isEditMode.value ? 'update' : 'create'} chatbot:`, error)
      // Handle error (e.g., show error message)
    }
  }
}
</script>

<template>
  <main class="create-chatbot-view">
    <div class="view-title">
      <LogoIcon class="logo-icon" />
      <h1 v-if="!isEditMode">{{ $t('chatbot.create-title') }}</h1>
      <h1 v-else>{{ $t('chatbot.edit-title') }}</h1>
    </div>
    <p class="view-description">
      {{ $t('chatbot.form.intro') }}
    </p>

    <div class="form">
      <div class="first-col">
        <div class="form-group">
          <label for="chatbotName">{{ $t('chatbot.form.name-label') }}</label>
          <input
            class="tsai-input"
            type="text"
            id="chatbotName"
            v-model="chatbotName"
            :placeholder="t('chatbot.form.name-placeholder')"
          />
        </div>

        <div class="form-group">
          <label for="description">{{ $t('chatbot.form.description-label') }}</label>
          <textarea
            class="tsai-input"
            id="description"
            v-model="description"
            :placeholder="t('chatbot.form.description-placeholder')"
          ></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 32px">
          <label for="systemPrompt">{{ $t('chatbot.form.system-prompt-label') }}</label>
          <textarea
            class="tsai-input"
            id="systemPrompt"
            v-model="systemPrompt"
            style="min-height: 180px"
            :placeholder="t('chatbot.form.system-prompt-placeholder')"
          ></textarea>
        </div>

        <div class="files-buttons">
          <button class="tsai-button with-icon file-select-button" role="button" type="button" @click="modal.open">
            <i class="gg-file-document"></i>{{ $t('chatbot.form.connect-files') }}
          </button>
          <p>{{ $t('chatbot.form.connected-files', files.length) }}</p>
        </div>

        <!--<multiselect v-model="testVal" :options="test" :multiple="true" :close-on-select="false"
                       :clear-on-select="false"
                       :preserve-search="true" placeholder="Wähle Dateien aus für den Kontext" label="name"
                       track-by="name"
          >
            <template #selection="{ values, search, isOpen }">
              <span class="multiselect__single"
                    v-if="values.length"
                    v-show="!isOpen">{{ values.length }} Dateien ausgewählt</span>
            </template>
</multiselect>
<p>
  Ausgewählt:<br><br>
  <span v-bind:key="v" v-for="v in testVal">{{ v.name }}<br /></span>
</p>-->

        <div class="btn-box">
          <button
            class="tsai-button primary large"
            role="button"
            type="submit"
            :disabled="!isFormValid"
            @click="handleSubmit"
          >
            {{ isEditMode ? $t('chatbot.form.save-action') : $t('chatbot.form.create-action') }}
          </button>
          <button
            class="tsai-button secondary large"
            role="button"
            type="button"
            @click="router.push({ name: 'chatbots-list' })"
          >
            {{ $t('chatbot.form.cancel-action') }}
          </button>
        </div>
      </div>

      <div class="second-col">
        <div class="form-group" style="margin-bottom: 20px">
          <label>{{ $t('chatbot.form.preview-label') }}</label>
          <ChatbotPreviewBox :color="color" :title="chatbotName" :description="description" />
        </div>

        <div class="form-group" style="margin-bottom: 20px">
          <TxaiColorPicker v-model="color" />
        </div>

        <div class="form-group">
          <label style="margin-bottom: 0">{{ $t('chatbot.form.citation-mode-label') }}</label>
          <small>{{ $t('chatbot.form.citation-mode-description') }}</small>
          <TsaiCheckbox style="margin-top: 0.5rem" title="Ein" v-model="citationMode" />
        </div>

        <ShareChatbot v-if="isEditMode" />
        <!--<div class="form-group">
          <label for="icon">Icon</label>
          <input type="text" id="icon" v-model="icon" placeholder="Icon URL" />
        </div>-->
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@import '@/assets/mixins';

.form {
  display: flex;
  justify-content: space-between;
  gap: 100px;
  margin-top: 18px;
  max-width: 1110px;
}

.first-col {
  flex-grow: 1;
  max-width: 644px;
}

.second-col {
  width: 234px;
  max-width: 234px;
}

.second-col .chatbot-preview-box {
  width: 100%;
}

.tsai-button {
  min-width: 103px;
  margin-right: 12px;
}

.files-buttons {
  display: flex;
  align-items: center;
  font-family: Mulish, sans-serif;
  margin-bottom: 32px;
}

.files-buttons p {
  margin-left: 6px;
  white-space: nowrap;
}

.files-buttons button {
  flex-shrink: 0;
  white-space: nowrap;
}

.file-select-button {
  background: linear-gradient(225deg, rgba(75, 32, 247, 1) 1.38%, rgba(169, 0, 247, 1) 98.62%);
  padding: 14px 27px;
  font-weight: 600;
  font-family: Mulish, sans-serif;

  @include gradientAnimation(
    linear-gradient(225deg, rgba(75, 32, 247, 0.88) 1.38%, rgba(169, 0, 247, 0.88) 98.62%),
    linear-gradient(225deg, rgba(75, 32, 247, 1) 1.38%, rgba(169, 0, 247, 1) 98.62%),
    0.4s
  );
}

@media screen and (max-width: 1080px) {
  .form {
    flex-direction: column;
    gap: 14px;
  }
}

@media screen and (max-width: 786px) {
  .form-group {
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 500px) {
  .second-col {
    width: 100%;
    max-width: 100%;
  }

  .form {
    margin-top: 10px;
  }

  .files-buttons {
    flex-direction: column-reverse;
    gap: 20px;
    align-items: flex-start;
  }
  .files-buttons p {
    margin-left: 0;
  }
}
</style>
