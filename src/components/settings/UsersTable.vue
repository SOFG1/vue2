<script setup lang="ts">
import EditIconUrl from '@/assets/icons/edit.svg'
import { DateTime } from 'luxon'
import type { User } from '@/types'
import { computed, ref } from 'vue'
import { useIsScrollable } from '@/composables/useIsScrollable'
import { useUsersStore } from '@/stores/users'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth'
import TsaiAvatar from '../TsaiAvatar.vue'
import { useI18n } from 'vue-i18n'
import EditScopesModal from '@/components/modals/EditScopesModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import ActionButton from '@/components/ActionButton.vue'

const i18n = useI18n()

const props = defineProps<{ users?: User[] }>()

const emit = defineEmits<{
  (e: 'add'): void
}>()

const authStore = useAuthStore()
const usersStore = useUsersStore()

const tableRef = ref<HTMLDivElement>()
const isScrollable = useIsScrollable(tableRef)
const userToDelete = ref<string | null>(null)
const userToEditScopes = ref<string | null>(null)
const isDeleteing = ref<boolean>(false)

const selectedUserScopes = computed(() => {
  return props.users?.find((u) => u.id === userToEditScopes.value)?.scopes
})

const handleDelete = async () => {
  if (isDeleteing.value) return
  isDeleteing.value = true
  try {
    await usersStore.deleteUser(userToDelete.value as string)
    toast(i18n.t('settings.user-table.user-deletion-success'), {
      autoClose: 3000,
      type: 'success'
    })
  } catch (e: any) {
    const message = e?.response?.data.detail
    toast(i18n.t('settings.user-table.user-deletion-error', { errorMsg: message }), {
      autoClose: 3000,
      type: 'error'
    })
    console.log(e)
  }
  userToDelete.value = null
  isDeleteing.value = false
}
</script>

<template>
  <div class="table-wrapper" :class="{ 'no-scroll': !isScrollable }">
    <div class="table-container" ref="tableRef">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('settings.user-table.avatar') }}</th>
            <th>{{ $t('settings.user-table.username') }}</th>
            <th>{{ $t('settings.user-table.display-name') }}</th>
            <th>{{ $t('settings.user-table.role') }}</th>
            <th>{{ $t('settings.user-table.created') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users || users.length === 0">
            <td colspan="4" class="table-no-items"> &mdash; {{ $t('settings.user-table.no-users') }} &mdash;</td>
          </tr>
          <tr v-else v-for="user in users" :key="user.id">
            <td style="width: 40px">
              <!-- <span class="avatar">
              <img :src="user?.avatar" alt="avatar" />
            </span> -->
              <TsaiAvatar class="avatar" :src="user.avatar" :name="user.name" />
            </td>
            <td style="width: 12%">{{ user?.username }}</td>
            <td>
              <span>{{ user?.name }}</span>
            </td>
            <td style="display: flex">
              <span class="scopes">{{ user?.scopes === '*' ? 'Admin' : 'User' }}</span>
              <button
                v-if="user.id !== authStore.user?.id"
                @click="userToEditScopes = user.id"
                class="table-action-btn"
              >
                <EditIconUrl />
              </button>
            </td>
            <td style="width: 18%">{{ DateTime.fromISO(user.creation_time, { zone: 'utc' }).toRelative() }}</td>
            <td style="display: flex">
              <ActionButton icon="delete" @click="userToDelete = user.id" class="table-action-btn" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <EditScopesModal
    :modelValue="!!userToEditScopes"
    @update:modelValue="userToEditScopes = null"
    :scopes="selectedUserScopes || ''"
    :id="userToEditScopes"
    @close="userToEditScopes = null"
  />
  <DeleteConfirmModal
    :modelValue="!!userToDelete"
    @update:modelValue="userToDelete = null"
    @close="userToDelete = null"
    @confirm="handleDelete"
    title="Benutzer löschen?"
    text="Möchten Sie diesen Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
  />
</template>

<style lang="scss" scoped>
.avatar {
  border: 1px solid var(--color-border-grey);
  height: 32px;
  width: 32px;
}

.scopes {
  min-width: 235px;
}

@media screen and (max-width: 786px) {
  .container {
    min-width: 0;
  }
}
</style>
