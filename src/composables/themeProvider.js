import { ref, watch, onMounted, provide, inject } from 'vue'

const themeSymbol = Symbol('theme')

export function provideTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = ref(localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : prefersDark)

  const updateTheme = () => {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  onMounted(updateTheme)
  watch(isDark, updateTheme)

  provide(themeSymbol, { isDark, toggleTheme })
}

export function useTheme() {
  return inject(themeSymbol)
}
