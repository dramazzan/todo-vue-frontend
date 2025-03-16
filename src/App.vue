<script setup>
import { RouterView } from "vue-router";
import { provideTheme } from '@/composables/themeProvider'

provideTheme()
</script>

<template>
  <RouterView />
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

</style>
