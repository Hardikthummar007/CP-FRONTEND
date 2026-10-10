import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default function () {
  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/auth': {
          target: 'http://localhost:8085',
          changeOrigin: true
        },
        '/userService': {
          target: 'http://localhost:8085',
          changeOrigin: true
        },
        '/problemService': {
          target: 'http://localhost:8085',
          changeOrigin: true
        },
        '/contestService': {
          target: 'http://localhost:8085',
          changeOrigin: true
        },
        '/normalSubmissoinService': {
          target: 'http://localhost:8085',
          changeOrigin: true
        },
        '/normalSubmissionService': {
          target: 'http://localhost:8085',
          changeOrigin: true
        },
        '/ws': {
          target: 'http://localhost:8084',
          ws: true,
          changeOrigin: true
        },
        '/sortUserOfContestWhoCompletedTheContest': {
          target: 'http://localhost:8084',
          changeOrigin: true
        },
        '/topersOnDashBoard': {
          target: 'http://localhost:8084',
          changeOrigin: true
        }
      }
    }
  })
}
