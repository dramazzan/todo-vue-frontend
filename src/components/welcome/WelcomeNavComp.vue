<script setup>
import LogoutPopup from "@/components/home/navigation/LogoutPopup.vue";
import { useRouter } from "vue-router";
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

const router = useRouter();
const isPopupVisible = ref(false);
const popupPosition = ref({});
const logoutButton = ref(null);

const isAuthenticated = computed(() => !!localStorage.getItem("token"));

const showPopup = async () => {
  if (logoutButton.value) {
    const rect = logoutButton.value.getBoundingClientRect();
    popupPosition.value = {
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    };
  }
  isPopupVisible.value = true;
  await nextTick();
  document.addEventListener("click", handleOutsideClick);
};

const handleOutsideClick = (event) => {
  if (logoutButton.value && !logoutButton.value.contains(event.target)) {
    isPopupVisible.value = false;
    document.removeEventListener("click", handleOutsideClick);
  }
};

const logout = () => {
  console.log("Выполняется выход...");
  localStorage.removeItem("token");
  isPopupVisible.value = false;
  router.push("/login");
  console.log("Выход выполнен");
};

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
  <nav class="nav-box">
    <h1>ToDoList</h1>
    <div class="router-box">
      <router-link v-if="!isAuthenticated" to="/login" class="auth-btn"
        >Login</router-link
      >
      <button
        v-else
        @click.stop="showPopup"
        ref="logoutButton"
        class="auth-btn logout-btn"
      >
        Logout
      </button>
    </div>
    <LogoutPopup
      v-if="isPopupVisible"
      :visible="isPopupVisible"
      :position="popupPosition"
      @close="isPopupVisible = false"
      @confirm="logout"
    />
  </nav>
</template>

<style scoped>
.nav-box {
  font-family: "Raleway", sans-serif;
  width: 70%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  background-color: var( --background-color);
}

.auth-btn {
  text-decoration: none;
  color: #fff;
  background: #d244c4;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease;
  display: inline-block;
  cursor: pointer;
  border: none;
}

.auth-btn:hover {
  border: 1px solid #d244c4;
  color: #d244c4;
  background-color: var( --background-color);
  transform: scale(1.05);
}

.logout-btn {
  background: #d73049;
  color: #fff;
}

.logout-btn:hover {
  border: 1px solid #d73049;
  color: #d73049;
  background-color: var( --background-color);
}
</style>
