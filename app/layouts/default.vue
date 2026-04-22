<template>
  <div class="min-h-screen">
    <header class="no-print bg-[#1B4332] text-white">
      <div class="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3">
          <span class="font-dm font-bold text-xs tracking-[2px] uppercase opacity-70">
            FREEDOM X Inc.
          </span>
          <span class="text-lg font-bold tracking-tight">面談管理</span>
        </NuxtLink>
        <nav class="flex items-center gap-6 text-sm">
          <NuxtLink
            to="/"
            class="opacity-70 hover:opacity-100 transition-opacity"
            active-class="!opacity-100 font-semibold"
          >
            面談一覧
          </NuxtLink>
          <span v-if="auth?.email" class="text-xs opacity-60">
            {{ auth.email }}
          </span>
        </nav>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: auth } = await useFetch('/api/me', { default: () => ({ email: '', user: '' }) })
</script>

<style>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
