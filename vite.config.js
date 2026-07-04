import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Replica en desarrollo la función serverless api/detect-watermark.js de Vercel.
function detectApiPlugin(env) {
  return {
    name: 'detect-watermark-api',
    configureServer(server) {
      server.middlewares.use('/api/detect-watermark', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Método no permitido' }))
          return
        }
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          const { handleDetectRequest } = await import('./server/detect-core.js')
          const { status, payload } = await handleDetectRequest(body, env.GEMINI_API_KEY)
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        } catch (err) {
          console.error(err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Error interno' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), detectApiPlugin(env)],
    server: { port: 3000 },
    // ffmpeg.wasm no debe pre-empaquetarse: usa workers propios que rompen con esbuild
    optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
  }
})
