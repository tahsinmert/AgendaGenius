import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vite ortamında process.env kullanımını desteklemek için (genellikle önerilmez ama mevcut kod yapısı için eklendi)
    'process.env': process.env
  }
});
