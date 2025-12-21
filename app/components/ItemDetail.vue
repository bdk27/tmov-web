<script setup lang="ts">
const props = defineProps<{
  item: TmdbDetail;
  loading: boolean;
}>();

const isPerson = computed(() => props.item?.media_type === "person");
</script>

<template>
  <div v-if="item">
    <PersonDetail v-if="isPerson" :item="item" :loading="loading" />

    <MediaDetail v-else :item="item" :loading="loading" />
  </div>
</template>
