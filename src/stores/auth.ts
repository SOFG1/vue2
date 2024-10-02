import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios, { AxiosError } from 'axios'
import { toast } from 'vue3-toastify'
import type { User, UserChangeAvatarRequest, UserChangePasswordRequest, UserCredentials } from '@/types'
import i18n from '@/i18n'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const isLoggedIn = ref(false)
  const isLoading = ref<string | null>(null)

  const initialize = async () => {
    try {
      await getProfile()
      isLoggedIn.value = true
    } catch (error) {
      console.log(error)
    }
  }

  const login = async (credentials: UserCredentials) => {
    try {
      const response = await axios.post(
        '/api/users/token',
        new URLSearchParams({
          username: credentials.username,
          password: credentials.password
        })
      )
      token.value = response.data.access_token

      localStorage.setItem('token', token.value as string)
      isLoggedIn.value = true

      await getProfile()
    } catch (error) {
      let message = i18n.global.t('home.toasts.invalid-credentials')
      if (error instanceof AxiosError && error.response?.data?.detail) {
        message = error.response?.data?.detail
      } else {
        console.error(error)
      }
      toast(message, {
        autoClose: 3000,
        type: 'error'
      })
      throw message || error
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    console.log('Logging out the user')
    isLoggedIn.value = false
  }

  const getProfile = async () => {
    if (!token.value) {
      throw new Error('Token does not exist')
    }

    const response = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    user.value = response.data

    isLoggedIn.value = true
    return response.data.user
  }

  const changePassword = async (req: UserChangePasswordRequest): Promise<any> => {
    try {
      const response = await axios.post('/api/users/change-password', req, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error
      } else {
        throw error
      }
    }
  }

  const changeAvatar = async (req: UserChangeAvatarRequest) => {
    try {
      const response = await axios.post('/api/users/change-avatar', req, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = response.data
      toast(i18n.global.t('settings.edit-profile.toasts.avatar-change-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (e: any) {
      const msg = e?.detail?.msg || e?.detail || 'An error occurred'
      toast(i18n.global.t('settings.edit-profile.toasts.avatar-change-error', { errorMsg: msg }), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  const changeName = async (name: string) => {
    try {
      isLoading.value = 'name'
      const response = await axios.post(
        '/api/users/change-name',
        { name },
        {
          headers: { Authorization: `Bearer ${token.value}` }
        }
      )
      isLoading.value = null
      if (user.value) user.value.name = name
      toast(i18n.global.t('settings.edit-profile.toasts.name-change-success'), {
        autoClose: 3000,
        type: 'success'
      })
      return response.data
    } catch (e: any) {
      const msg = e?.detail?.msg || e?.detail || 'An error occurred'
      toast(i18n.global.t('settings.edit-profile.toasts.name-change-error', { errorMsg: msg }), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  const changeScopes = async (id: number, scopes: string | string[]) => {
    try {
      isLoading.value = 'scopes'
      const response = await axios.post(
        '/api/users/change-name',
        { name: scopes },
        {
          headers: { Authorization: `Bearer ${token.value}` }
        }
      )
      isLoading.value = null
      toast(i18n.global.t('settings.edit-profile.toasts.role-change-success'), {
        autoClose: 3000,
        type: 'success'
      })
      return response.data
    } catch (e: any) {
      const msg = e?.detail?.msg || e?.detail || 'An error occurred'
      toast(i18n.global.t('settings.edit-profile.toasts.role-change-error', { errorMsg: msg }), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  const reloadProfile = async () => {
    await getProfile()
  }

  return {
    user,
    token,
    isLoggedIn,
    isLoading,
    initialize,
    login,
    logout,
    getProfile,
    changePassword,
    changeAvatar,
    changeName,
    changeScopes,
    reloadProfile
  }
})
