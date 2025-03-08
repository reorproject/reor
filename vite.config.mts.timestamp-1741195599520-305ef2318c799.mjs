// vite.config.mts
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import react from "file:///Users/mohamed/Documents/reor/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/mohamed/Documents/reor/node_modules/vite/dist/node/index.js";
import electron from "file:///Users/mohamed/Documents/reor/node_modules/vite-plugin-electron/dist/index.mjs";
import renderer from "file:///Users/mohamed/Documents/reor/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
import { sentryVitePlugin } from "file:///Users/mohamed/Documents/reor/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { tamaguiPlugin } from "file:///Users/mohamed/Documents/reor/node_modules/@tamagui/vite-plugin/dist/esm/index.mjs";
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
      // tamaguiExtractPlugin(),
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
                "@shm/ui": path.join(__dirname, "src/components/Editor/ui/src"),
                "react-native-svg": "react-native-svg-web"
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
                "@shm/ui": path.join(__dirname, "src/components/Editor/ui/src"),
                "react-native-svg": "react-native-svg-web"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21vaGFtZWQvRG9jdW1lbnRzL3Jlb3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tb2hhbWVkL0RvY3VtZW50cy9yZW9yL3ZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbW9oYW1lZC9Eb2N1bWVudHMvcmVvci92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBybVN5bmMgfSBmcm9tICdub2RlOmZzJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24nXG5pbXBvcnQgcmVuZGVyZXIgZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXInXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbidcbmltcG9ydCB7IHRhbWFndWlQbHVnaW4gfSBmcm9tICdAdGFtYWd1aS92aXRlLXBsdWdpbidcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICd0YWlsd2luZGNzcydcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJ1xuXG4vLyBGb3IgQ29tbW9uSlMgY29tcGF0aWJpbGl0eVxuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ21vZHVsZSdcbmNvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGltcG9ydC5tZXRhLnVybClcbmNvbnN0IHBrZyA9IHJlcXVpcmUoJy4vcGFja2FnZS5qc29uJylcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpXG5cbmNvbnNvbGUubG9nKGBSZXNvbHZlZDogQHNobS91aTpgLCBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9zcmMvY29tcG9uZW50cy9FZGl0b3IvdWkvc3JjL2luZGV4LnRzeCcpKVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCB9KSA9PiB7XG4gIHJtU3luYygnZGlzdC1lbGVjdHJvbicsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KVxuXG4gIGNvbnN0IGlzQnVpbGQgPSBjb21tYW5kID09PSAnYnVpbGQnXG4gIGNvbnN0IHNvdXJjZW1hcCA9IHRydWVcblxuICByZXR1cm4ge1xuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAgICdAc2hhcmVkJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vc2hhcmVkJyksXG4gICAgICAgICdAc2htL3VpJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vc3JjL2NvbXBvbmVudHMvRWRpdG9yL3VpL3NyYycpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IFsnLnRzJywgJy50c3gnLCAnLmpzJywgJy5qc3gnLCAnLmpzb24nXSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICB0YW1hZ3VpUGx1Z2luKHtcbiAgICAgICAgY29uZmlnOiAnLi90YW1hZ3VpLmNvbmZpZy50cycsXG4gICAgICAgIGNvbXBvbmVudHM6IFsndGFtYWd1aSddLFxuICAgICAgfSksXG4gICAgICAvLyB0YW1hZ3VpRXh0cmFjdFBsdWdpbigpLFxuICAgICAgcmVhY3QoKSxcbiAgICAgIGVsZWN0cm9uKFtcbiAgICAgICAge1xuICAgICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vbWFpbi9pbmRleC50cycsXG4gICAgICAgICAgb25zdGFydChvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuVlNDT0RFX0RFQlVHKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbc3RhcnR1cF0gRWxlY3Ryb24gQXBwJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG9wdGlvbnMuc3RhcnR1cCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXRlOiB7XG4gICAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgICBzb3VyY2VtYXAsXG4gICAgICAgICAgICAgIG1pbmlmeTogaXNCdWlsZCxcbiAgICAgICAgICAgICAgb3V0RGlyOiAnZGlzdC1lbGVjdHJvbi9tYWluJyxcbiAgICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbLi4uT2JqZWN0LmtleXMoJ2RlcGVuZGVuY2llcycgaW4gcGtnID8gcGtnLmRlcGVuZGVuY2llcyA6IHt9KSwgJ0BzaGFyZWQvdXRpbHMnXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIGFsaWFzOiB7XG4gICAgICAgICAgICAgICAgJ0BzaGFyZWQnOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnc2hhcmVkJyksXG4gICAgICAgICAgICAgICAgJ0BzaG0vdWknOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMvRWRpdG9yL3VpL3NyYycpLFxuICAgICAgICAgICAgICAgICdyZWFjdC1uYXRpdmUtc3ZnJzogJ3JlYWN0LW5hdGl2ZS1zdmctd2ViJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vcHJlbG9hZC9pbmRleC50cycsXG4gICAgICAgICAgb25zdGFydChvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zLnJlbG9hZCgpXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXRlOiB7XG4gICAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgICBzb3VyY2VtYXA6IHNvdXJjZW1hcCA/ICdpbmxpbmUnIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBtaW5pZnk6IGlzQnVpbGQsXG4gICAgICAgICAgICAgIG91dERpcjogJ2Rpc3QtZWxlY3Ryb24vcHJlbG9hZCcsXG4gICAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWy4uLk9iamVjdC5rZXlzKCdkZXBlbmRlbmNpZXMnIGluIHBrZyA/IHBrZy5kZXBlbmRlbmNpZXMgOiB7fSksICdAc2hhcmVkL3V0aWxzJ10sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgICdAc2hhcmVkJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NoYXJlZCcpLFxuICAgICAgICAgICAgICAgICdAc2htL3VpJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzL0VkaXRvci91aS9zcmMnKSxcbiAgICAgICAgICAgICAgICAncmVhY3QtbmF0aXZlLXN2Zyc6ICdyZWFjdC1uYXRpdmUtc3ZnLXdlYicsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdKSxcbiAgICAgIHJlbmRlcmVyKCksXG4gICAgICBzZW50cnlWaXRlUGx1Z2luKHtcbiAgICAgICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcbiAgICAgICAgb3JnOiAncmVvcicsXG4gICAgICAgIHByb2plY3Q6ICdlbGVjdHJvbicsXG4gICAgICB9KSxcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MsIGF1dG9wcmVmaXhlcl0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOlxuICAgICAgcHJvY2Vzcy5lbnYuVlNDT0RFX0RFQlVHICYmXG4gICAgICAoKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHBrZy5kZWJ1Zy5lbnYuVklURV9ERVZfU0VSVkVSX1VSTClcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBob3N0OiB1cmwuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogK3VybC5wb3J0LFxuICAgICAgICB9XG4gICAgICB9KSgpLFxuICAgIGNsZWFyU2NyZWVuOiBmYWxzZSxcbiAgICBidWlsZDoge1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgIH0sXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJRLFNBQVMsY0FBYztBQUNsUyxPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sY0FBYztBQUNyQixPQUFPLGNBQWM7QUFDckIsU0FBUyx3QkFBd0I7QUFDakMsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxrQkFBa0I7QUFHekIsU0FBUyxxQkFBcUI7QUFicUksSUFBTSwyQ0FBMkM7QUFjcE4sSUFBTUEsV0FBVSxjQUFjLHdDQUFlO0FBQzdDLElBQU0sTUFBTUEsU0FBUSxnQkFBZ0I7QUFDcEMsSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFFN0QsUUFBUSxJQUFJLHNCQUFzQixLQUFLLEtBQUssV0FBVywwQ0FBMEMsQ0FBQztBQUVsRyxJQUFPLHNCQUFRLGFB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
