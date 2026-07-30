import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 当我们在前端请求 /api 的时候，Vite 会自动帮我们把请求代理到 3001 端口
      // 也就是把 http://localhost:5173/api 代理到了 http://localhost:3001/api
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true, // 允许跨域
        // 如果后端接口没有 /api 前缀，可以通过 rewrite 重写路径
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
