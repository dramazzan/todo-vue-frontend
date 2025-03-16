<script setup>
import { useTheme } from '@/composables/themeProvider'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <main class="theme-toggle">
    <input type="checkbox" id="theme-toggle" :checked="isDark" @change="toggleTheme" />

    <div class="toggle-display">
      <label for="theme-toggle">
        <div class="toggle-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="sun-icon"
            aria-hidden="true"
          >
            <path
              d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="moon-icon"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </label>
    </div>
  </main>
</template>



<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-display {
  width: 90px;
  height: 45px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-color);
  border-radius: 30px;
}

#theme-toggle {
  display: none;
}

.toggle-display label {
  width: 100%;
  height: 100%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05) inset;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--toggle-border-color);
  border-radius: 30px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  background: var(--toggle-box-bg);
}

.toggle-circle {
  width: 38px;
  height: 38px;
  border-radius: 99px;
  background: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 0, 0, 0.2) inset;
  position: absolute;
  top: 50%;
  left: 4px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

.toggle-circle svg {
  width: 20px;
  position: absolute;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.sun-icon {
  color: var(--sun-color);
  opacity: 1;
  transform: translateY(0);
}

.moon-icon {
  color: white;
  opacity: 0;
  transform: translateY(100%);
}



#theme-toggle:checked + .toggle-display label {
  background: var(--dark-bg);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5) inset;
}

#theme-toggle:checked + .toggle-display .toggle-circle {
  transform: translate(calc(90px - 38px - (4px * 2)), -50%);
  background: var(--dark-circle-bg);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.5) inset;
}

#theme-toggle:checked + .toggle-display .toggle-circle .sun-icon {
  opacity: 0;
  transform: translateY(-100%);
}

#theme-toggle:checked + .toggle-display .toggle-circle .moon-icon {
  opacity: 1;
  transform: translateY(0);
}

/* Убедимся, что все элементы имеют анимацию */
*, *::before, *::after {
  transition-property: all;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
</style>