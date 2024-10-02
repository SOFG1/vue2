<script setup lang="ts">
import { computed, ref } from 'vue'
import tinycolor from 'tinycolor2'
import Icon1 from '@/assets/icons/card-icon-1.svg'
import AccountMultipleIcon from '@/assets/icons/account-multiple.svg'
import EditIcon from '@/assets/icons/edit.svg'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = withDefaults(
  defineProps<{
    chatbot_id?: string
    color?: string
    owner_id?: string
    title?: string
    description?: string
    fileCount?: number
    individuals?: {
      user: string
      username: string
    }[]
    Icon?: any
  }>(),
  {
    color: '#fcbdbd',
    title: 'Bot',
    description: 'Sample description',
    fileCount: 0,
    Icon: Icon1
  }
)

const { user } = useAuthStore()
const router = useRouter()

const fontColor = computed(() => (tinycolor(props.color).isDark() ? '#fff' : '#000'))

const lightenedColor = computed(() => tinycolor(props.color).lighten(4).toHexString())
const darkenedColor1 = computed(() => tinycolor(props.color).darken(4).toHexString())
const darkenedColor2 = computed(() => tinycolor(lightenedColor.value).darken(4).toHexString())
const darkenedBorderColor = computed(() => tinycolor(props.color).darken(7).toHexString())

// TODO: Include this globally & fix regex warnings
const mobileOrTablet = (window.mobileAndTabletCheck = (function () {
  let check = false
  ;(function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true
  })(navigator.userAgent || navigator.vendor || window.opera)
  return check
})())
const gradientBackground = computed(() => `linear-gradient(251deg, ${lightenedColor.value}, ${props.color})`)
const hoverGradientBackground = computed(
  () => `linear-gradient(251deg, ${darkenedColor2.value}, ${darkenedColor1.value})`
)

const isHovering = ref(false)
const canBeEdited = computed(() => {
  return user.id === props.owner_id
})

function edit() {
  router.push({ name: 'chatbots-edit', params: { id: props.chatbot_id } })
}
</script>

<template>
  <div class="chatbot-preview-box cbpb-default" @mouseenter="isHovering = true" @mouseleave="isHovering = false">
    <h3 class="truncate">{{ title }}</h3>
    <p>{{ description }}</p>
    <span v-if="fileCount">{{ fileCount }} Dateien</span>
    <div v-if="(isHovering || mobileOrTablet) && canBeEdited" class="edit" @click.stop="edit">
      <EditIcon class="edit-icon" />
    </div>
    <div class="shared" v-if="individuals ? individuals.length > 0 : false">
      <AccountMultipleIcon class="shared-icon" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/mixins';

.chatbot-preview-box {
  position: relative;
  border-radius: 12px;
  min-width: 175px;
  border: 1px solid;
  font-family: Mulish, sans-serif;
  width: 234px;
  height: auto;
  min-height: 127px;
  color: var(--color-text-secondary);
  //margin-right: 22px;
  padding: 14px 12px;
  transition:
    opacity 0.3s ease-in-out,
    border 0.3s ease-in-out;
  cursor: pointer;

  h3 {
    font-size: 16px;
    font-weight: 700;
    padding-right: 1rem;
  }

  p {
    font-size: 12px;
    line-height: 1.2;
    margin-top: 3px;

    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }

  span {
    font-size: 0.6rem;
    font-family: 'Poppins', sans-serif;
    margin-top: 3px;
  }

  .edit {
    z-index: 1;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    right: 6px;
    top: 10px;
    width: 32px;
    height: 32px;
    background: transparent;
    border-radius: 50%;

    .edit-icon {
      height: 18px;
      width: 18px;
      margin: 0 0 1px 2px;
      stroke: v-bind(fontColor);
    }

    &:hover {
      background-color: var(--color-btn-hover-bg);
      box-shadow: 0 0 6px 3px rgba(169, 0, 247, 0.1);
    }
  }

  .shared {
    position: absolute;
    display: flex;
    align-items: center;
    bottom: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background-color: #ffffff;
    border: 1px solid v-bind(darkenedBorderColor);
    border-radius: 50%;

    .shared-icon {
      height: 20px;
      width: 20px;
      position: relative;
      margin: 0 auto;
      fill: var(--color-primary-dark);
    }
  }
}

.icon {
  position: absolute;
  height: 22px;
  width: 22px;
  top: 15px;
  right: 13px;
  stroke: v-bind(fontColor);
}

.cbpb-default {
  position: relative;
  border-radius: 12px;
  border: 1px solid v-bind(darkenedBorderColor);
  color: v-bind(fontColor);
  // transition: --myColor1 0.3s, --myColor2 0.3s;
  transition: all 0.2s ease-in-out;

  @include gradientAnimation(v-bind(gradientBackground), v-bind(hoverGradientBackground), 0.4s);
}

@media screen and (max-width: 786px) {
  .chatbot-preview-box {
    width: 100%;
  }

  .chatbot-preview-box h3 {
    font-size: 16px;
  }

  .chatbot-preview-box p {
    font-size: 16px;
  }
}
</style>
