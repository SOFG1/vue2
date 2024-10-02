import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'
import { toast } from 'vue3-toastify'
import type { Chatbot } from '@/types'
import i18n from '@/i18n'

export const useChatbotsStore = defineStore('chatbots', () => {
  const ownChatbots = ref<Chatbot[]>([])
  const sharedChatbots = ref<Chatbot[]>([])
  const allChatbots = computed(() => ownChatbots.value.concat(sharedChatbots.value) || [])

  //This function updates chatbot if it exists, if not adds it
  function refreshChatbot(chatbot: Chatbot) {
    const index = ownChatbots.value.findIndex((c) => c.id === chatbot.id)
    if (index >= 0) {
      ownChatbots.value[index] = chatbot
    }
    if (index < 0) {
      ownChatbots.value.push(chatbot)
    }
  }

  async function fetchChatbots() {
    try {
      const response = await axios.get<Chatbot[]>('/api/chatbots')
      ownChatbots.value = response.data
    } catch (error) {
      toast(i18n.global.t('chatbot.toasts.error-fetching-chatbots'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching chatbots:', error)
    }
  }

  async function fetchSharedChatbots() {
    try {
      const response = await axios.get<Chatbot[]>('/api/chatbots/shared')
      sharedChatbots.value = response.data
    } catch (error) {
      toast(i18n.global.t('chatbot.toasts.error-fetching-chatbots'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching shared chatbots:', error)
    }
  }

  async function getChatbotById(uuid: string): Promise<Chatbot | null> {
    try {
      const response = await axios.get<Chatbot>(`/api/chatbots/${uuid}`)
      const chatbot = response.data
      refreshChatbot(chatbot)
      return chatbot
    } catch (error) {
      let errorMessage
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          errorMessage = i18n.global.t('chatbot.toasts.chatbot-not-found', { uuid: uuid })
        } else {
          errorMessage =
            error.response?.data.message || error.message || i18n.global.t('chatbot.toasts.chatbot-loading-failed')
        }
      } else {
        errorMessage = i18n.global.t('chatbot.toasts.chatbot-loading-failed')
        console.error('An unexpected error occurred while fetching chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
      return null
    }
  }

  async function createChatBot(chatbot: Chatbot) {
    try {
      const response = await axios.post('/api/chatbots', chatbot)
      refreshChatbot(response.data)
    } catch (error) {
      let errorMessage
      if (error instanceof AxiosError && error.response) {
        console.error('Error creating chatbot:', error.response.data.message || error.message)
        errorMessage = error.response.data.message || error.message || 'Error creating chatbot'
      } else {
        errorMessage = 'An unexpected error occurred while creating chatbot'
        console.error('An unexpected error occurred while creating chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function updateChatbot(chatbot: Chatbot): Promise<Chatbot | null> {
    try {
      const chatbotData = { ...chatbot }
      delete chatbotData.id
      const response = await axios.patch<Chatbot>(`/api/chatbots/${chatbot.id}`, chatbotData)
      refreshChatbot(response.data)
      return response.data
    } catch (error) {
      let errorMessage
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          errorMessage = `Chatbot with ID ${chatbot.id} not found`
          console.error(`Chatbot with ID ${chatbot.id} not found`)
        } else {
          console.error('Error updating chatbot:', error.response?.data.message || error.message)
          errorMessage = error.response?.data.message || error.message || 'Error updating chatbot'
        }
      } else {
        errorMessage = 'An unexpected error occurred while updating chatbot'
        console.error('An unexpected error occurred while updating chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
      return null
    }
  }

  async function shareChatBotUser(chatBotId: string, userId: string) {
    try {
      const response = await axios.post(`/api/chatbots/${chatBotId}/user/${userId}`)
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.share-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage
      if (error instanceof AxiosError && error.response) {
        console.error('Error sharing chatbot:', error.response.data.message || error.message)
        errorMessage = error.response.data.message || error.message || 'Error sharing chatbot'
      } else {
        errorMessage = 'An unexpected error occurred while sharing chatbot'
        console.error('An unexpected error occurred while sharing chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function shareChatBotGroup(chatBotId: string, groupId: string) {
    try {
      const response = await axios.post(`/api/chatbots/${chatBotId}/group/${groupId}`)
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.share-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage
      if (error instanceof AxiosError && error.response) {
        console.error('Error sharing chatbot:', error.response.data.message || error.message)
        errorMessage = error.response.data.message || error.message || 'Error sharing chatbot'
      } else {
        errorMessage = 'An unexpected error occurred while sharing chatbot'
        console.error('An unexpected error occurred while sharing chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function unshareChatBotUser(chatBotId: string, userId: string) {
    try {
      const response = await axios.delete(`/api/chatbots/${chatBotId}/user/${userId}`)
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.unshare-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage = ''
      if (error instanceof AxiosError && error.response) {
        console.error('Error unsharing chatbot:', error.response.data.message || error.message)
        errorMessage = error.response.data.message || error.message || ''
      } else {
        console.error('An unexpected error occurred while unsharing chatbot:', error)
      }
      toast(i18n.global.t('chatbot.toasts.unshare-chatbot-error') + ' ' + errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function unshareChatBotGroup(chatBotId: string, groupId: string) {
    try {
      const response = await axios.delete(`/api/chatbots/${chatBotId}/group/${groupId}`)
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.unshare-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage = ''
      if (error instanceof AxiosError && error.response) {
        console.error('Error unsharing chatbot:', error.response.data.message || error.message)
        errorMessage = error.response.data.message || error.message || ''
      } else {
        console.error('An unexpected error occurred while unsharing chatbot:', error)
      }
      toast(i18n.global.t('chatbot.toasts.unshare-chatbot-error') + ' ' + errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  return {
    ownChatbots,
    sharedChatbots,
    allChatbots,
    fetchChatbots,
    fetchSharedChatbots,
    createChatBot,
    getChatbotById,
    updateChatbot,
    shareChatBotUser,
    unshareChatBotUser,
    shareChatBotGroup,
    unshareChatBotGroup,
    refreshChatbot
  }
})
