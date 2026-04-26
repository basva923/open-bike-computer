import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/open-bike-computer/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
