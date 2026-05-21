import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function redirectAdminBase() {
  return {
    name: 'redirect-admin-base',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname, query = ''] = (req.url || '').split('?');

        if (pathname === '/admin') {
          res.statusCode = 308;
          res.setHeader('Location', `/admin/${query ? `?${query}` : ''}`);
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  base: '/admin/',
  plugins: [redirectAdminBase(), react(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
  },
});
