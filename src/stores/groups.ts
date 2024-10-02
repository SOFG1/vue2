import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import type { CreateGroupPayload, Group } from '@/types'
import i18n from '@/i18n'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])

  async function fetchGroups() {
    try {
      const response = await axios.get<Group[]>('/api/groups')
      groups.value = response.data
    } catch (error) {
      toast(i18n.global.t('groups.toasts.fetch-error'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching groups:', error)
    }
  }

  //This function updates group if it exists, if not adds it
  function refreshGroup(group: Group) {
    const index = groups.value.findIndex((g) => g.id === group.id)
    if (index >= 0) {
      groups.value[index] = group
    }
    if (index < 0) {
      groups.value.push(group)
    }
  }

  async function createGroup(data: CreateGroupPayload) {
    try {
      const response = await axios.post<Group>('/api/groups', data)
      console.log(response)
      groups.value.unshift(response.data)
      return response
    } catch (e) {
      toast(i18n.global.t('groups.create-group.error'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error creating groups:', error)
      throw e
    }
  }

  async function editGroup(id: string, data: any) {
    const response = await axios.patch<Group>(`/api/groups/${id}`, data)
    refreshGroup(response.data)
    return response
  }

  async function deleteGroup(id: string) {
    try {
      await axios.delete<Group>(`/api/groups/${id}`)
      groups.value = groups.value.filter((g) => g.id !== id)
    } catch (e) {
      throw e
    }
  }

  async function addGroupMember(id: string, user_id: string) {
    try {
      const response = await axios.post<Group>(`/api/groups/${id}/user/${user_id}`)
      refreshGroup(response.data)
      toast(i18n.global.t('groups.add-member.success'), {
        autoClose: 3000,
        type: 'success'
      })
      return response
    } catch (e) {
      const detail = e?.response?.data?.detail
      const message = detail[0].msg || detail || i18n.global.t('groups.toasts.add-user-error')
      toast(message, {
        autoClose: 3000,
        type: 'error'
      })
      throw e
    }
  }

  async function deleteGroupMember(id: string, user_id: string) {
    try {
      const response = await axios.delete<Group>(`/api/groups/${id}/user/${user_id}`)
      console.log(response.data)
      refreshGroup(response.data)
      toast(i18n.global.t('groups.delete-member.success'), {
        autoClose: 3000,
        type: 'success'
      })
      return response
    } catch (e) {
      const detail = e?.response?.data?.detail
      const message = detail[0]?.msg || detail || i18n.global.t('groups.delete-member.error')
      toast(message, {
        autoClose: 3000,
        type: 'error'
      })
      throw e
    }
  }

  return {
    groups,
    fetchGroups,
    createGroup,
    addGroupMember,
    deleteGroup,
    editGroup,
    deleteGroupMember
  }
})
