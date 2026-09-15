import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages는 /eduReact/ 아래에 올라가므로 배포 워크플로가 BASE_PATH를 준다. 로컬은 그대로 /
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
