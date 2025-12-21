<script setup lang="ts">
const isVideoOpen = defineModel<boolean>("showVideo");
const isImageOpen = defineModel<boolean>("showImage");

const props = defineProps<{
  video?: any;
  image?: any;
}>();

const { backdropUrl } = useTmdb();

// 關閉
const closeAll = () => {
  isVideoOpen.value = false;
  isImageOpen.value = false;
};

// 鎖定背景滾動 & 監聽 ESC 鍵
watchEffect(() => {
  if (import.meta.client) {
    if (isVideoOpen.value || isImageOpen.value) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
});

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeAll();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isVideoOpen"
        class="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6"
      >
        <div
          class="absolute inset-0 bg-black/90 backdrop-blur-sm"
          @click="closeAll"
        ></div>

        <div class="relative w-full max-w-5xl animate-scale-up">
          <button
            @click="closeAll"
            class="absolute -top-12 right-0 z-50 p-2 text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span class="text-sm font-bold tracking-widest hidden sm:inline"
              >關閉</span
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            class="aspect-video w-full bg-black rounded-xl shadow-2xl overflow-hidden relative z-10"
          >
            <iframe
              v-if="video"
              :src="`https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0`"
              class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="isImageOpen"
        class="fixed inset-0 z-9999 flex items-center justify-center p-0"
      >
        <div
          class="absolute inset-0 bg-black/95 backdrop-blur-sm"
          @click="closeAll"
        ></div>
        <div
          class="relative z-10 w-auto h-auto flex items-center justify-center animate-scale-up"
        >
          <button
            @click="closeAll"
            class="fixed top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <img
            v-if="image"
            :src="backdropUrl(image.file_path, 'original')"
            class="max-w-[95vw] max-h-[95vh] object-contain rounded shadow-2xl select-none"
            alt="Full size preview"
            @click.stop
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 背景淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 內容縮放動畫 */
.animate-scale-up {
  animation: scaleUp 0.3s ease-out forwards;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
