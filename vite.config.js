import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    lib: {
      entry: 'src/MultipleChoiceQuestion.vue',
      name: 'MultipleChoiceQuestion',
      fileName: 'vue-component'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
}); 