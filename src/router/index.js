import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "@/views/WelcomeView.vue";
import HomeView from "@/views/HomeView.vue";
import RegisterView from "@/views/RegisterView.vue";
import LoginView from "@/views/LoginView.vue";
import AdminView from "@/views/AdminView.vue";
import userApi from "@/axios/userApi";
import { ref } from "vue";

const userRole = ref(null);

const getUserRole = async () => {
  try {
    const response = await userApi.getUserData();
    if (response.success) {
      userRole.value = response.data.role;
    }
  } catch (error) {
    console.error("Ошибка при получении роли пользователя:", error);
  }
};

getUserRole();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes: [
    { path: "/", name: "welcome", component: WelcomeView },
    { path: "/home", name: "home", component: HomeView },
    { path: "/register", name: "register", component: RegisterView },
    { path: "/login", name: "login", component: LoginView },
    {
      path: "/admin",
      name: "admin",
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Ждем, пока роль загрузится, если она еще не определена
  if (userRole.value === null) {
    await getUserRole();
  }

  const isAdmin = userRole.value === "admin";

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next("/home");
  }

  next();
});

export default router;
