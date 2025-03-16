<script setup>
import { ref, computed } from "vue";
import api from "../../axios/userApi.js";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);

const user = ref({
  name: "",
  email: "",
  login: "",
  password: "",
});

const password2 = ref("");
const nameError = ref("");
const emailError = ref("");
const loginError = ref("");
const passwordError = ref("");
const password2Error = ref("");

const validateName = () => {
  if (!user.value.name) {
    nameError.value = "Name is required";
    return false;
  }
  if (user.value.name.length < 2) {
    nameError.value = "Name must be at least 2 characters long";
    return false;
  }
  nameError.value = "";
  return true;
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.value.email) {
    emailError.value = "Email is required";
    return false;
  }
  if (!emailRegex.test(user.value.email)) {
    emailError.value = "Enter a valid email address";
    return false;
  }
  emailError.value = "";
  return true;
};

const validateLogin = () => {
  if (!user.value.login) {
    loginError.value = "Login is required";
    return false;
  }
  if (user.value.login.length < 3) {
    loginError.value = "Login must be at least 3 characters long";
    return false;
  }
  loginError.value = "";
  return true;
};

const validatePassword = () => {
  if (!user.value.password) {
    passwordError.value = "Password is required";
    return false;
  }
  if (user.value.password.length < 6) {
    passwordError.value = "Password must be at least 6 characters long";
    return false;
  }
  const hasUpperCase = /[A-Z]/.test(user.value.password);
  const hasLowerCase = /[a-z]/.test(user.value.password);
  const hasNumbers = /\d/.test(user.value.password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    passwordError.value =
      "Password must contain uppercase, lowercase letters, and numbers";
    return false;
  }

  passwordError.value = "";
  return true;
};

const validatePassword2 = () => {
  if (!password2.value) {
    password2Error.value = "Please confirm your password";
    return false;
  }
  if (password2.value !== user.value.password) {
    password2Error.value = "Passwords do not match";
    return false;
  }
  password2Error.value = "";
  return true;
};

const validateForm = () => {
  return (
    validateName() &&
    validateEmail() &&
    validateLogin() &&
    validatePassword() &&
    validatePassword2()
  );
};

const isFormValid = computed(() => {
  return (
    user.value.name &&
    user.value.email &&
    user.value.login &&
    user.value.password &&
    password2.value &&
    password2.value === user.value.password
  );
});

const submitRegister = async () => {
  nameError.value = "";
  emailError.value = "";
  loginError.value = "";
  passwordError.value = "";
  password2Error.value = "";

  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const response = await api.registerUser(user.value);
    console.log(response);
    if (response.success) {
      router.push("/login");
    } else {
      if (response.data) {
        nameError.value = response.data.name || "";
        emailError.value = response.data.email || "";
        loginError.value = response.data.login || "";
        passwordError.value = response.data.password || "";
      }
    }
  } catch (err) {
    console.error("Registration error:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main>
    <div class="register-box">
      <h2>Register</h2>
      <form @submit.prevent="submitRegister">
        <div class="input-group" :class="{ 'error-border': nameError }">
          <label for="name">Name:</label>
          <input
            type="text"
            id="name"
            v-model="user.name"
            @blur="validateName"
          />
          <p v-if="nameError" class="error">{{ nameError }}</p>
        </div>
        <div class="input-group" :class="{ 'error-border': emailError }">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="user.email"
            @blur="validateEmail"
          />
          <p v-if="emailError" class="error">{{ emailError }}</p>
        </div>
        <div class="input-group" :class="{ 'error-border': loginError }">
          <label for="login">Login:</label>
          <input
            v-model="user.login"
            type="text"
            id="login"
            @blur="validateLogin"
          />
          <p v-if="loginError" class="error">{{ loginError }}</p>
        </div>
        <div class="input-group" :class="{ 'error-border': passwordError }">
          <label for="password">Password:</label>
          <input
            v-model="user.password"
            type="password"
            id="password"
            @blur="validatePassword"
          />
          <p v-if="passwordError" class="error">{{ passwordError }}</p>
        </div>
        <div class="input-group" :class="{ 'error-border': password2Error }">
          <label for="password2">Confirm Password:</label>
          <input
            type="password"
            id="password2"
            v-model="password2"
            @blur="validatePassword2"
          />
          <p v-if="password2Error" class="error">{{ password2Error }}</p>
        </div>
        <button type="submit" :disabled="loading || !isFormValid">
          {{ loading ? "Loading..." : "Register" }}
        </button>
      </form>
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
}

.register-box {
  width: 350px;
  padding: 25px;
  border-radius: 10px;
  background: var(--background-color);
  box-shadow: 0px 4px 10px var(--login-form-shadow-color);
  text-align: center;
}

.register-box h2 {
  margin-bottom: 15px;
  color: var(--text-color);
}

.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 12px;
}

.input-group label {
  font-size: 14px;
  color: var(--text-color);
  margin-bottom: 5px;
}

.input-group input {
  padding: 12px;
  border-radius: 5px;
  border: 1px solid var(--input-border-color);
  background: var(--input-background-color);
  transition: 0.3s;
  color: var(--text-color);
}

.input-group input:focus {
  border-color: #0984e3;
  background: var(--background-color);
  outline: none;
  box-shadow: 0px 0px 5px rgba(9, 132, 227, 0.5);
  color:var(--text-color)
}

.error-border input {
  border: 1px solid red !important;
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
  transition: 0.3s;
}

button:hover {
  background: #0652dd;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  margin-top: 5px;
  color: red;
  font-size: 12px;
}

.general {
  margin-top: 10px;
  font-size: 14px;
}
</style>
