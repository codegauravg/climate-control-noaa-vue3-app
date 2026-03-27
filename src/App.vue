<template>
  <div class="app-shell">
    <AppHeader />
    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
</script>