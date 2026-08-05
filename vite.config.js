import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import locator from "vite-react-locator";


// https://vite.dev/config/
export default defineConfig({
  plugins: [locator(), react()],
})
