<script setup>
import api from "@/axios/userApi";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";


const router = useRouter();
const login = ref("");
const password = ref("");
const loginError = ref("");
const passwordError = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const isLoginValid = computed(() => login.value.trim().length > 0);
const isPasswordValid = computed(() => password.value.length >= 8);
const isFormValid = computed(() => isLoginValid.value && isPasswordValid.value);

const submitLogin = async () => {
  loginError.value = "";
  passwordError.value = "";
  errorMessage.value = "";

  if (!isLoginValid.value) {
    loginError.value = "Please enter your login";
    return;
  }

  if (!isPasswordValid.value) {
    passwordError.value = "Password must be at least 8 characters long";
    return;
  }

  isLoading.value = true;

  try {
    const response = await api.loginUser(login.value, password.value);
    if (response.success) {
      const token = response.token;
      if (token) {
        localStorage.setItem("token", token);
      }
      console.log("Successful login:", response.data);
      router.push("/");
    } else {
      loginError.value = response.data.login || "";
      passwordError.value = response.data.password || "";
      errorMessage.value = response.data.message || "";
    }
  } catch (error) {
    console.error("Authorization error:", error);
    loginError.value = "Server connection error. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  login.value = "";
  password.value = "";
  loginError.value = "";
  passwordError.value = "";
};
</script>

<template>
  <main>
    <div class="login-box">
      <h2>Login</h2>
      <form @submit.prevent="submitLogin">
        <div class="input-group">
          <label for="login">Username:</label>
          <input
            v-model="login"
            type="text"
            id="login"
            autocomplete="username"
            :class="{ error: loginError }"
            @focus="loginError = ''"
          />
          <p v-if="loginError" class="error-message">{{ loginError }}</p>
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <input
            v-model="password"
            type="password"
            id="password"
            autocomplete="current-password"
            :class="{ error: passwordError }"
            @focus="passwordError = ''"
          />
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading">Loading...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="links">
        <p>Don't have an account yet?</p>
        <router-link to="/register">Sign Up</router-link>
      </div>

      <div class="links">
        <router-link to="/forgot-password">Forgot Password?</router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
}

main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color);
}

.login-box {
  width: 350px;
  padding: 25px;
  border-radius: 10px;
  background-color: var(--background-color);
  box-shadow: 0px 4px 10px var(--login-form-shadow-color);
  text-align: center;
}

.login-box h2 {
  margin-bottom: 20px;
  color: var(--text-color);
  font-weight: 500;
}

.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 16px;
}

.input-group label {
  font-size: 14px;
  color: var(--text-color);;
  margin-bottom: 5px;
}

.input-group input {
  padding: 12px;
  border-radius: 5px;
  border: 1px solid var(--input-border-color);
  background-color: var(--input-background-color);
  transition: all 0.3s ease;
  color: var(--text-color);
}

.input-group input:focus {
  border-color: #0984e3;
  background-color: var(--background-color);
  outline: none;
  box-shadow: 0px 0px 5px rgba(9, 132, 227, 0.5);
  color: var(--text-color)
}

.input-group input.error {
  border-color: #e74c3c;
  background-color: var(--background-color);
}

button {
  width: 100%;
  padding: 12px;
  background: #0984e3;
  border: none;
  color: #fff;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 10px;
  font-weight: 500;
}

button:hover {
  background: #0652dd;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.links {
  margin-top: 16px;
  font-size: 14px;
}

.links p {
  margin-bottom: 5px;
  color: var(--text-color);
}

.links a {
  color: #0984e3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.links a:hover {
  color: #0652dd;
  text-decoration: underline;
}

.error-message {
  margin-top: 5px;
  color: #e74c3c;
  font-size: 13px;
  text-align: left;
}
</style>
