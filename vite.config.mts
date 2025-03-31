import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { tamaguiPlugin } from '@tamagui/vite-plugin'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// For CommonJS compatibility
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true })

  const isBuild = command === 'build'
  const sourcemap = true

  return {
    resolve: {
      alias: {
        '@': path.join(__dirname, './src'),
        '@shared': path.join(__dirname, './shared'),
      },
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    plugins: [
      tamaguiPlugin({
        config: './tamagui.config.ts',
        components: ['tamagui'],
      }),
      // tamaguiExtractPlugin(),
      react(),
      electron([
        {
          entry: 'electron/main/index.ts',
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App')
            } else {
              options.startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: [...Object.keys('dependencies' in pkg ? pkg.dependencies : {}), '@shared/utils'],
              },
            },
            resolve: {
              alias: {
                '@shared': path.join(__dirname, 'shared'),
                'react-native-svg': 'react-native-svg-web',
              },
            },
          },
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(options) {
            options.reload()
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined,
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: [...Object.keys('dependencies' in pkg ? pkg.dependencies : {}), '@shared/utils'],
              },
            },
            resolve: {
              alias: {
                '@shared': path.join(__dirname, 'shared'),
                'react-native-svg': 'react-native-svg-web',
              },
            },
          },
        },
      ]),
      renderer(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'reor',
        project: 'electron',
      }),
    ],
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
        return {
          host: url.hostname,
          port: +url.port,
        }
      })(),
    clearScreen: false,
    build: {
      sourcemap: true,
    },
  }
})
