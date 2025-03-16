<script setup>
import WelcomeNavComp from "@/components/welcome/WelcomeNavComp.vue";
import MainComponent from "@/components/welcome/MainComponent.vue";
import SupportComponent from "@/components/welcome/SupportComponent.vue";
</script>
<template>
  <main class="welcome-box">
    <WelcomeNavComp />
    <MainComponent />
    <SupportComponent />
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

.welcome-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
}
</style>
