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
var vite_config_default = defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });
  const isBuild = command === "build";
  const sourcemap = true;
  return {
    resolve: {
      alias: {
        "@": path.join(__dirname, "./src"),
        "@shared": path.join(__dirname, "./shared")
      },
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs"]
    },
    plugins: [
      tamaguiPlugin({
        config: "tamagui.config.ts",
        components: ["tamagui"],
        useReactNativeWebLite: true
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21vaGFtZWQvRG9jdW1lbnRzL3Jlb3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tb2hhbWVkL0RvY3VtZW50cy9yZW9yL3ZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbW9oYW1lZC9Eb2N1bWVudHMvcmVvci92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBybVN5bmMgfSBmcm9tICdub2RlOmZzJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24nXG5pbXBvcnQgcmVuZGVyZXIgZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXInXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbidcbmltcG9ydCB7IHRhbWFndWlQbHVnaW4gfSBmcm9tICdAdGFtYWd1aS92aXRlLXBsdWdpbidcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICd0YWlsd2luZGNzcydcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJ1xuXG4vLyBGb3IgQ29tbW9uSlMgY29tcGF0aWJpbGl0eVxuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ21vZHVsZSdcbmNvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGltcG9ydC5tZXRhLnVybClcbmNvbnN0IHBrZyA9IHJlcXVpcmUoJy4vcGFja2FnZS5qc29uJylcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kIH0pID0+IHtcbiAgcm1TeW5jKCdkaXN0LWVsZWN0cm9uJywgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pXG5cbiAgY29uc3QgaXNCdWlsZCA9IGNvbW1hbmQgPT09ICdidWlsZCdcbiAgY29uc3Qgc291cmNlbWFwID0gdHJ1ZVxuXG4gIHJldHVybiB7XG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgJ0BzaGFyZWQnOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9zaGFyZWQnKSxcbiAgICAgIH0sXG4gICAgICBleHRlbnNpb25zOiBbJy50cycsICcudHN4JywgJy5qcycsICcuanN4JywgJy5qc29uJywgJy5tanMnXSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHRhbWFndWlQbHVnaW4oe1xuICAgICAgICBjb25maWc6ICd0YW1hZ3VpLmNvbmZpZy50cycsXG4gICAgICAgIGNvbXBvbmVudHM6IFsndGFtYWd1aSddLFxuICAgICAgICB1c2VSZWFjdE5hdGl2ZVdlYkxpdGU6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIC8vIHRhbWFndWlFeHRyYWN0UGx1Z2luKCksXG4gICAgICByZWFjdCgpLFxuICAgICAgZWxlY3Ryb24oW1xuICAgICAgICB7XG4gICAgICAgICAgZW50cnk6ICdlbGVjdHJvbi9tYWluL2luZGV4LnRzJyxcbiAgICAgICAgICBvbnN0YXJ0KG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5WU0NPREVfREVCVUcpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tzdGFydHVwXSBFbGVjdHJvbiBBcHAnKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb3B0aW9ucy5zdGFydHVwKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpdGU6IHtcbiAgICAgICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICAgIHNvdXJjZW1hcCxcbiAgICAgICAgICAgICAgbWluaWZ5OiBpc0J1aWxkLFxuICAgICAgICAgICAgICBvdXREaXI6ICdkaXN0LWVsZWN0cm9uL21haW4nLFxuICAgICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsuLi5PYmplY3Qua2V5cygnZGVwZW5kZW5jaWVzJyBpbiBwa2cgPyBwa2cuZGVwZW5kZW5jaWVzIDoge30pLCAnQHNoYXJlZC91dGlscyddLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgICAgICAnQHNoYXJlZCc6IHBhdGguam9pbihfX2Rpcm5hbWUsICdzaGFyZWQnKSxcbiAgICAgICAgICAgICAgICAncmVhY3QtbmF0aXZlLXN2Zyc6ICdyZWFjdC1uYXRpdmUtc3ZnLXdlYicsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL3ByZWxvYWQvaW5kZXgudHMnLFxuICAgICAgICAgIG9uc3RhcnQob3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucy5yZWxvYWQoKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdml0ZToge1xuICAgICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgICAgc291cmNlbWFwOiBzb3VyY2VtYXAgPyAnaW5saW5lJyA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgbWluaWZ5OiBpc0J1aWxkLFxuICAgICAgICAgICAgICBvdXREaXI6ICdkaXN0LWVsZWN0cm9uL3ByZWxvYWQnLFxuICAgICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsuLi5PYmplY3Qua2V5cygnZGVwZW5kZW5jaWVzJyBpbiBwa2cgPyBwa2cuZGVwZW5kZW5jaWVzIDoge30pLCAnQHNoYXJlZC91dGlscyddLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgICAgICAnQHNoYXJlZCc6IHBhdGguam9pbihfX2Rpcm5hbWUsICdzaGFyZWQnKSxcbiAgICAgICAgICAgICAgICAncmVhY3QtbmF0aXZlLXN2Zyc6ICdyZWFjdC1uYXRpdmUtc3ZnLXdlYicsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdKSxcbiAgICAgIHJlbmRlcmVyKCksXG4gICAgICBzZW50cnlWaXRlUGx1Z2luKHtcbiAgICAgICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcbiAgICAgICAgb3JnOiAncmVvcicsXG4gICAgICAgIHByb2plY3Q6ICdlbGVjdHJvbicsXG4gICAgICB9KSxcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MsIGF1dG9wcmVmaXhlcl0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOlxuICAgICAgcHJvY2Vzcy5lbnYuVlNDT0RFX0RFQlVHICYmXG4gICAgICAoKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHBrZy5kZWJ1Zy5lbnYuVklURV9ERVZfU0VSVkVSX1VSTClcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBob3N0OiB1cmwuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogK3VybC5wb3J0LFxuICAgICAgICB9XG4gICAgICB9KSgpLFxuICAgIGNsZWFyU2NyZWVuOiBmYWxzZSxcbiAgICBidWlsZDoge1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgIH0sXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJRLFNBQVMsY0FBYztBQUNsUyxPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sY0FBYztBQUNyQixPQUFPLGNBQWM7QUFDckIsU0FBUyx3QkFBd0I7QUFDakMsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxrQkFBa0I7QUFHekIsU0FBUyxxQkFBcUI7QUFicUksSUFBTSwyQ0FBMkM7QUFjcE4sSUFBTUEsV0FBVSxjQUFjLHdDQUFlO0FBQzdDLElBQU0sTUFBTUEsU0FBUSxnQkFBZ0I7QUFDcEMsSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFFN0QsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxRQUFRLE1BQU07QUFDM0MsU0FBTyxpQkFBaUIsRUFBRSxXQUFXLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFFeEQsUUFBTSxVQUFVLFlBQVk7QUFDNUIsUUFBTSxZQUFZO0FBRWxCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxLQUFLLFdBQVcsT0FBTztBQUFBLFFBQ2pDLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVTtBQUFBLE1BQzVDO0FBQUEsTUFDQSxZQUFZLENBQUMsT0FBTyxRQUFRLE9BQU8sUUFBUSxTQUFTLE1BQU07QUFBQSxJQUM1RDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsY0FBYztBQUFBLFFBQ1osUUFBUTtBQUFBLFFBQ1IsWUFBWSxDQUFDLFNBQVM7QUFBQSxRQUN0Qix1QkFBdUI7QUFBQSxNQUN6QixDQUFDO0FBQUE7QUFBQSxNQUVELE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxPQUFPO0FBQUEsVUFDUCxRQUFRLFNBQVM7QUFDZixnQkFBSSxRQUFRLElBQUksY0FBYztBQUM1QixzQkFBUSxJQUFJLHdCQUF3QjtBQUFBLFlBQ3RDLE9BQU87QUFDTCxzQkFBUSxRQUFRO0FBQUEsWUFDbEI7QUFBQSxVQUNGO0FBQUEsVUFDQSxNQUFNO0FBQUEsWUFDSixPQUFPO0FBQUEsY0FDTDtBQUFBLGNBQ0EsUUFBUTtBQUFBLGNBQ1IsUUFBUTtBQUFBLGNBQ1IsZUFBZTtBQUFBLGdCQUNiLFVBQVUsQ0FBQyxHQUFHLE9BQU8sS0FBSyxrQkFBa0IsTUFBTSxJQUFJLGVBQWUsQ0FBQyxDQUFDLEdBQUcsZUFBZTtBQUFBLGNBQzNGO0FBQUEsWUFDRjtBQUFBLFlBQ0EsU0FBUztBQUFBLGNBQ1AsT0FBTztBQUFBLGdCQUNMLFdBQVcsS0FBSyxLQUFLLFdBQVcsUUFBUTtBQUFBLGdCQUN4QyxvQkFBb0I7QUFBQSxjQUN0QjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE9BQU87QUFBQSxVQUNQLFFBQVEsU0FBUztBQUNmLG9CQUFRLE9BQU87QUFBQSxVQUNqQjtBQUFBLFVBQ0EsTUFBTTtBQUFBLFlBQ0osT0FBTztBQUFBLGNBQ0wsV0FBVyxZQUFZLFdBQVc7QUFBQSxjQUNsQyxRQUFRO0FBQUEsY0FDUixRQUFRO0FBQUEsY0FDUixlQUFlO0FBQUEsZ0JBQ2IsVUFBVSxDQUFDLEdBQUcsT0FBTyxLQUFLLGtCQUFrQixNQUFNLElBQUksZUFBZSxDQUFDLENBQUMsR0FBRyxlQUFlO0FBQUEsY0FDM0Y7QUFBQSxZQUNGO0FBQUEsWUFDQSxTQUFTO0FBQUEsY0FDUCxPQUFPO0FBQUEsZ0JBQ0wsV0FBVyxLQUFLLEtBQUssV0FBVyxRQUFRO0FBQUEsZ0JBQ3hDLG9CQUFvQjtBQUFBLGNBQ3RCO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxTQUFTO0FBQUEsTUFDVCxpQkFBaUI7QUFBQSxRQUNmLFdBQVcsUUFBUSxJQUFJO0FBQUEsUUFDdkIsS0FBSztBQUFBLFFBQ0wsU0FBUztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNQLFNBQVMsQ0FBQyxhQUFhLFlBQVk7QUFBQSxNQUNyQztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQ0UsUUFBUSxJQUFJLGlCQUNYLE1BQU07QUFDTCxZQUFNLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLG1CQUFtQjtBQUNyRCxhQUFPO0FBQUEsUUFDTCxNQUFNLElBQUk7QUFBQSxRQUNWLE1BQU0sQ0FBQyxJQUFJO0FBQUEsTUFDYjtBQUFBLElBQ0YsR0FBRztBQUFBLElBQ0wsYUFBYTtBQUFBLElBQ2IsT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLElBQ2I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicmVxdWlyZSJdCn0K
