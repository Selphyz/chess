import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'utils/': '/src/utils',
      'components': '/src/components',
      'types': '/src/types',
      'assets': '/src/assets',
      'hooks': '/src/hooks',
      'pages': '/src/pages',
    },
  }
})
