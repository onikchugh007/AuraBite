import { createServer } from 'vite'

async function start() {
  const server = await createServer({
    configFile: './vite.config.js',
    server: {
      port: 5173,
      host: true
    }
  })
  await server.listen()
  server.printUrls()
}

start().catch(console.error)
