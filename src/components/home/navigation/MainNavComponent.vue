<script setup>
import { ref, computed, onUnmounted, nextTick } from "vue";
import ToggleThemeComponent from "./ToggleThemeComponent.vue";
import LogoutPopup from "./LogoutPopup.vue";
import { useRouter } from "vue-router";

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
    <div class="nav-container">
      <h2 class="title">ToDoList</h2>
      <div class="nav-links-box">
        <router-link to="/profile" class="profile-link">Profile</router-link>
        <router-link v-if="!isAuthenticated" to="/login" class="auth-btn login-btn">Sign In</router-link>
        <button v-else @click.stop="showPopup" ref="logoutButton" class="auth-btn logout-btn">Logout</button>
        <ToggleThemeComponent />
      </div>
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
  *{
    margin:0;
    padding:0;
    
  }

  a{
    text-decoration: none;
  }

  .nav-box{
    font-family: 'Raleway' , sans-serif;
    font-weight: 400;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-box .nav-container{
    width: 80%;
    margin: 0 auto;
    padding: 10px 40px;
    background: var(--background-color);
    border-radius: 10px;
    box-shadow: 10px 10px 20px rgba(0,0,0,0.05) , -10px -10px 30px rgba(0,0,0,0.05) inset;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-box .nav-container .nav-links-box{
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .nav-box .nav-container .nav-links-box .profile-link{
    border:1px solid #9442e6;
    padding: 12px 18px;
    text-align: center;
    border-radius: 3px;
    color: #9442e6;
    transition: 0.25s ease;
    cursor: pointer;
  }
  
  .nav-box .nav-container .nav-links-box .profile-link:hover{
    background: #843bcd;
    color:#fff;
  }


  .nav-box .nav-container .nav-links-box .profile-link:active{
    background: #7131b0;
    color:#e8e7e7;
  }

  .nav-box .nav-container .nav-links-box  .auth-btn{
    padding: 12px 18px;
    text-align: center;
    border-radius: 3px;
    transition: 0.25s ease;
    cursor: pointer;
  }

  .nav-box .nav-container .nav-links-box .logout-btn{
    border:1px solid #de2a2a;
    color:#de2a2a;
  }

  .nav-box .nav-container .nav-links-box .logout-btn:hover{
    background: #c62222;
    color: #fff;
    }


    .nav-box .nav-container .nav-links-box .logout-btn:active{
      background: #ae1d1d;
      color:#e8e7e7;
    }


    .nav-box .nav-container .nav-links-box .login-btn{
      border: 1px solid #3543e4;
      color: #3543e4;
    }


    .nav-box .nav-container .nav-links-box .login-btn:hover{
      background: #2f3cc9;
      color: #fff;
    }

    .nav-box .nav-container .nav-links-box .login-btn:active{
      background: #2c38b7;
      color: #e8e7e7;
    }



  button.logout-btn {
  all: unset;
  display: inline-block;
  text-align: center;
  cursor: pointer;
}


</style>