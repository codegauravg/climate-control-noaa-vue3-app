<template>
  <div class="card error">
    <strong>Error:</strong> {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Something went wrong.'
  }
})
</script>