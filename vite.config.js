import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getPackageName(id) {
  const chunk = id.split('node_modules/')[1]
  if (!chunk) return null

  const parts = chunk.split('/')
  if (parts[0].startsWith('@')) {
    return `${parts[0]}/${parts[1]}`
  }

  return parts[0]
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          const pkg = getPackageName(id)
          if (!pkg) return

          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') {
            return 'react-core'
          }

          if (
            pkg === 'wagmi'
            || pkg === 'viem'
            || pkg === 'abitype'
            || pkg === '@wagmi/core'
            || pkg === '@wagmi/connectors'
          ) {
            return 'web3-core'
          }

          if (pkg === '@tanstack/react-query' || pkg === '@tanstack/query-core') {
            return 'query-core'
          }

          if (pkg === 'axios') {
            return 'data-core'
          }
        },
      },
    },
  },
})
