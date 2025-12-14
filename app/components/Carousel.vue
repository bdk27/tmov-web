<script setup lang="ts">
defineProps<{
  items: TmdbItem[];
}>();
</script>

<template>
  <UCarousel
    class-names
    loop
    arrows
    wheel-gestures
    :items="items"
    :ui="{
      item: 'basis-1/2 md:basis-1/4 lg:basis-1/6',
    }"
  >
    <template #default="{ item }">
      <ItemCard :item="item" />
    </template>
  </UCarousel>
</template>
