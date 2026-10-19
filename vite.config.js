import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET;

  return {
    plugins: [react(), ...(env.VITE_DEV_HTTPS === 'true' ? [basicSsl()] : [])],
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      host: true,
      // Encaminha /api para a API local (útil para testar no celular via HTTPS sem mixed content).
      proxy: proxyTarget
        ? { '/api': { target: proxyTarget, changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') } }
        : undefined,
    },
  };
});
