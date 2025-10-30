<script setup lang="ts"></script>

<template>
  <NConfigProvider>
    <NLoadingBarProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <NDialogProvider>
            <NuxtLayout>
              <NuxtPage />
            </NuxtLayout>
          </NDialogProvider>
        </NMessageProvider>
      </NNotificationProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>
