import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Match the path aliases defined in tsconfig.app.json
      'shared-types': path.resolve(__dirname, '../shared-types')
    }
  }
})
