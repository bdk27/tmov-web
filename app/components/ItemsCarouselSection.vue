<script setup lang="ts">
const props = defineProps<{
  tabs: { label: string }[];
  items: TmdbItem[];
  loading: boolean;
  modelValue: number;
}>();

const emit = defineEmits(["update:modelValue"]);

const selectedTab = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", Number(value));
  },
});
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
    <UTabs :items="tabs" v-model="selectedTab" class="mb-12" variant="link" />

    <div v-if="!loading">
      <Carousel :items="items" />
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div v-for="i in 6" :key="`sk-item-${i}`" class="flex flex-col gap-2">
        <USkeleton class="w-full aspect-2/3" />
        <USkeleton class="h-5 w-3/4" />
      </div>
    </div>
  </div>
</template>
