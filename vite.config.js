import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api/molit': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        secure: false, // HTTPS 인증서 문제 방지
        rewrite: (path) => path.replace(/^\/api\/molit/, '')
      }
    }
  }
})
