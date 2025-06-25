import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Make environment variables available to the client
    'import.meta.env.VITE_GROK_API_KEY': JSON.stringify(process.env.GROK_API_KEY || "5VMkaqlhev5EHa6xN9rZOA7UX"),
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY || "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"),
    'import.meta.env.VITE_XAI_API_KEY': JSON.stringify(process.env.XAI_API_KEY || "xai-PPB2hCsFLetS3vJ1QKdw7mMidYdcBXH9GrLb6ouEW2BE4zoF834Er5HNgbxZzJ1NsRhOkcrZ3GXwUMZP")
  }
});