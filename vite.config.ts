import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { analyzeImageForensics } from './server/detectorService.ts';

dotenv.config();

function sendJson(res: any, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/api/analyze' || req.method !== 'POST') {
          return next();
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { base64Data, mimeType } = JSON.parse(body);
            if (!base64Data) {
              return sendJson(res, 400, { error: 'base64Data is required' });
            }
            const result = await analyzeImageForensics(base64Data, mimeType || 'image/jpeg');
            sendJson(res, 200, result);
          } catch (err: any) {
            sendJson(res, 500, { error: err?.message || 'Failed to process image' });
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
