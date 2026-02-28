import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: path.resolve(__dirname, 'src/quasar-variables.sass'),
    }),
  ],
  css: {
    preprocessorOptions: {
      sass: {
        includePaths: [__dirname],
      },
    },
  },
})
