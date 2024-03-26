module.exports = {
  appId: "org.reorproject.reor",
  asar: true,
  directories: {
    output: "release/${version}",
  },
  files: ["dist-electron/**/*", "dist/**/*"],
  mac: {
    asarUnpack: ["**/*.{node,dll,metal,exp,lib}"],
    artifactName: "${productName}_${version}.${ext}",
    target: ["dmg", "zip"],
    extraResources: [
      {
        from: "./binaries/darwin/",
        to: "binaries",
        filter: ["**/*"],
      },
    ],
  },
  win: {
    artifactName: "${productName}_${version}.${ext}",
    asarUnpack: ["**/*.{node,dll,metal,exp,lib}"],
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    extraResources: [
      {
        from: "./binaries/win32/",
        to: "binaries",
        filter: ["**/*"],
      },
    ],
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
  },
  linux: {
    artifactName: "${productName}_${version}.${ext}",
    asarUnpack: ["**/node_modules/sharp/**"],
    target: [
      {
        target: "AppImage",
      },
    ],
    category: "Utility",
    synopsis: "Short description of your app",
    description: "Full description of your app",
    extraResources: [
      {
        from: "./binaries/linux/",
        to: "binaries",
        filter: ["**/*"],
      },
    ],
  },
  publish: {
    provider: "generic",
    channel: "latest",
    url: "https://github.com/electron-vite/electron-vite-react/releases/download/v0.9.9/",
  },
};
