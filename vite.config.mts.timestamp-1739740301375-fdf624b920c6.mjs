// vite.config.mts
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import react from "file:///Users/mohamed/Documents/reor/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/mohamed/Documents/reor/node_modules/vite/dist/node/index.js";
import electron from "file:///Users/mohamed/Documents/reor/node_modules/vite-plugin-electron/dist/index.mjs";
import renderer from "file:///Users/mohamed/Documents/reor/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
import { sentryVitePlugin } from "file:///Users/mohamed/Documents/reor/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { tamaguiExtractPlugin, tamaguiPlugin } from "file:///Users/mohamed/Documents/reor/node_modules/@tamagui/vite-plugin/dist/esm/index.mjs";
import tailwindcss from "file:///Users/mohamed/Documents/reor/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///Users/mohamed/Documents/reor/node_modules/autoprefixer/lib/autoprefixer.js";
import { createRequire } from "module";
var __vite_injected_original_import_meta_url = "file:///Users/mohamed/Documents/reor/vite.config.mts";
var require2 = createRequire(__vite_injected_original_import_meta_url);
var pkg = require2("./package.json");
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
console.log(`Resolved: @shm/ui:`, path.join(__dirname, "./src/components/Editor/ui/src/index.tsx"));
var vite_config_default = defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });
  const isBuild = command === "build";
  const sourcemap = true;
  return {
    resolve: {
      alias: {
        "@": path.join(__dirname, "./src"),
        "@shared": path.join(__dirname, "./shared"),
        "@shm/ui": path.join(__dirname, "./src/components/Editor/ui/src")
      }
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    plugins: [
      tamaguiPlugin({
        config: "./tamagui.config.ts",
        components: ["tamagui"]
      }),
      tamaguiExtractPlugin(),
      react(),
      electron([
        {
          entry: "electron/main/index.ts",
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log("[startup] Electron App");
            } else {
              options.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: [...Object.keys("dependencies" in pkg ? pkg.dependencies : {}), "@shared/utils"]
              }
            },
            resolve: {
              alias: {
                "@shared": path.join(__dirname, "shared"),
                "@shm/ui": path.join(__dirname, "src/components/Editor/ui/src")
              }
            }
          }
        },
        {
          entry: "electron/preload/index.ts",
          onstart(options) {
            options.reload();
          },
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : void 0,
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: [...Object.keys("dependencies" in pkg ? pkg.dependencies : {}), "@shared/utils"]
              }
            },
            resolve: {
              alias: {
                "@shared": path.join(__dirname, "shared"),
                "@shm/ui": path.join(__dirname, "src/components/Editor/ui/src")
              }
            }
          }
        }
      ]),
      renderer(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "reor",
        project: "electron"
      })
    ],
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer]
      }
    },
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
      return {
        host: url.hostname,
        port: +url.port
      };
    })(),
    clearScreen: false,
    build: {
      sourcemap: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21vaGFtZWQvRG9jdW1lbnRzL3Jlb3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tb2hhbWVkL0RvY3VtZW50cy9yZW9yL3ZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbW9oYW1lZC9Eb2N1bWVudHMvcmVvci92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBybVN5bmMgfSBmcm9tICdub2RlOmZzJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24nXG5pbXBvcnQgcmVuZGVyZXIgZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXInXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbidcbmltcG9ydCB7IHRhbWFndWlFeHRyYWN0UGx1Z2luLCB0YW1hZ3VpUGx1Z2luIH0gZnJvbSAnQHRhbWFndWkvdml0ZS1wbHVnaW4nXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAndGFpbHdpbmRjc3MnXG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcidcblxuLy8gRm9yIENvbW1vbkpTIGNvbXBhdGliaWxpdHlcbmltcG9ydCB7IGNyZWF0ZVJlcXVpcmUgfSBmcm9tICdtb2R1bGUnXG5jb25zdCByZXF1aXJlID0gY3JlYXRlUmVxdWlyZShpbXBvcnQubWV0YS51cmwpXG5jb25zdCBwa2cgPSByZXF1aXJlKCcuL3BhY2thZ2UuanNvbicpXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKVxuXG5jb25zb2xlLmxvZyhgUmVzb2x2ZWQ6IEBzaG0vdWk6YCwgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vc3JjL2NvbXBvbmVudHMvRWRpdG9yL3VpL3NyYy9pbmRleC50c3gnKSlcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQgfSkgPT4ge1xuICBybVN5bmMoJ2Rpc3QtZWxlY3Ryb24nLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSlcblxuICBjb25zdCBpc0J1aWxkID0gY29tbWFuZCA9PT0gJ2J1aWxkJ1xuICBjb25zdCBzb3VyY2VtYXAgPSB0cnVlXG5cbiAgcmV0dXJuIHtcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgICAnQHNoYXJlZCc6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3NoYXJlZCcpLFxuICAgICAgICAnQHNobS91aSc6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzL0VkaXRvci91aS9zcmMnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBleHRlbnNpb25zOiBbJy50cycsICcudHN4JywgJy5qcycsICcuanN4JywgJy5qc29uJ10sXG4gICAgcGx1Z2luczogW1xuICAgICAgdGFtYWd1aVBsdWdpbih7XG4gICAgICAgIGNvbmZpZzogJy4vdGFtYWd1aS5jb25maWcudHMnLFxuICAgICAgICBjb21wb25lbnRzOiBbJ3RhbWFndWknXSxcbiAgICAgIH0pLFxuICAgICAgdGFtYWd1aUV4dHJhY3RQbHVnaW4oKSxcbiAgICAgIHJlYWN0KCksXG4gICAgICBlbGVjdHJvbihbXG4gICAgICAgIHtcbiAgICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4vaW5kZXgudHMnLFxuICAgICAgICAgIG9uc3RhcnQob3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52LlZTQ09ERV9ERUJVRykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW3N0YXJ0dXBdIEVsZWN0cm9uIEFwcCcpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvcHRpb25zLnN0YXJ0dXAoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdml0ZToge1xuICAgICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgICAgc291cmNlbWFwLFxuICAgICAgICAgICAgICBtaW5pZnk6IGlzQnVpbGQsXG4gICAgICAgICAgICAgIG91dERpcjogJ2Rpc3QtZWxlY3Ryb24vbWFpbicsXG4gICAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWy4uLk9iamVjdC5rZXlzKCdkZXBlbmRlbmNpZXMnIGluIHBrZyA/IHBrZy5kZXBlbmRlbmNpZXMgOiB7fSksICdAc2hhcmVkL3V0aWxzJ10sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgICdAc2hhcmVkJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NoYXJlZCcpLFxuICAgICAgICAgICAgICAgICdAc2htL3VpJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzL0VkaXRvci91aS9zcmMnKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vcHJlbG9hZC9pbmRleC50cycsXG4gICAgICAgICAgb25zdGFydChvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zLnJlbG9hZCgpXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXRlOiB7XG4gICAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgICBzb3VyY2VtYXA6IHNvdXJjZW1hcCA/ICdpbmxpbmUnIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBtaW5pZnk6IGlzQnVpbGQsXG4gICAgICAgICAgICAgIG91dERpcjogJ2Rpc3QtZWxlY3Ryb24vcHJlbG9hZCcsXG4gICAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWy4uLk9iamVjdC5rZXlzKCdkZXBlbmRlbmNpZXMnIGluIHBrZyA/IHBrZy5kZXBlbmRlbmNpZXMgOiB7fSksICdAc2hhcmVkL3V0aWxzJ10sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgICdAc2hhcmVkJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NoYXJlZCcpLFxuICAgICAgICAgICAgICAgICdAc2htL3VpJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzL0VkaXRvci91aS9zcmMnKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0pLFxuICAgICAgcmVuZGVyZXIoKSxcbiAgICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgICBhdXRoVG9rZW46IHByb2Nlc3MuZW52LlNFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgICBvcmc6ICdyZW9yJyxcbiAgICAgICAgcHJvamVjdDogJ2VsZWN0cm9uJyxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgY3NzOiB7XG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFt0YWlsd2luZGNzcywgYXV0b3ByZWZpeGVyXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzZXJ2ZXI6XG4gICAgICBwcm9jZXNzLmVudi5WU0NPREVfREVCVUcgJiZcbiAgICAgICgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocGtnLmRlYnVnLmVudi5WSVRFX0RFVl9TRVJWRVJfVVJMKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhvc3Q6IHVybC5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiArdXJsLnBvcnQsXG4gICAgICAgIH1cbiAgICAgIH0pKCksXG4gICAgY2xlYXJTY3JlZW46IGZhbHNlLFxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgfSxcbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlEsU0FBUyxjQUFjO0FBQ2xTLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sY0FBYztBQUNyQixTQUFTLHdCQUF3QjtBQUNqQyxTQUFTLHNCQUFzQixxQkFBcUI7QUFDcEQsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxrQkFBa0I7QUFHekIsU0FBUyxxQkFBcUI7QUFicUksSUFBTSwyQ0FBMkM7QUFjcE4sSUFBTUEsV0FBVSxjQUFjLHdDQUFlO0FBQzdDLElBQU0sTUFBTUEsU0FBUSxnQkFBZ0I7QUFDcEMsSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFFN0QsUUFBUSxJQUFJLHNCQUFzQixLQUFLLEtBQUssV0FBVywwQ0FBMEMsQ0FBQztBQUVsRyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUMzQyxTQUFPLGlCQUFpQixFQUFFLFdBQVcsTUFBTSxPQUFPLEtBQUssQ0FBQztBQUV4RCxRQUFNLFVBQVUsWUFBWTtBQUM1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
