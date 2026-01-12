<script setup lang="ts">
const props = defineProps<{
  tmdbId: number;
  mediaType: string;
}>();

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

// 定義留言介面
interface Comment {
  commentId: number;
  memberName: string;
  memberPicture: string;
  content: string;
  createdAt: string;
  isMyComment: boolean;
}

const comments = ref<Comment[]>([]);
const loading = ref(true);
const submitting = ref(false);
const newCommentContent = ref("");

onMounted(() => {
  fetchComments();
});

// 分批顯示
const displayCount = ref(5); // 預設顯示 5 筆

// 計算目前要顯示的留言
const visibleComments = computed(() => {
  return comments.value.slice(0, displayCount.value);
});

// 是否還有更多留言可載入
const hasMore = computed(() => {
  return displayCount.value < comments.value.length;
});

// 載入更多按鈕事件
function loadMore() {
  displayCount.value += 5;
}

// 抓取留言列表
async function fetchComments() {
  loading.value = true;
  try {
    const data = await $fetch<Comment[]>("/api/comments", {
      headers: getAuthHeaders(),
      params: {
        tmdbId: props.tmdbId,
        mediaType: props.mediaType,
      },
    });

    comments.value = data;
  } catch (error) {
    console.error("無法取得留言:", error);
  } finally {
    loading.value = false;
  }
}

// 送出留言
async function handleSubmit() {
  if (!authStore.isAuthenticated) {
    toast.add({
      title: "請先登入",
      description: "登入後即可參與討論",
      color: "primary",
      actions: [
        {
          label: "登入",
          onClick: () => {
            router.push("/login");
          },
        },
      ],
    });
    return;
  }

  if (!newCommentContent.value.trim()) return;

  submitting.value = true;
  try {
    const newComment = await $fetch<Comment>("/api/comments", {
      method: "POST",
      headers: getAuthHeaders(),
      body: {
        tmdbId: props.tmdbId,
        mediaType: props.mediaType,
        content: newCommentContent.value,
      },
    });

    comments.value.unshift(newComment);
    newCommentContent.value = "";
    toast.add({ title: "留言發送成功", color: "primary" });
  } catch (error) {
    toast.add({ title: "留言失敗", color: "error" });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-6">
      <SubTitle title="留言" size="xl" />
      <span
        class="text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        {{ comments.length }}
      </span>
    </div>

    <!-- 輸入區塊 -->
    <div class="mb-10 flex gap-4">
      <div class="shrink-0">
        <UAvatar
          :src="authStore.user?.pictureUrl || undefined"
          :alt="authStore.user?.displayName || 'Guest'"
          size="md"
          class="bg-gray-200 dark:bg-gray-800"
        />
      </div>
      <div class="flex-1">
        <div class="relative">
          <textarea
            v-model="newCommentContent"
            rows="3"
            placeholder="分享你的想法..."
            class="w-full bg-gray-50 dark:bg-gray-900 outline-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            :disabled="submitting"
          ></textarea>
          <div class="absolute bottom-3 right-3">
            <UButton
              size="sm"
              color="primary"
              :loading="submitting"
              :disabled="!newCommentContent.trim()"
              @click="handleSubmit"
            >
              發送
            </UButton>
          </div>
        </div>
        <p v-if="!authStore.isAuthenticated" class="mt-2 text-sm text-gray-500">
          需<button
            @click="$router.push('/login')"
            class="text-primary hover:underline mx-1"
          >
            登入</button
          >後才能留言
        </p>
      </div>
    </div>

    <!-- 留言列表 -->
    <div class="space-y-6">
      <!-- 載入中 -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex gap-4">
          <USkeleton class="h-10 w-10 rounded-full shrink-0" />
          <div class="space-y-2 flex-1">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-full" />
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div
        v-else-if="comments.length === 0"
        class="text-center py-10 text-gray-500"
      >
        <UIcon
          name="i-heroicons-chat-bubble-left-right"
          class="w-12 h-12 mb-2 mx-auto opacity-20"
        />
        <p>還沒有人留言，搶頭香吧！</p>
      </div>

      <!-- 列表內容 -->
      <div
        v-for="comment in visibleComments"
        :key="comment.commentId"
        class="flex gap-4 group animate-fade-in"
      >
        <div class="shrink-0">
          <UAvatar
            :src="comment.memberPicture"
            :alt="comment.memberName"
            size="md"
            class="ring-2 ring-white dark:ring-gray-900"
          />
        </div>
        <div class="flex-1">
          <div class="relative">
            <div class="flex items-center justify-start gap-2 mb-2">
              <span class="text-gray-900 dark:text-white text-sm">
                {{ comment.memberName || "匿名用戶" }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDateDistance(comment.createdAt) }}
              </span>
            </div>
            <p
              class="text-gray-700 text-left dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed"
            >
              {{ comment.content }}
            </p>
          </div>
        </div>
      </div>

      <!-- 載入更多按鈕 -->
      <div v-if="hasMore" class="flex justify-center pt-4">
        <UButton
          variant="soft"
          color="neutral"
          block
          class="max-w-xs"
          @click="loadMore"
        >
          載入更多留言 ({{ comments.length - displayCount }})
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
