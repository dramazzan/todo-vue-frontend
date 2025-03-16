<script setup></script>

<template>
  <main class="support-box">
    <router-link to="/support">Need Help?</router-link>
  </main>
</template>

<style scoped>
.support-box {
  font-family: "Raleway", sans-serif;
  width: 80%;
  margin: 0 auto;
  display: flex;
  padding-bottom: 20px;
  justify-content: center;
}

.support-box a {
  color: #3a7ed1;
  text-decoration: none;
  font-size: 20px;
}

.support-box a:hover {
  color: #2e6ea6;
}
</style>
